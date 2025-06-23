import { ref, readonly } from 'vue'

interface User {
  id: number
  username: string
  name: string
  role: string
  email?: string
  avatar?: string
}

// 创建响应式状态
const user = ref<User | null>(null)
const isAuthenticated = ref(false)
const token = ref<string | null>(null)

// 初始化函数，从 localStorage 读取数据
const initAuth = () => {
  if (process.server) return
  
  try {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
      isAuthenticated.value = true
    }
  } catch (error) {
    console.error('初始化认证状态失败', error)
  }
}

// 登录函数
const login = (userData: User, userToken: string) => {
  user.value = userData
  token.value = userToken
  isAuthenticated.value = true
  
  localStorage.setItem('user', JSON.stringify(userData))
  localStorage.setItem('token', userToken)
}

// 登出函数
const logout = () => {
  user.value = null
  token.value = null
  isAuthenticated.value = false

  if (process.client) {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }
}

// 检查Token是否过期
const isTokenExpired = (tokenString: string): boolean => {
  try {
    const payload = JSON.parse(atob(tokenString.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch {
    return true // 如果无法解析，认为已过期
  }
}

// 验证Token有效性
const validateToken = (): boolean => {
  if (!token.value) return false

  if (isTokenExpired(token.value)) {
    logout() // 自动清理过期Token
    return false
  }

  return true
}

// 更新用户信息函数
const updateUser = async () => {
  if (!user.value?.id || !token.value) {
    throw new Error('用户未登录')
  }

  try {
    // 直接使用 $fetch 调用 API，避免循环依赖
    const response = await $fetch<User>(`/api/users/${user.value.id}`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    // 更新本地用户信息
    user.value = response
    localStorage.setItem('user', JSON.stringify(response))

    return response
  } catch (error) {
    console.error('更新用户信息失败:', error)
    throw error
  }
}

// 导出钩子函数
export const useAuth = () => {
  // 初始化
  initAuth()

  return {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    token: readonly(token),
    login,
    logout,
    updateUser,
    initAuth,
    validateToken,
    isTokenExpired
  }
}