/**
 * 全局消息提示 composable
 * 提供简化的 API 来显示消息提示
 */
export const useMessage = () => {
  // 在客户端使用 window.$toast，在服务端使用 useNuxtApp
  const getToast = () => {
    if (process.client && window.$toast) {
      return window.$toast
    }
    
    try {
      const { $toast } = useNuxtApp()
      return $toast
    } catch {
      // 如果在服务端或者 Nuxt 上下文不可用，返回空函数
      return {
        success: () => {},
        error: () => {},
        warning: () => {},
        info: () => {},
        show: () => {},
        clear: () => {}
      }
    }
  }

  const toast = getToast()

  return {
    // 成功消息
    success: (title: string, description?: string, duration?: number) => {
      toast.success(title, description, duration)
    },

    // 错误消息
    error: (title: string, description?: string, duration?: number) => {
      toast.error(title, description, duration)
    },

    // 警告消息
    warning: (title: string, description?: string, duration?: number) => {
      toast.warning(title, description, duration)
    },

    // 信息消息
    info: (title: string, description?: string, duration?: number) => {
      toast.info(title, description, duration)
    },

    // 通用消息显示函数（根据类型自动选择）
    showMessage: (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration?: number) => {
      switch (type) {
        case 'success':
          toast.success(message, undefined, duration)
          break
        case 'error':
          toast.error(message, undefined, duration)
          break
        case 'warning':
          toast.warning(message, undefined, duration)
          break
        case 'info':
        default:
          toast.info(message, undefined, duration)
          break
      }
    },

    // 通用消息
    show: toast.show,

    // 清空所有消息
    clear: toast.clear
  }
}
