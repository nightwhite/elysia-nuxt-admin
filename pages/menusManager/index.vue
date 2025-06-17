<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">菜单管理</h1>
      <Button @click="openMenuModal()">
        <PlusIcon class="h-4 w-4 mr-2" />
        添加菜单
      </Button>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>菜单列表</CardTitle>
        <CardDescription>
          系统中所有菜单的管理界面，您可以在这里添加、编辑和删除菜单。
        </CardDescription>
      </CardHeader>
      <CardContent class="p-0">
        <div class="flex items-center p-4 border-b">
          <Input placeholder="搜索菜单..." class="max-w-sm" />
        </div>
        <div v-if="loading" class="flex justify-center items-center h-40">
          <div class="text-lg">加载中...</div>
        </div>
        
        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
          {{ error }}
        </div>
        
        <div v-else>
          <Table>
            <TableHeader>
              <TableRow class="bg-muted/50">
                <TableHead class="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>菜单信息</TableHead>
                <TableHead>路径</TableHead>
                <TableHead>图标</TableHead>
                <TableHead>排序</TableHead>
                <TableHead class="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="menu in menus" :key="menu.id" class="hover:bg-muted/50 transition-colors">
                <TableCell class="w-12">
                  <Checkbox />
                </TableCell>
                <TableCell>{{ menu.id }}</TableCell>
                <TableCell>
                  <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <component :is="menu.parent_id ? 'CircleDashed' : 'LayoutDashboard'" 
                        class="h-4 w-4" 
                        :class="menu.parent_id ? 'text-muted-foreground' : 'text-primary'"
                      />
                    </div>
                    <div>
                      <div class="font-medium">{{ menu.title }}</div>
                      <div class="text-xs text-muted-foreground">
                        {{ menu.parent_id ? `子菜单 (父ID: ${menu.parent_id})` : '根菜单' }}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center">
                    <Link class="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{{ menu.path || '无' }}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div v-if="menu.icon" class="flex items-center gap-2">
                    <div class="h-6 w-6 flex items-center justify-center rounded bg-primary/10">
                      <component :is="getIconComponent(menu.icon)" class="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span class="text-sm">{{ menu.icon }}</span>
                  </div>
                  <span v-else class="text-muted-foreground">未设置</span>
                </TableCell>
                <TableCell>
                  <span class="inline-flex items-center justify-center px-2 py-1 rounded-full bg-muted text-xs font-medium">
                    {{ menu.sort_order }}
                  </span>
                </TableCell>
                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" class="h-8 w-8">
                        <MoreHorizontalIcon class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="openMenuModal(menu)">
                        <EditIcon class="mr-2 h-4 w-4" />
                        <span>编辑</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="confirmDeleteMenu(menu)" class="text-destructive focus:text-destructive">
                        <TrashIcon class="mr-2 h-4 w-4" />
                        <span>删除</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              <TableRow v-if="menus.length === 0">
                <TableCell colspan="7">
                  <div class="flex flex-col items-center py-8">
                    <MenuSquare class="h-10 w-10 text-muted-foreground mb-2" />
                    <p class="text-muted-foreground text-center">没有菜单数据</p>
                    <Button variant="outline" size="sm" class="mt-4" @click="openMenuModal()">
                      <PlusIcon class="h-4 w-4 mr-2" />
                      添加第一个菜单
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colspan="7">
                  <div class="flex items-center justify-end space-x-2 py-4">
                    <Button variant="outline" size="sm" class="h-8 w-8 p-0">
                      <span class="sr-only">上一页</span>
                      <ChevronLeftIcon class="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" class="h-8 min-w-[2rem] px-2">
                      1
                    </Button>
                    <Button variant="outline" size="sm" class="h-8 w-8 p-0">
                      <span class="sr-only">下一页</span>
                      <ChevronRightIcon class="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- 菜单树视图 -->
    <Card class="mt-6">
      <CardHeader>
        <CardTitle>菜单树结构</CardTitle>
        <CardDescription>系统菜单的树形结构视图</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex justify-center items-center h-40">
          <div class="text-lg">加载中...</div>
        </div>
        
        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {{ error }}
        </div>
        
        <div v-else>
          <ul class="pl-5 space-y-2">
            <li v-for="item in menuTree" :key="item.id" class="border-l-2 pl-3 py-1">
              <div class="font-medium flex items-center">
                <FolderIcon class="h-4 w-4 mr-2 text-primary" />
                {{ item.title }} 
                <span class="text-gray-500 text-sm ml-2">({{ item.path || '无路径' }})</span>
              </div>
              
              <ul v-if="item.children && item.children.length > 0" class="pl-5 space-y-1 mt-2">
                <li v-for="child in item.children" :key="child.id" class="border-l-2 pl-3 py-1">
                  <div class="flex items-center">
                    <FileIcon class="h-4 w-4 mr-2 text-muted-foreground" />
                    {{ child.title }} 
                    <span class="text-gray-500 text-sm ml-2">({{ child.path || '无路径' }})</span>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <!-- 菜单编辑模态框 -->
    <Sheet v-model:open="isMenuModalOpen" class="sheet-animation">
      <SheetContent class="sm:max-w-md p-0 overflow-y-auto" :class="{'sheet-content-show': isMenuModalOpen}">
        <div class="flex flex-col h-full">
          <!-- 模态框头部 -->
          <div class="p-6 border-b">
            <div class="flex items-center">
              <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                <component :is="currentMenu.id ? 'Edit' : 'ListPlus'" class="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 class="text-lg font-medium">{{ currentMenu.id ? '编辑菜单' : '添加菜单' }}</h3>
                <p class="text-sm text-muted-foreground">{{ currentMenu.id ? '修改菜单信息' : '创建新菜单' }}</p>
              </div>
            </div>
          </div>

          <!-- 表单主体 -->
          <div class="flex-1 overflow-y-auto p-6">
            <form @submit.prevent="saveMenu">
              <!-- 菜单关系 -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-muted-foreground mb-3">菜单关系</h4>
                <div class="space-y-4">
                  <div>
                    <Label for="parent_id" class="text-sm mb-2 block">父级菜单</Label>
                    <Select v-model="currentMenu.parent_id">
                      <SelectTrigger class="w-full">
                        <SelectValue placeholder="选择父级菜单" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem :value="null">
                          <div class="flex items-center">
                            <LayoutDashboard class="h-4 w-4 mr-2 text-primary" />
                            <span>无 (根菜单)</span>
                          </div>
                        </SelectItem>
                        <SelectItem v-for="menu in menus.filter(m => m.id !== currentMenu.id)" :key="menu.id" :value="menu.id">
                          <div class="flex items-center">
                            <CircleDashed class="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{{ menu.title }}</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <!-- 基本信息 -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-muted-foreground mb-3">基本信息</h4>
                <div class="space-y-4">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <Label for="title" class="text-sm">
                        菜单标题 <span class="text-destructive">*</span>
                      </Label>
                    </div>
                    <div class="relative">
                      <Input 
                        id="title" 
                        v-model="currentMenu.title" 
                        required
                        class="pr-9"
                      />
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                        <MenuSquare class="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <Label for="path" class="text-sm">路径</Label>
                    </div>
                    <div class="relative">
                      <Input 
                        id="path" 
                        v-model="currentMenu.path" 
                        placeholder="/dashboard"
                        class="pr-9"
                      />
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                        <Link class="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <p class="text-xs text-muted-foreground mt-1">菜单链接的路由路径</p>
                  </div>
                </div>
              </div>

              <!-- 显示设置 -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-muted-foreground mb-3">显示设置</h4>
                <div class="space-y-4">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <Label for="icon" class="text-sm">图标</Label>
                    </div>
                    <div class="relative">
                      <Input 
                        id="icon" 
                        v-model="currentMenu.icon" 
                        placeholder="LayoutDashboard"
                        class="pr-9"
                      />
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                        <IconsIcon class="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <p class="text-xs text-muted-foreground mt-1">使用Lucide图标名称</p>
                  </div>

                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <Label for="sort_order" class="text-sm">
                        排序 <span class="text-destructive">*</span>
                      </Label>
                    </div>
                    <div class="relative">
                      <Input 
                        id="sort_order" 
                        v-model="currentMenu.sort_order" 
                        type="number"
                        required
                        class="pr-9"
                      />
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                        <ArrowUpDown class="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <p class="text-xs text-muted-foreground mt-1">数字越小排序越靠前</p>
                  </div>
                </div>
              </div>

              <div v-if="modalError" class="flex p-4 border-l-4 border-destructive bg-destructive/10 rounded mb-6">
                <AlertTriangle class="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
                <p class="text-destructive text-sm">{{ modalError }}</p>
              </div>
            </form>
          </div>

          <!-- 模态框底部 -->
          <div class="p-4 bg-muted/30 border-t flex items-center justify-end gap-2">
            <Button type="button" variant="outline" @click="isMenuModalOpen = false">
              取消
            </Button>
            <Button type="button" @click="saveMenu" :disabled="saving" class="gap-2">
              <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
              <Save v-else class="h-4 w-4" />
              {{ currentMenu.id ? '更新菜单' : '创建菜单' }}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>

    <!-- 删除确认模态框 -->
    <Sheet v-model:open="isDeleteModalOpen" class="sheet-animation">
      <SheetContent class="sm:max-w-md p-0" :class="{'sheet-content-show': isDeleteModalOpen}">
        <div class="flex flex-col h-full">
          <!-- 模态框头部 -->
          <div class="p-6 border-b">
            <div class="flex items-center">
              <div class="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center mr-4">
                <Trash class="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 class="text-lg font-medium">确认删除</h3>
                <p class="text-sm text-muted-foreground">删除菜单 "{{ menuToDelete?.title }}"</p>
              </div>
            </div>
          </div>
          
          <!-- 内容区域 -->
          <div class="flex-1 p-6">
            <div class="flex items-start p-4 rounded-lg bg-destructive/5 mb-6">
              <AlertTriangle class="h-5 w-5 text-destructive mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 class="font-medium text-destructive mb-1">警告</h4>
                <p class="text-sm text-muted-foreground">删除菜单将永久移除此菜单项及其配置。如果此菜单有子菜单，则无法删除。此操作不可撤销。</p>
              </div>
            </div>
            
            <div v-if="deleteError" class="flex p-4 border-l-4 border-destructive bg-destructive/10 rounded mb-6">
              <AlertTriangle class="h-5 w-5 text-destructive mr-2 flex-shrink-0" />
              <p class="text-destructive text-sm">{{ deleteError }}</p>
            </div>
          </div>
          
          <!-- 模态框底部 -->
          <div class="p-4 bg-muted/30 border-t flex items-center justify-end gap-2">
            <Button type="button" variant="outline" @click="isDeleteModalOpen = false">
              取消
            </Button>
            <Button type="button" variant="destructive" @click="deleteMenu" :disabled="deleting" class="gap-2">
              <Loader2 v-if="deleting" class="h-4 w-4 animate-spin" />
              <Trash v-else class="h-4 w-4" />
              确认删除
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '~/components/ui/sheet'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableEmpty, TableCaption, TableFooter } from '~/components/ui/table'
import { Input } from '~/components/ui/input'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'

