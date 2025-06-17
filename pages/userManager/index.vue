<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">用户管理</h1>
        <p class="text-muted-foreground mt-1">管理系统中的所有用户账号</p>
      </div>
      <Button @click="openUserModal()" class="gap-2 relative overflow-hidden group">
        <span class="absolute inset-0 bg-primary/20 w-0 group-hover:w-full transition-all duration-300"></span>
        <Plus class="h-4 w-4" />
        添加用户
      </Button>
    </div>

    <Card>
      <CardHeader class="pb-3">
        <CardTitle>用户列表</CardTitle>
        <CardDescription>
          系统中所有用户的管理界面，您可以在这里添加、编辑和删除用户。
        </CardDescription>
      </CardHeader>
      <CardContent class="p-0">
        <div class="flex flex-col md:flex-row md:items-center justify-between p-4 border-b gap-4">
          <div class="flex items-center gap-2 w-full md:w-72">
            <Search class="h-4 w-4 text-muted-foreground" />
            <Input 
              v-model="searchQuery" 
              placeholder="搜索用户名、姓名或邮箱..." 
              class="h-9"
              @keydown.enter="handleSearch"
            />
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <Select v-model="roleFilter" class="w-full sm:w-40">
              <SelectTrigger class="h-9">
                <SelectValue placeholder="按角色筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部角色</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
                <SelectItem value="user">普通用户</SelectItem>
              </SelectContent>
            </Select>
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                class="h-9 flex-1 sm:flex-none" 
                @click="handleSearch"
                :disabled="isFiltering"
              >
                <Loader2 v-if="isFiltering" class="h-4 w-4 animate-spin mr-2" />
                <FilterIcon v-else class="h-4 w-4 mr-2" />
                筛选
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                class="h-9 flex-1 sm:flex-none" 
                @click="resetFilters"
                :disabled="isFiltering || loading"
              >
                <X class="h-4 w-4 mr-2" />
                重置
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                class="h-9" 
                @click="refreshUsers" 
                :disabled="loading || isRefreshing || isFiltering"
              >
                <RefreshCw class="h-4 w-4" :class="{'animate-spin': isRefreshing}" />
              </Button>
            </div>
          </div>
        </div>
        
        <div v-if="loading && !isRefreshing && !isFiltering" class="flex justify-center items-center h-40">
          <div class="flex flex-col items-center gap-2">
            <Loader2 class="h-8 w-8 animate-spin text-primary" />
            <p class="text-muted-foreground">加载中...</p>
          </div>
        </div>
        
        <div v-else-if="error" class="flex p-4 border-l-4 border-destructive bg-destructive/10 m-4">
          <AlertTriangle class="h-5 w-5 text-destructive mr-2" />
          <div>
            <h3 class="font-medium text-destructive">加载失败</h3>
            <p class="text-destructive/80 text-sm">{{ error }}</p>
            <Button 
              variant="outline"
              size="sm"
              class="mt-2"
              @click="fetchUsers"
            >
              重试
            </Button>
          </div>
        </div>
        
        <div v-else>
          <!-- 筛选中的覆盖加载 - 使用相对定位容器 -->
          <div class="relative min-h-[200px]">
            <div v-if="isFiltering" class="absolute inset-0 bg-background/80 flex items-center justify-center z-10" style="min-height: 200px">
              <div class="flex flex-col items-center gap-2">
                <Loader2 class="h-8 w-8 animate-spin text-primary" />
                <p class="text-muted-foreground">筛选中...</p>
              </div>
            </div>
            
            <Table :class="{ 'opacity-50': isFiltering }">
              <TableHeader>
                <TableRow class="bg-muted/50">
                  <TableHead class="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead>用户信息</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>电子邮箱</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead class="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="user in users" :key="user.id" class="hover:bg-muted/50 transition-colors">
                  <TableCell class="w-12">
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-3">
                      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <UserCircle class="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div class="font-medium">{{ user.name }}</div>
                        <div class="text-xs text-muted-foreground">@{{ user.username }}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center">
                      <span 
                        :class="{
                          'bg-primary/10 text-primary border-primary/20': user.role === 'admin',
                          'bg-muted text-muted-foreground border-muted-foreground/20': user.role === 'user'
                        }"
                        class="px-2 py-1 rounded-full text-xs font-medium border"
                      >
                        {{ user.role === 'admin' ? '管理员' : '普通用户' }}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center">
                      <Mail class="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{{ user.email || '未设置' }}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center">
                      <Calendar class="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{{ formatDate(user.created_at) }}</span>
                    </div>
                  </TableCell>
                  <TableCell class="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" class="h-8 w-8">
                          <MoreHorizontal class="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem @click="openUserModal(user)">
                          <Edit class="mr-2 h-4 w-4" />
                          <span>编辑</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem @click="confirmDeleteUser(user)" class="text-destructive focus:text-destructive">
                          <Trash class="mr-2 h-4 w-4" />
                          <span>删除</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                <TableRow v-if="users.length === 0">
                  <TableCell colspan="6">
                    <div class="flex flex-col items-center py-8">
                      <div v-if="filterApplied">
                        <FileSearch class="h-10 w-10 text-muted-foreground mb-2 mx-auto" />
                        <p class="text-muted-foreground text-center mb-2">没有匹配的用户</p>
                        <div class="text-sm text-center mb-4">
                          <span>当前筛选: </span>
                          <span v-if="searchQuery" class="font-medium">"{{ searchQuery }}"</span>
                          <span v-if="searchQuery && roleFilter !== 'all'"> + </span>
                          <span v-if="roleFilter !== 'all'" class="font-medium">角色: {{ roleFilter === 'admin' ? '管理员' : '普通用户' }}</span>
                        </div>
                        <Button variant="outline" size="sm" class="mx-auto block w-22 whitespace-nowrap" @click="resetFilters">
                          <div class="flex items-center justify-center w-full">
                            <X class="h-4 w-30 mr-1 flex-shrink-0" />
                            <span class="inline-block">清除筛选</span>
                          </div>
                        </Button>
                      </div>
                      <div v-else>
                        <UserX class="h-10 w-10 text-muted-foreground mb-2" />
                        <p class="text-muted-foreground text-center">没有用户数据</p>
                        <Button variant="outline" size="sm" class="mt-4" @click="openUserModal()">
                          <Plus class="h-4 w-4 mr-2" />
                          添加第一个用户
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colspan="6">
                                          <div class="flex items-center justify-between py-4">
                    <div class="text-sm text-muted-foreground">
                      <span v-if="filterApplied">
                        筛选结果: {{ users.length }} 个用户 
                        <Button 
                          variant="link" 
                          class="h-auto p-0 text-sm text-primary" 
                          @click="resetFilters"
                        >
                          <div class="flex items-center">
                            <X class="h-3 w-6 mr-1 flex-shrink-0" />
                            <span class="inline-block">清除筛选 </span>
                          </div>
                        </Button>
                      </span>
                      <span v-else>共 {{ users.length }} 个用户</span>
                    </div>
                      <div class="flex items-center gap-2">
                        <Button variant="outline" size="sm" class="h-8 w-8 p-0" :disabled="true">
                          <ChevronLeft class="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" class="h-8 min-w-[2rem] px-2">
                          1
                        </Button>
                        <Button variant="outline" size="sm" class="h-8 w-8 p-0" :disabled="true">
                          <ChevronRight class="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 用户编辑模态框 -->
    <Sheet v-model:open="isUserModalOpen" class="sheet-animation">
      <SheetContent class="sm:max-w-md p-0 overflow-y-auto" :class="{'sheet-content-show': isUserModalOpen}">
        <div class="flex flex-col h-full">
          <!-- 模态框头部 -->
          <div class="p-6 border-b">
            <div class="flex items-center">
              <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                <UserPlus class="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 class="text-lg font-medium">{{ currentUser.id ? '编辑用户' : '添加用户' }}</h3>
                <p class="text-sm text-muted-foreground">{{ currentUser.id ? '修改用户信息' : '创建新用户账号' }}</p>
              </div>
            </div>
          </div>

          <!-- 表单主体 -->
          <div class="flex-1 overflow-y-auto p-6">
            <form @submit.prevent="saveUser">
              <!-- 基本信息 -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-muted-foreground mb-3">基本信息</h4>
                <div class="space-y-4">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <Label for="username" class="text-sm">
                        用户名 <span class="text-destructive">*</span>
                      </Label>
                    </div>
                    <div class="relative">
                      <Input 
                        id="username" 
                        v-model="currentUser.username" 
                        :disabled="!!currentUser.id"
                        required
                        class="pr-9"
                      />
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                        <AtSign class="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <p class="text-xs text-muted-foreground mt-1">用户登录系统的唯一标识</p>
                  </div>

                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <Label for="name" class="text-sm">
                        姓名 <span class="text-destructive">*</span>
                      </Label>
                    </div>
                    <div class="relative">
                      <Input 
                        id="name" 
                        v-model="currentUser.name" 
                        required
                        class="pr-9"
                      />
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                        <User class="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 安全信息 -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-muted-foreground mb-3">安全信息</h4>
                <div class="space-y-4">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <Label for="password" class="text-sm">
                        密码 <span v-if="!currentUser.id" class="text-destructive">*</span>
                      </Label>
                      <Button 
                        v-if="currentUser.id" 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        class="h-6 px-2 text-xs"
                      >
                        重置密码
                      </Button>
                    </div>
                    <div class="relative">
                      <Input 
                        id="password" 
                        v-model="currentUser.password" 
                        type="password"
                        :placeholder="currentUser.id ? '不修改请留空' : '请输入密码'"
                        :required="!currentUser.id"
                        class="pr-9"
                      />
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                        <LockKeyhole class="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <p v-if="currentUser.id" class="text-xs text-muted-foreground mt-1">如不需要修改密码，请保留为空</p>
                  </div>

                  <div>
                    <Label for="role" class="text-sm mb-2 block">
                      角色 <span class="text-destructive">*</span>
                    </Label>
                    <Select v-model="currentUser.role">
                      <SelectTrigger class="w-full">
                        <SelectValue placeholder="选择角色" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div class="flex items-center">
                            <ShieldAlert class="h-4 w-4 mr-2 text-primary" />
                            <span>管理员</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="user">
                          <div class="flex items-center">
                            <User class="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>普通用户</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <!-- 联系信息 -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-muted-foreground mb-3">联系信息</h4>
                <div>
                  <Label for="email" class="text-sm mb-2 block">电子邮箱</Label>
                  <div class="relative">
                    <Input 
                      id="email" 
                      v-model="currentUser.email" 
                      type="email"
                      class="pr-9"
                    />
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Mail class="h-4 w-4 text-muted-foreground" />
                    </div>
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
            <Button type="button" variant="outline" @click="isUserModalOpen = false">
              取消
            </Button>
            <Button type="button" @click="saveUser" :disabled="saving" class="gap-2">
              <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
              <Save v-else class="h-4 w-4" />
              {{ currentUser.id ? '更新用户' : '创建用户' }}
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
                <p class="text-sm text-muted-foreground">删除用户 "{{ userToDelete?.name }}"</p>
              </div>
            </div>
          </div>
          
          <!-- 内容区域 -->
          <div class="flex-1 p-6">
            <div class="flex items-start p-4 rounded-lg bg-destructive/5 mb-6">
              <AlertTriangle class="h-5 w-5 text-destructive mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 class="font-medium text-destructive mb-1">警告</h4>
                <p class="text-sm text-muted-foreground">删除用户将永久移除其所有数据，包括个人信息和关联权限。此操作不可撤销。</p>
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
            <Button type="button" variant="destructive" @click="deleteUser" :disabled="deleting" class="gap-2">
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
import { ref, onMounted, watch } from 'vue'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '~/components/ui/sheet'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableEmpty, TableCaption, TableFooter } from '~/components/ui/table'
import { Input } from '~/components/ui/input'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { Separator } from '~/components/ui/separator'
import { 
  Plus, Search, FilterIcon, RefreshCw, ChevronLeft, ChevronRight, 
  MoreHorizontal, Edit, Trash, UserCircle, Mail, Calendar, 
  AlertTriangle, Save, Loader2, UserX, LockKeyhole, UserCog, 
  X, AtSign, User, ShieldAlert, UserPlus, FileSearch
} from 'lucide-vue-next'

