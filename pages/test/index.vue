<template>
  <div class="container mx-auto p-4">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">API 测试页面</h1>

      <!-- 身份验证对比测试 -->
      <Card class="mb-6">
        <CardHeader>
          <CardTitle>🔐 身份验证对比测试</CardTitle>
          <CardDescription>
            对比有无 token 的 API 调用效果，演示身份验证的重要性
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 无 token 测试 -->
            <div class="p-4 border border-red-200 rounded-lg bg-red-50">
              <h4 class="font-medium mb-3 text-red-700">❌ 无 Token (原生 fetch)</h4>
              <div class="space-y-2">
                <Button @click="fetchHello" :disabled="basicLoading" size="sm" variant="outline" class="w-full">
                  Hello API
                </Button>
                <Button @click="fetchAdminInfo" :disabled="basicLoading" size="sm" variant="destructive" class="w-full">
                  管理员接口 (会失败)
                </Button>
              </div>
              <div v-if="basicLoading" class="text-xs text-gray-500 mt-2">加载中...</div>
              <div v-else-if="basicData" class="mt-2 p-2 bg-green-100 rounded text-xs">
                ✅ 成功: {{ JSON.stringify(basicData).substring(0, 50) }}...
              </div>
              <div v-else-if="basicError" class="mt-2 p-2 bg-red-100 rounded text-xs text-red-600">
                ❌ {{ basicError }}
              </div>
            </div>

            <!-- 有 token 测试 -->
            <div class="p-4 border border-green-200 rounded-lg bg-green-50">
              <h4 class="font-medium mb-3 text-green-700">✅ 有 Token (封装 API)</h4>
              <div class="space-y-2">
                <Button @click="testPublicApi" :disabled="loading" size="sm" variant="outline" class="w-full">
                  Hello API
                </Button>
                <Button @click="testGetAdminInfo" :disabled="loading" size="sm" variant="default" class="w-full">
                  管理员接口 (会成功)
                </Button>
              </div>
              <div v-if="loading" class="text-xs text-gray-500 mt-2">加载中...</div>
              <div v-else-if="generalResult || adminResult" class="mt-2 p-2 bg-green-100 rounded text-xs">
                ✅ 成功: {{ JSON.stringify(generalResult || adminResult).substring(0, 50) }}...
              </div>
              <div v-else-if="error" class="mt-2 p-2 bg-red-100 rounded text-xs text-red-600">
                ❌ {{ error }}
              </div>
            </div>
          </div>

          <div class="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            💡 <strong>对比说明：</strong>左侧使用原生 fetch 不携带 token，右侧使用封装 API 自动携带 token。
            可以看到相同的接口在不同认证状态下的不同表现。
          </div>
        </CardContent>
      </Card>

      <!-- 完整功能测试 -->
      <Card class="mb-6">
        <CardHeader>
          <CardTitle>🚀 完整功能测试</CardTitle>
          <CardDescription>测试所有 API 功能（自动携带 token 认证）</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- 用户相关 -->
          <div>
            <h4 class="font-medium mb-3 text-blue-700">👥 用户管理</h4>
            <div class="flex gap-2 flex-wrap">
              <Button @click="testLogin" :disabled="loading" variant="outline">
                登录测试
              </Button>
              <Button @click="testGetUsers" :disabled="loading">
                获取用户列表
              </Button>
              <Button @click="testFilterUsers" :disabled="loading">
                筛选用户
              </Button>
            </div>
          </div>

          <!-- 管理员相关 -->
          <div>
            <h4 class="font-medium mb-3 text-purple-700">⚙️ 系统管理</h4>
            <div class="flex gap-2 flex-wrap">
              <Button @click="testGetAdminInfo" :disabled="loading">
                系统信息
              </Button>
              <Button @click="testGetDashboard" :disabled="loading">
                仪表盘数据
              </Button>
              <Button @click="testGetTables" :disabled="loading">
                数据库表
              </Button>
            </div>
          </div>

          <!-- 菜单相关 -->
          <div>
            <h4 class="font-medium mb-3 text-green-700">📋 菜单管理</h4>
            <div class="flex gap-2 flex-wrap">
              <Button @click="testGetMenus" :disabled="loading">
                菜单列表
              </Button>
              <Button @click="testGetMenuTree" :disabled="loading">
                菜单树
              </Button>
            </div>
          </div>

          <!-- 高级功能 -->
          <div>
            <h4 class="font-medium mb-3 text-orange-700">🔧 高级功能</h4>
            <div class="flex gap-2 flex-wrap">
              <Button @click="testCustomHeaders" :disabled="loading" variant="outline">
                自定义请求头
              </Button>
            </div>
          </div>

          <!-- 结果显示 -->
          <div v-if="userResult || adminResult || menuResult || generalResult" class="p-4 bg-muted rounded-lg">
            <h4 class="font-medium mb-2">API 调用结果:</h4>
            <pre class="text-sm overflow-auto max-h-96">{{ JSON.stringify(userResult || adminResult || menuResult || generalResult, null, 2) }}</pre>
          </div>
        </CardContent>
      </Card>

      <!-- 错误信息 -->
      <Alert v-if="error" variant="destructive" class="mb-6">
        <AlertTriangle class="h-4 w-4" />
        <AlertTitle>API 调用失败</AlertTitle>
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '~/components/ui/alert'
import { AlertTriangle } from 'lucide-vue-next'