// 图标导入 - 修复从lucide-vue-next导入
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  MoreHorizontalIcon, 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  File as FileIcon,
  LayoutDashboard,
  CircleDashed,
  MenuSquare,
  Link,
  Settings as IconsIcon,
  ArrowUpDown,
  AlertTriangle,
  Save,
  Loader2,
  Trash,
  ListPlus,
  Edit
} from 'lucide-vue-next'

// 菜单类型定义
interface Menu {
  id: number;
  parent_id: number | null;
  title: string;
  path: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface MenuTreeItem extends Menu {
  children: MenuTreeItem[];
}

// 编辑菜单表单数据类型
interface MenuFormData {
  id?: number;
  parent_id: number | null;
  title: string;
  path: string;
  icon: string;
  sort_order: number;
}

// 菜单列表数据
const menus = ref<Menu[]>([])
const menuTree = ref<MenuTreeItem[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// 菜单模态框状态
const isMenuModalOpen = ref(false)
const currentMenu = ref<MenuFormData>({
  parent_id: null,
  title: '',
  path: '',
  icon: '',
  sort_order: 0
})
const saving = ref(false)
const modalError = ref<string | null>(null)

// 删除确认模态框状态
const isDeleteModalOpen = ref(false)
const menuToDelete = ref<Menu | null>(null)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

// 获取所有菜单
const fetchMenus = async () => {
  loading.value = true
  error.value = null
  
  try {
    const [menuResponse, treeResponse] = await Promise.all([
      fetch('/api/menus'),
      fetch('/api/menus/tree')
    ])
    
    if (!menuResponse.ok || !treeResponse.ok) {
      throw new Error(`HTTP 错误: ${menuResponse.status || treeResponse.status}`)
    }
    
    menus.value = await menuResponse.json()
    menuTree.value = await treeResponse.json()
  } catch (e: any) {
    error.value = e.message || '获取菜单数据失败'
  } finally {
    loading.value = false
  }
}

// 打开菜单编辑模态框
const openMenuModal = (menu?: Menu) => {
  modalError.value = null
  
  if (menu) {
    // 编辑现有菜单
    currentMenu.value = {
      id: menu.id,
      parent_id: menu.parent_id,
      title: menu.title,
      path: menu.path || '',
      icon: menu.icon || '',
      sort_order: menu.sort_order
    }
  } else {
    // 创建新菜单
    currentMenu.value = {
      parent_id: null,
      title: '',
      path: '',
      icon: '',
      sort_order: 0
    }
  }
  
  isMenuModalOpen.value = true
}

// 保存菜单
const saveMenu = async () => {
  saving.value = true
  modalError.value = null
  
  try {
    const url = currentMenu.value.id 
      ? `/api/menus/${currentMenu.value.id}` 
      : '/api/menus'
    
    const method = currentMenu.value.id ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(currentMenu.value)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP 错误: ${response.status}`)
    }
    
    // 成功后关闭模态框并刷新菜单列表
    isMenuModalOpen.value = false
    await fetchMenus()
  } catch (e: any) {
    modalError.value = e.message || '保存菜单失败'
  } finally {
    saving.value = false
  }
}

// 确认删除菜单
const confirmDeleteMenu = (menu: Menu) => {
  menuToDelete.value = menu
  deleteError.value = null
  isDeleteModalOpen.value = true
}

// 删除菜单
const deleteMenu = async () => {
  if (!menuToDelete.value) return
  
  deleting.value = true
  deleteError.value = null
  
  try {
    const response = await fetch(`/api/menus/${menuToDelete.value.id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP 错误: ${response.status}`)
    }
    
    // 成功后关闭模态框并刷新菜单列表
    isDeleteModalOpen.value = false
    await fetchMenus()
  } catch (e: any) {
    deleteError.value = e.message || '删除菜单失败'
  } finally {
    deleting.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchMenus()
})

// 获取图标组件
const getIconComponent = (iconName: string) => {
  // 尝试从已导入的图标中查找
  const iconMap: Record<string, any> = {
    LayoutDashboard,
    CircleDashed,
    MenuSquare,
    Link,
    Settings: IconsIcon,
    ArrowUpDown,
    AlertTriangle,
    Save,
    Loader2,
    Trash,
    ListPlus,
    Edit,
    PlusIcon,
    EditIcon,
    TrashIcon,
    MoreHorizontalIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    FolderIcon,
    FileIcon
  }
  
  return iconMap[iconName] || 'div' // 如果找不到图标，返回一个空的div
}

// 添加登录验证
definePageMeta({
  middleware: ['auth']
})
</script>

<style scoped>
.sheet-animation {
  --sheet-animation-duration: 300ms;
}

.sheet-content-show {
  animation: sheet-content-slide-in var(--sheet-animation-duration) cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-radius: 12px 0 0 12px;
  border-left: 1px solid rgba(var(--color-border), 0.2);
}

@keyframes sheet-content-slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

:deep(.sheet-content-show form) {
  animation: form-fade-in 500ms ease-out;
}

@keyframes form-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.sheet-content-show .space-y-4),
:deep(.sheet-content-show .space-y-5) {
  animation-name: stagger-fade-in;
  animation-duration: 400ms;
  animation-fill-mode: both;
  animation-timing-function: ease-out;
}

:deep(.sheet-content-show .space-y-4 > *),
:deep(.sheet-content-show .space-y-5 > *) {
  animation-name: stagger-fade-in;
  animation-duration: 400ms;
  animation-fill-mode: both;
  animation-timing-function: ease-out;
}

:deep(.sheet-content-show .space-y-4 > *:nth-child(1)),
:deep(.sheet-content-show .space-y-5 > *:nth-child(1)) { animation-delay: 100ms; }
:deep(.sheet-content-show .space-y-4 > *:nth-child(2)),
:deep(.sheet-content-show .space-y-5 > *:nth-child(2)) { animation-delay: 200ms; }
:deep(.sheet-content-show .space-y-4 > *:nth-child(3)),
:deep(.sheet-content-show .space-y-5 > *:nth-child(3)) { animation-delay: 300ms; }
:deep(.sheet-content-show .space-y-4 > *:nth-child(4)),
:deep(.sheet-content-show .space-y-5 > *:nth-child(4)) { animation-delay: 400ms; }

@keyframes stagger-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 