const { $api } = useNuxtApp()

// 用户类型定义
interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  email?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

// 编辑用户表单数据类型
interface UserFormData {
  id?: number;
  username: string;
  name: string;
  password: string;
  role: string;
  email?: string;
}

// 用户列表数据
const users = ref<User[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const isRefreshing = ref(false)

// 搜索和筛选状态
const searchQuery = ref('')
const roleFilter = ref<string>('all')
const isFiltering = ref(false)
const filterApplied = ref(false)

// 获取所有用户
const fetchUsers = async (isRefresh = false) => {
  if (isRefresh) {
    isRefreshing.value = true
  } else {
    loading.value = true
  }
  
  error.value = null
  filterApplied.value = false
  
  try {
    // 使用 Eden API 客户端获取所有用户
    const response = await fetch('/api/users/list')
    
    if (!response.ok) {
      throw new Error(`HTTP 错误: ${response.status}`)
    }
    
    users.value = await response.json()
  } catch (e: any) {
    error.value = e.message || '获取用户数据失败'
    console.error('获取用户数据失败:', e)
  } finally {
    loading.value = false
    isRefreshing.value = false
  }
}

// 筛选用户
const filterUsers = async () => {
  if (!searchQuery.value && roleFilter.value === 'all') {
    // 如果没有筛选条件，直接获取所有用户
    return fetchUsers()
  }
  
  isFiltering.value = true
  error.value = null
  
  try {
    // 构建查询参数
    const params = new URLSearchParams()
    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }
    if (roleFilter.value !== 'all') {
      params.append('role', roleFilter.value)
    }
    
    // 使用筛选API
    const response = await fetch(`/api/users/filter?${params.toString()}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP 错误: ${response.status}`)
    }
    
    users.value = await response.json()
    filterApplied.value = true
  } catch (e: any) {
    error.value = e.message || '筛选用户失败'
    console.error('筛选用户失败:', e)
  } finally {
    isFiltering.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  filterUsers()
}