// 导入 API 服务
import { useUserApi } from '~/composables/useUserApi'
import { useAdminApi } from '~/composables/useAdminApi'
import { useMenuApi } from '~/composables/useMenuApi'
import { useApi } from '~/composables/useApi'

// 初始化 API 服务
const userApi = useUserApi()
const adminApi = useAdminApi()
const menuApi = useMenuApi()
const api = useApi()

// 基础测试状态（原生 fetch）
const basicLoading = ref(false)
const basicData = ref<any>(null)
const basicError = ref<string | null>(null)

// 封装 API 测试状态
const loading = ref(false)
const error = ref<string | null>(null)
const userResult = ref<any>(null)
const adminResult = ref<any>(null)
const menuResult = ref<any>(null)
const generalResult = ref<any>(null)

// 清除错误和结果
const clearResults = () => {
  error.value = null
  userResult.value = null
  adminResult.value = null
  menuResult.value = null
  generalResult.value = null
}

const clearBasicResults = () => {
  basicError.value = null
  basicData.value = null
}

// 基础测试函数（原生 fetch）
const fetchHello = async () => {
  basicLoading.value = true
  clearBasicResults()

  try {
    const response = await fetch('/api/hello')
    if (!response.ok) {
      throw new Error(`HTTP 错误: ${response.status}`)
    }
    basicData.value = await response.json()
  } catch (e: any) {
    basicError.value = e.message || '调用 API 时发生错误'
  } finally {
    basicLoading.value = false
  }
}

const fetchAdminInfo = async () => {
  basicLoading.value = true
  clearBasicResults()

  try {
    const response = await fetch('/api/admin/info')
    if (!response.ok) {
      throw new Error(`HTTP 错误: ${response.status}`)
    }
    basicData.value = await response.json()
  } catch (e: any) {
    basicError.value = e.message || '调用 API 时发生错误'
  } finally {
    basicLoading.value = false
  }
}



// 用户 API 测试
const testGetUsers = async () => {
  loading.value = true
  clearResults()
  try {
    userResult.value = await userApi.getUsers()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const testFilterUsers = async () => {
  loading.value = true
  clearResults()
  try {
    userResult.value = await userApi.filterUsers({ role: 'admin' })
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const testLogin = async () => {
  loading.value = true
  clearResults()
  try {
    userResult.value = await userApi.login({
      username: 'admin',
      password: 'Admin@123'
    })
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// 管理员 API 测试
const testGetAdminInfo = async () => {
  loading.value = true
  clearResults()
  try {
    adminResult.value = await adminApi.getAdminInfo()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const testGetDashboard = async () => {
  loading.value = true
  clearResults()
  try {
    adminResult.value = await adminApi.getDashboardData()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const testGetTables = async () => {
  loading.value = true
  clearResults()
  try {
    adminResult.value = await adminApi.getDatabaseTables()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// 菜单 API 测试
const testGetMenus = async () => {
  loading.value = true
  clearResults()
  try {
    menuResult.value = await menuApi.getMenus()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const testGetMenuTree = async () => {
  loading.value = true
  clearResults()
  try {
    menuResult.value = await menuApi.getMenuTree()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// 通用 API 测试
const testPublicApi = async () => {
  loading.value = true
  clearResults()
  try {
    generalResult.value = await api.get('/api/hello', { requireAuth: false })
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const testCustomHeaders = async () => {
  loading.value = true
  clearResults()
  try {
    generalResult.value = await api.get('/api/admin/info', {
      headers: {
        'X-Custom-Header': 'test-value'
      }
    })
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// 添加页面元数据
definePageMeta({
  middleware: ['auth']
})
</script> 