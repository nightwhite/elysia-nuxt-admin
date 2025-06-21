<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">系统仪表盘</h1>
    
    <div v-if="loading" class="flex justify-center items-center h-40">
      <div class="text-lg">加载中...</div>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>
    
    <div v-else>
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-lg">用户数量</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold">{{ dashboardData.stats.userCount }}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-lg">菜单数量</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold">{{ dashboardData.stats.menuCount }}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-lg">角色数量</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold">{{ dashboardData.stats.roleCount }}</div>
          </CardContent>
        </Card>
      </div>
      
      <!-- 最近用户 -->
      <Card>
        <CardHeader>
          <CardTitle>最近添加的用户</CardTitle>
          <CardDescription>系统中最近注册的5个用户</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border p-2 text-left">ID</th>
                  <th class="border p-2 text-left">用户名</th>
                  <th class="border p-2 text-left">姓名</th>
                  <th class="border p-2 text-left">角色</th>
                  <th class="border p-2 text-left">创建时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in dashboardData.recentUsers" :key="user.id" class="hover:bg-gray-50">
                  <td class="border p-2">{{ user.id }}</td>
                  <td class="border p-2">{{ user.username }}</td>
                  <td class="border p-2">{{ user.name }}</td>
                  <td class="border p-2">{{ user.role }}</td>
                  <td class="border p-2">{{ formatDate(user.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline">
            <NuxtLink to="/userManager">
              查看所有用户
            </NuxtLink>
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '~/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '~/components/ui/card'
import { useAdminApi } from '~/composables/useAdminApi'

// 定义数据结构
interface DashboardData {
  stats: {
    userCount: number;
    menuCount: number;
    roleCount: number;
  };
  recentUsers: Array<{
    id: number;
    username: string;
    name: string;
    role: string;
    created_at: string;
  }>;
}

const dashboardData = ref<DashboardData>({
  stats: {
    userCount: 0,
    menuCount: 0,
    roleCount: 0
  },
  recentUsers: []
})
const loading = ref(true)
const error = ref<string | null>(null)

// 获取仪表盘数据
const fetchDashboardData = async () => {
  loading.value = true
  error.value = null

  try {
    const adminApi = useAdminApi()
    dashboardData.value = await adminApi.getDashboardData()
  } catch (e: any) {
    error.value = e.message || '获取数据失败'
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchDashboardData()
})

// 添加登录验证
definePageMeta({
  middleware: ['auth']
})
</script> 