// 处理角色过滤变化
watch(roleFilter, () => {
  filterUsers()
})

// 刷新用户列表
const refreshUsers = () => {
  if (filterApplied.value) {
    filterUsers()
  } else {
    fetchUsers(true)
  }
}

// 重置筛选条件
const resetFilters = () => {
  searchQuery.value = ''
  roleFilter.value = 'all'
  fetchUsers()
}

// 用户模态框状态
const isUserModalOpen = ref(false)
const currentUser = ref<UserFormData>({
  username: '',
  name: '',
  password: '',
  role: 'user',
  email: ''
})
const saving = ref(false)
const modalError = ref<string | null>(null)

// 删除确认模态框状态
const isDeleteModalOpen = ref(false)
const userToDelete = ref<User | null>(null)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

// 打开用户编辑模态框
const openUserModal = (user?: User) => {
  modalError.value = null
  
  if (user) {
    // 编辑现有用户
    currentUser.value = {
      id: user.id,
      username: user.username,
      name: user.name,
      password: '', // 不回填密码
      role: user.role,
      email: user.email
    }
  } else {
    // 创建新用户
    currentUser.value = {
      username: '',
      name: '',
      password: '',
      role: 'user',
      email: ''
    }
  }
  
  isUserModalOpen.value = true
}

