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
  
  localStorage.removeItem('user')
  localStorage.removeItem('token')
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
    initAuth
  }
} 