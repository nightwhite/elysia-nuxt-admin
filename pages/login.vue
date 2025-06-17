<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <Card class="w-full max-w-md">
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">管理系统登录</CardTitle>
        <CardDescription>
          请输入您的账号和密码登录系统
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-2">
            <Label for="username">用户名</Label>
            <Input
              id="username"
              v-model="username"
              type="text"
              placeholder="请输入用户名"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="password">密码</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="请输入密码"
              required
            />
          </div>
          <Alert v-if="error" variant="destructive">
            <AlertTitle>登录失败</AlertTitle>
            <AlertDescription>
              {{ error }}
            </AlertDescription>
          </Alert>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p class="text-sm text-muted-foreground">
          默认账号: admin 密码: admin123
        </p>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { Button } from '~/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Alert, AlertTitle, AlertDescription } from '~/components/ui/alert'

definePageMeta({
  layout: false,
})

const router = useRouter()
const { login, isAuthenticated } = useAuth()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

// 检查用户是否已登录，如果已登录则重定向到仪表盘
onMounted(() => {
  if (isAuthenticated.value) {
    router.push('/dashboard')
  }
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || '登录失败')
    }
    
    // 使用 useAuth 钩子进行登录
    login(data.user, data.token)
    
    // 重定向到仪表盘
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.message || '登录失败，请检查账号密码'
  } finally {
    loading.value = false
  }
}
</script> 