// 保存用户
const saveUser = async () => {
  saving.value = true
  modalError.value = null
  
  try {
    const url = currentUser.value.id 
      ? `/api/users/${currentUser.value.id}` 
      : '/api/users'
    
    const method = currentUser.value.id ? 'PUT' : 'POST'
    
    // 如果是编辑用户且未填写密码，则不发送密码字段
    const userData: Record<string, any> = { ...currentUser.value }
    if (currentUser.value.id && !userData.password) {
      delete userData.password
    }
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP 错误: ${response.status}`)
    }
    
    // 成功后关闭模态框并刷新用户列表
    isUserModalOpen.value = false
    await refreshUsers()
  } catch (e: any) {
    modalError.value = e.message || '保存用户失败'
  } finally {
    saving.value = false
  }
}

// 确认删除用户
const confirmDeleteUser = (user: User) => {
  userToDelete.value = user
  deleteError.value = null
  isDeleteModalOpen.value = true
}

// 删除用户
const deleteUser = async () => {
  if (!userToDelete.value) return
  
  deleting.value = true
  deleteError.value = null
  
  try {
    const response = await fetch(`/api/users/${userToDelete.value.id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP 错误: ${response.status}`)
    }
    
    // 成功后关闭模态框并刷新用户列表
    isDeleteModalOpen.value = false
    await refreshUsers()
  } catch (e: any) {
    deleteError.value = e.message || '删除用户失败'
  } finally {
    deleting.value = false
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUsers()
})

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

/* 按钮悬停效果 */
:deep(button) {
  transition: all 0.2s ease;
}

:deep(button:hover) {
  transform: translateY(-2px);
}

:deep(.bg-muted\/30) {
  background-color: rgba(var(--color-muted), 0.08);
  border-radius: 8px;
  transition: all 0.2s ease;
}

:deep(.bg-muted\/30:hover) {
  background-color: rgba(var(--color-muted), 0.12);
}
</style> 