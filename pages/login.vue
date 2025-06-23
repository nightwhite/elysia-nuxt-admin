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
              autocomplete="username"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="password">密码</Label>
            <div class="relative">
              <Input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                autocomplete="current-password"
                required
                class="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="!showPassword" class="h-4 w-4 text-muted-foreground" />
                <EyeOff v-else class="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex flex-col space-y-2">
        <p class="text-sm text-muted-foreground">
          默认账号: admin 密码: Admin@123
        </p>
        <p class="text-xs text-muted-foreground text-center">
          {{ systemCopyright }}
        </p>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useMessage } from '~/composables/useMessage'
import { Button } from '~/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Eye, EyeOff } from 'lucide-vue-next'

definePageMeta({
  layout: false,
})

const router = useRouter()
const { login, isAuthenticated } = useAuth()
const message = useMessage()
const { systemCopyright } = useSystemConfig()
const username = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)
const loginAttempts = ref(0)

// 检查用户是否已登录，如果已登录则重定向到仪表盘
onMounted(() => {
  if (isAuthenticated.value) {
    router.push('/dashboard')
  }
})

const userApi = useUserApi()

const getErrorMessage = (errorMsg: string) => {
  if (errorMsg.includes('用户名或密码错误')) {
    return '用户名或密码错误，请重新输入'
  }
  if (errorMsg.includes('用户不存在')) {
    return '该用户不存在，请检查用户名'
  }
  if (errorMsg.includes('密码错误')) {
    return '密码错误，请检查密码是否正确'
  }
  if (errorMsg.includes('账户被锁定')) {
    return '账户已被锁定，请联系管理员'
  }
  if (errorMsg.includes('网络')) {
    return '网络连接失败，请检查网络连接'
  }
  return errorMsg || '登录失败，请稍后重试'
}

const handleLogin = async () => {
  loading.value = true

  try {
    const data = await userApi.login({
      username: username.value.trim(),
      password: password.value
    })

    // 登录成功，重置失败次数
    loginAttempts.value = 0

    // 使用 useAuth 钩子进行登录
    login(data.user, data.token)

    // 显示成功提示
    message.success('登录成功', `欢迎回来，${data.user.name}！`)

    // 重定向到仪表盘
    router.push('/dashboard')
  } catch (e: any) {
    // 增加失败次数
    loginAttempts.value++

    // 获取友好的错误消息
    const friendlyError = getErrorMessage(e.message)

    // 根据失败次数显示不同的提示
    if (loginAttempts.value === 1) {
      message.error('登录失败', friendlyError)
    } else if (loginAttempts.value >= 3) {
      message.error('多次登录失败', '请仔细检查用户名和密码，注意区分大小写')
    } else {
      message.error('登录失败', friendlyError)
    }

    // 清空密码字段（安全考虑）
    password.value = ''
    showPassword.value = false
  } finally {
    loading.value = false
  }
}
</script> 