<template>
  <div class="container mx-auto p-4">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">用户分页测试</h1>
      
      <Card class="mb-6">
        <CardHeader>
          <CardTitle>分页参数</CardTitle>
          <CardDescription>测试不同的分页参数</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label for="page">页码</Label>
              <Input 
                id="page"
                v-model.number="params.page" 
                type="number"
                min="1"
                placeholder="页码"
              />
            </div>
            <div>
              <Label for="pageSize">每页数量</Label>
              <select
                id="pageSize"
                v-model.number="params.pageSize"
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="5">5 条/页</option>
                <option value="10">10 条/页</option>
                <option value="20">20 条/页</option>
                <option value="50">50 条/页</option>
                <option value="100">100 条/页</option>
              </select>
            </div>
            <div>
              <Label for="search">搜索</Label>
              <Input 
                id="search"
                v-model="params.search" 
                placeholder="搜索用户名、姓名或邮箱"
              />
            </div>
            <div>
              <Label for="role">角色</Label>
              <select 
                id="role"
                v-model="params.role" 
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">全部角色</option>
                <option value="admin">管理员</option>
                <option value="user">普通用户</option>
              </select>
            </div>
          </div>
          
          <div class="flex gap-2">
            <Button @click="fetchUsers" :disabled="loading">
              查询用户
            </Button>
            <Button @click="resetParams" variant="outline">
              重置参数
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card v-if="result">
        <CardHeader>
          <CardTitle>查询结果</CardTitle>
          <CardDescription>
            共 {{ result.total }} 条记录，第 {{ result.page }} 页，共 {{ result.totalPages }} 页
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="result.data.length > 0" class="space-y-4">
            <div 
              v-for="user in result.data" 
              :key="user.id"
              class="border rounded-lg p-4"
            >
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div><strong>ID:</strong> {{ user.id }}</div>
                <div><strong>用户名:</strong> {{ user.username }}</div>
                <div><strong>姓名:</strong> {{ user.name }}</div>
                <div><strong>角色:</strong> {{ user.role }}</div>
                <div><strong>邮箱:</strong> {{ user.email || '无' }}</div>
                <div><strong>创建时间:</strong> {{ formatDate(user.created_at) }}</div>
              </div>
            </div>
            
            <!-- 分页控件 -->
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-500">
                显示第 {{ (result.page - 1) * result.pageSize + 1 }} - 
                {{ Math.min(result.page * result.pageSize, result.total) }} 条，
                共 {{ result.total }} 条记录
              </div>
              <div class="flex gap-2">
                <Button 
                  @click="goToPage(result.page - 1)"
                  :disabled="result.page <= 1"
                  variant="outline"
                  size="sm"
                >
                  上一页
                </Button>
                <Button 
                  @click="goToPage(result.page + 1)"
                  :disabled="result.page >= result.totalPages"
                  variant="outline"
                  size="sm"
                >
                  下一页
                </Button>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            没有找到用户数据
          </div>
        </CardContent>
      </Card>

      <Alert v-if="error" variant="destructive" class="mb-6">
        <AlertTriangle class="h-4 w-4" />
        <AlertTitle>查询失败</AlertTitle>
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Alert, AlertTitle, AlertDescription } from '~/components/ui/alert'
import { AlertTriangle } from 'lucide-vue-next'
import type { UserListParams, PaginatedResponse, User } from '~/composables/useUserApi'

const userApi = useUserApi()

const loading = ref(false)
const error = ref<string | null>(null)
const result = ref<PaginatedResponse<User> | null>(null)

const params = reactive<UserListParams>({
  page: 1,
  pageSize: 5,
  search: '',
  role: ''
})

const fetchUsers = async () => {
  loading.value = true
  error.value = null
  
  try {
    result.value = await userApi.getUsersPaginated(params)
  } catch (e: any) {
    error.value = e.message || '查询用户失败'
  } finally {
    loading.value = false
  }
}

const resetParams = () => {
  params.page = 1
  params.pageSize = 5
  params.search = ''
  params.role = ''
  result.value = null
  error.value = null
}

const goToPage = (page: number) => {
  params.page = page
  fetchUsers()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 页面加载时自动查询
onMounted(() => {
  fetchUsers()
})

definePageMeta({
  middleware: ['auth']
})
</script>
