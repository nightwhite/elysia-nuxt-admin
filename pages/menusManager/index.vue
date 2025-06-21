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
        <div v-if="loading" class="flex justify-center items-center h-40">
          <div class="text-lg">加载中...</div>
        </div>
        
        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
          {{ error }}
        </div>
        
        <div v-else>
          <MenuList 
            :menus="menus" 
            @edit="openMenuModal"
            @delete="confirmDeleteMenu"
            @add="openMenuModal()"
          />
        </div>
      </CardContent>
    </Card>

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
          <MenuTree :menu-tree="menuTree" />
        </div>
      </CardContent>
    </Card>

    <Sheet v-model:open="isMenuModalOpen">
      <SheetContent class="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{{ currentMenu.id ? '编辑菜单' : '添加菜单' }}</SheetTitle>
          <SheetDescription>{{ currentMenu.id ? '修改菜单信息' : '创建新菜单' }}</SheetDescription>
        </SheetHeader>
        <div class="flex flex-col h-full">
          <div class="flex-1 overflow-y-auto p-6">
            <MenuForm
              v-model:menu="currentMenu"
              :all-menus="menus"
              :error="modalError"
              @save="saveMenu"
            />
          </div>

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

    <Sheet v-model:open="isDeleteModalOpen">
      <SheetContent class="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>确认删除</SheetTitle>
          <SheetDescription>删除菜单 "{{ menuToDelete?.title }}"</SheetDescription>
        </SheetHeader>
        <div class="flex flex-col h-full">
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
import { AlertTriangle, Save, Loader2, Trash, PlusIcon } from 'lucide-vue-next'
import type { Menu } from '~/types/menu'
import { useMenuApi } from '~/composables/useMenuApi'

// 导入拆分的组件
import MenuList from '~/components/menuManager/MenuList.vue'
import MenuTree from '~/components/menuManager/MenuTree.vue'
import MenuForm from '~/components/menuManager/MenuForm.vue'

// 使用统一的类型定义
import type { MenuTreeItem } from '~/types/menu'

const menus = ref<Menu[]>([])
const menuTree = ref<MenuTreeItem[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const isMenuModalOpen = ref(false)
const currentMenu = ref<Partial<Menu>>({
  parent_id: null,
  title: '',
  path: '',
  icon: null,
  sort_order: 0
})
const saving = ref(false)
const modalError = ref<string | null>(null)

const isDeleteModalOpen = ref(false)
const menuToDelete = ref<Menu | null>(null)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

const fetchMenus = async () => {
  loading.value = true
  error.value = null

  try {
    const menuApi = useMenuApi()
    const [menuResponse, treeResponse] = await Promise.all([
      menuApi.getMenus(),
      menuApi.getMenuTree()
    ])

    menus.value = menuResponse
    menuTree.value = treeResponse as MenuTreeItem[]
  } catch (e: any) {
    error.value = e.message || '获取菜单数据失败'
  } finally {
    loading.value = false
  }
}

const openMenuModal = (menu?: Menu) => {
  modalError.value = null
  
  if (menu) {
    currentMenu.value = {
      id: menu.id,
      parent_id: menu.parent_id,
      title: menu.title,
      path: menu.path || '',
      icon: menu.icon || null,
      sort_order: menu.sort_order
    }
  } else {
    currentMenu.value = {
      parent_id: null,
      title: '',
      path: '',
      icon: null,
      sort_order: 0
    }
  }
  
  isMenuModalOpen.value = true
}

const saveMenu = async () => {
  saving.value = true
  modalError.value = null

  try {
    const menuApi = useMenuApi()
    const message = useMessage()

    // 构建符合类型要求的数据对象
    const menuData = {
      parent_id: currentMenu.value.parent_id,
      title: currentMenu.value.title || '',
      path: currentMenu.value.path || '',
      icon: currentMenu.value.icon || undefined,
      sort_order: currentMenu.value.sort_order
    }

    if (currentMenu.value.id) {
      // 更新菜单
      await menuApi.updateMenu(currentMenu.value.id, menuData)
      message.success('更新成功', `菜单 "${currentMenu.value.title}" 已更新`)
    } else {
      // 创建菜单
      await menuApi.createMenu(menuData)
      message.success('创建成功', `菜单 "${currentMenu.value.title}" 已创建`)
    }

    isMenuModalOpen.value = false
    await fetchMenus()
  } catch (e: any) {
    modalError.value = e.message || '保存菜单失败'
    const message = useMessage()
    message.error('操作失败', e.message || '保存菜单失败')
  } finally {
    saving.value = false
  }
}

const confirmDeleteMenu = (menu: Menu) => {
  menuToDelete.value = menu
  deleteError.value = null
  isDeleteModalOpen.value = true
}

const deleteMenu = async () => {
  if (!menuToDelete.value) return

  deleting.value = true
  deleteError.value = null

  try {
    const menuApi = useMenuApi()
    const message = useMessage()

    if (menuToDelete.value?.id) {
      const menuTitle = menuToDelete.value.title
      await menuApi.deleteMenu(menuToDelete.value.id)
      message.success('删除成功', `菜单 "${menuTitle}" 已删除`)
    }

    isDeleteModalOpen.value = false
    await fetchMenus()
  } catch (e: any) {
    deleteError.value = e.message || '删除菜单失败'
    const message = useMessage()
    message.error('删除失败', e.message || '删除菜单失败')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchMenus()
})

definePageMeta({
  middleware: ['auth']
})
</script>

<style scoped>
.sheet-content-show {
  border-radius: 12px 0 0 12px;
  border-left: 1px solid rgba(var(--color-border), 0.2);
}
</style> 