export default defineNuxtPlugin(() => {
  // 全局错误处理
  if (process.client) {
    // 处理未捕获的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      console.error('未处理的Promise拒绝:', event.reason)
      
      // 如果是API错误且是401，防止无限循环
      if (event.reason?.status === 401) {
        event.preventDefault() // 阻止默认的错误处理
        
        // 清理认证状态
        const { logout } = useAuth()
        logout()
        
        // 重定向到登录页（如果不在登录页）
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    })
    
    // 处理未捕获的错误
    window.addEventListener('error', (event) => {
      console.error('未捕获的错误:', event.error)
    })
  }
})
