export default defineNuxtRouteMiddleware((to, from) => {
  // 如果用户访问登录页，不需要验证
  if (to.path === '/login') {
    return
  }

  // 在服务器端渲染时，无法访问 localStorage，跳过检查
  if (process.server) {
    return
  }

  // 使用useAuth进行Token验证
  const { validateToken } = useAuth()

  if (!validateToken()) {
    // 如果Token无效或过期，重定向到登录页
    return navigateTo('/login')
  }
})