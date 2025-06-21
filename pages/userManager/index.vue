<template>
  <div class="container mx-auto p-4">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl md:text-3xl font-bold mb-6">用户管理</h1>

      <Card>
        <CardHeader>
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle class="text-lg md:text-xl">用户列表</CardTitle>
              <CardDescription class="text-sm">管理系统用户账号和权限</CardDescription>
            </div>
            <Button @click="openUserModal()" class="gap-2 w-full md:w-auto">
              <Plus class="h-4 w-4" />
              添加用户
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <!-- 搜索和筛选组件 -->
          <UserFilters
            ref="filtersRef"
            :loading="loading"
            :is-refreshing="isRefreshing"
            :is-filtering="isFiltering"
            :initial-search="searchQuery"
            :initial-role="roleFilter"
            @search="handleSearch"
            @filter-change="handleFilterChange"
            @refresh="refreshUsers"
          />

          <!-- 用户表格组件 -->
          <UserTable
            :users="users"
            :loading="loading"
            :error="error"
            :filter-applied="filterApplied"
            @edit-user="openUserModal"
            @delete-user="confirmDeleteUser"
            @add-user="openUserModal"
            @reset-filters="resetFilters"
            @retry="fetchUsers"
          />

          <!-- 分页控件组件 -->
          <div class="border-t">
            <PaginationControls
              :pagination="pagination"
              :filter-applied="filterApplied"
              @go-to-page="goToPage"
              @change-page-size="changePageSize"
              @reset-filters="resetFilters"
            />
          </div>
        </CardContent>
      </Card>

      <!-- 用户编辑/创建模态框 -->
      <UserModal
        v-model:is-open="isUserModalOpen"
        :user="currentUser"
        :saving="saving"
        :error="modalError"
        @save="saveUser"
      />

      <!-- 删除确认模态框 -->
      <DeleteConfirmModal
        v-model:is-open="isDeleteModalOpen"
        :user="userToDelete"
        :deleting="deleting"
        :error="deleteError"
        @confirm="deleteUser"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Plus } from 'lucide-vue-next'

// 导入组件
import UserFilters from '~/components/user/UserFilters.vue'
import UserTable from '~/components/user/UserTable.vue'
import PaginationControls from '~/components/user/PaginationControls.vue'
import UserModal from '~/components/user/UserModal.vue'
import DeleteConfirmModal from '~/components/user/DeleteConfirmModal.vue'

// 导入用户类型和API
import { useUserApi } from '~/composables/useUserApi'
import type { User, UserListParams } from '~/composables/useUserApi'

const userApi = useUserApi()

// 用户表单数据类型
interface UserFormData {
  id?: number
  username: string
  name: string
  password: string
  role: string
  email?: string
}

// 用户列表数据
const users = ref<User[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const isRefreshing = ref(false)

// 分页状态
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
})

// 搜索和筛选状态
const searchQuery = ref('')
const roleFilter = ref<string>('all')
const isFiltering = ref(false)
const filterApplied = ref(false)

// 用户模态框状态
const isUserModalOpen = ref(false)
const currentUser = ref<User | null>(null)
const saving = ref(false)
const modalError = ref<string | null>(null)

// 删除确认模态框状态
const isDeleteModalOpen = ref(false)
const userToDelete = ref<User | null>(null)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

// 组件引用
const filtersRef = ref()

// 获取用户列表（分页）
const fetchUsers = async (isRefresh = false, page?: number) => {
  if (isRefresh) {
    isRefreshing.value = true
  } else {
    loading.value = true
  }

  error.value = null
  filterApplied.value = false

  try {
    const params: UserListParams = {
      page: page || pagination.value.page,
      pageSize: pagination.value.pageSize
    }
    
    const result = await userApi.getUsersPaginated(params)
    users.value = result.data
    pagination.value = {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: result.totalPages
    }
  } catch (e: any) {
    error.value = e.message || '获取用户数据失败'
    console.error('获取用户数据失败:', e)
  } finally {
    loading.value = false
    isRefreshing.value = false
  }
}

// 筛选用户
const filterUsers = async (page?: number) => {
  if (!searchQuery.value && roleFilter.value === 'all') {
    return fetchUsers(false, page)
  }

  isFiltering.value = true
  error.value = null

  try {
    const params: UserListParams = {
      page: page || pagination.value.page,
      pageSize: pagination.value.pageSize,
      search: searchQuery.value || undefined,
      role: roleFilter.value === 'all' ? undefined : roleFilter.value
    }

    const result = await userApi.getUsersPaginated(params)
    users.value = result.data
    pagination.value = {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: result.totalPages
    }
    filterApplied.value = true
  } catch (e: any) {
    error.value = e.message || '筛选用户失败'
    console.error('筛选用户失败:', e)
  } finally {
    isFiltering.value = false
  }
}

// 处理搜索
const handleSearch = (query: string) => {
  searchQuery.value = query
  pagination.value.page = 1
  filterUsers(1)
}

// 处理筛选变化
const handleFilterChange = () => {
  if (filtersRef.value) {
    searchQuery.value = filtersRef.value.searchQuery
    roleFilter.value = filtersRef.value.roleFilter
  }
  pagination.value.page = 1
  filterUsers(1)
}

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
  if (filtersRef.value) {
    filtersRef.value.resetFilters()
  }
  searchQuery.value = ''
  roleFilter.value = 'all'
  pagination.value.page = 1
  fetchUsers()
}

// 分页控制
const goToPage = (page: number) => {
  if (page < 1 || page > pagination.value.totalPages) return
  
  pagination.value.page = page
  if (filterApplied.value) {
    filterUsers(page)
  } else {
    fetchUsers(false, page)
  }
}

// 切换分页大小
const changePageSize = (newPageSize: number) => {
  pagination.value.pageSize = newPageSize
  pagination.value.page = 1
  
  if (filterApplied.value) {
    filterUsers(1)
  } else {
    fetchUsers(false, 1)
  }
}

// 打开用户编辑模态框
const openUserModal = (user?: User) => {
  currentUser.value = user || null
  modalError.value = null
  isUserModalOpen.value = true
}

// 保存用户
const saveUser = async (data: UserFormData) => {
  saving.value = true
  modalError.value = null

  try {
    if (data.id) {
      // 更新用户
      const updateData: any = {
        username: data.username,
        name: data.name,
        role: data.role,
        email: data.email
      }
      if (data.password) {
        updateData.password = data.password
      }
      await userApi.updateUser(data.id, updateData)
      
      const message = useMessage()
      message.success('更新成功', `用户 "${data.name}" 信息已更新`)
    } else {
      // 创建用户
      await userApi.createUser(data)
      
      const message = useMessage()
      message.success('创建成功', `用户 "${data.name}" 已创建`)
    }

    isUserModalOpen.value = false
    refreshUsers()
  } catch (e: any) {
    modalError.value = e.message || '保存用户失败'
    
    const message = useMessage()
    message.error('操作失败', e.message || '保存用户失败')
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
    const userName = userToDelete.value.name
    await userApi.deleteUser(userToDelete.value.id)

    const message = useMessage()
    message.success('删除成功', `用户 "${userName}" 已删除`)

    isDeleteModalOpen.value = false
    refreshUsers()
  } catch (e: any) {
    deleteError.value = e.message || '删除用户失败'
    
    const message = useMessage()
    message.error('删除失败', e.message || '删除用户失败')
  } finally {
    deleting.value = false
  }
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
