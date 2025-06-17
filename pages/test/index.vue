<template>
  <div class="container mx-auto p-4">
    <Card class="w-full max-w-md mx-auto mb-6">
      <CardHeader>
        <CardTitle>Elysia API 测试</CardTitle>
        <CardDescription>使用 shadcn-vue 组件库</CardDescription>
      </CardHeader>
      <CardContent>
        <Button @click="fetchHello" class="mb-4 mr-2">
          调用 Hello API
        </Button>
        <Button @click="fetchAdminInfo" variant="secondary" class="mb-4">
          获取管理系统信息
        </Button>
        <div v-if="loading" class="text-sm text-gray-500">加载中...</div>
        <div v-else-if="data" class="text-sm">
          <pre class="bg-gray-100 p-2 rounded">{{ JSON.stringify(data, null, 2) }}</pre>
        </div>
        <div v-else-if="error" class="text-sm text-red-500">
          {{ error }}
        </div>
      </CardContent>
      <CardFooter class="flex justify-between">
        <p class="text-xs text-gray-500">Powered by Elysia + shadcn-vue</p>
      </CardFooter>
    </Card>
    
    <Card class="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>用户列表</CardTitle>
        <CardDescription>管理接口测试</CardDescription>
      </CardHeader>
      <CardContent>
        <Button @click="fetchUsers" class="mb-4">
          获取用户列表
        </Button>
        <div v-if="usersLoading" class="text-sm text-gray-500">加载中...</div>
        <div v-else-if="users && users.length > 0" class="text-sm">
          <div v-for="user in users" :key="user.id" class="border p-2 mb-2 rounded">
            <div><strong>ID:</strong> {{ user.id }}</div>
            <div><strong>姓名:</strong> {{ user.name }}</div>
            <div><strong>角色:</strong> {{ user.role }}</div>
          </div>
        </div>
        <div v-else-if="usersError" class="text-sm text-red-500">
          {{ usersError }}
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '~/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '~/components/ui/card'

const { $api } = useNuxtApp()
const data = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const users = ref<any[]>([])
const usersLoading = ref(false)
const usersError = ref<string | null>(null)

const fetchHello = async () => {
  loading.value = true
  error.value = null
  data.value = null
  
  try {
    const response = await $api.hello.get()
    
    if (response.error) {
      error.value = '调用 API 失败'
    } else {
      data.value = response.data
    }
  } catch (e: any) {
    error.value = e.message || '调用 API 时发生错误'
  } finally {
    loading.value = false
  }
}

const fetchAdminInfo = async () => {
  loading.value = true
  error.value = null
  data.value = null
  
  try {
    // 直接使用 fetch 请求
    const response = await fetch('/api/admin/info')
    if (!response.ok) {
      throw new Error(`HTTP 错误: ${response.status}`)
    }
    data.value = await response.json()
  } catch (e: any) {
    error.value = e.message || '调用 API 时发生错误'
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  usersLoading.value = true
  usersError.value = null
  users.value = []
  
  try {
    // 直接使用 fetch 请求
    const response = await fetch('/api/admin/users')
    if (!response.ok) {
      throw new Error(`HTTP 错误: ${response.status}`)
    }
    users.value = await response.json()
  } catch (e: any) {
    usersError.value = e.message || '调用 API 时发生错误'
  } finally {
    usersLoading.value = false
  }
}
</script> 