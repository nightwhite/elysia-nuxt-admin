import { ref, readonly } from 'vue'

export interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'destructive' | 'warning' | 'info'
  duration?: number
}

export interface Toast extends Required<Omit<ToastOptions, 'duration'>> {
  id: string
  duration: number
}

// 全局状态
const toasts = ref<Toast[]>([])

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 9)

// 添加 toast
const addToast = (options: ToastOptions) => {
  const id = generateId()
  const toast: Toast = {
    id,
    title: options.title || '',
    description: options.description || '',
    variant: options.variant || 'default',
    duration: options.duration || 4000
  }

  toasts.value.push(toast)

  // 自动移除
  if (toast.duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, toast.duration)
  }

  return id
}

// 移除 toast
const removeToast = (id: string) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// 清空所有 toast
const clearToasts = () => {
  toasts.value = []
}

// 便捷方法
const success = (title: string, description?: string, duration?: number) => {
  return addToast({ title, description, variant: 'success', duration })
}

const error = (title: string, description?: string, duration?: number) => {
  return addToast({ title, description, variant: 'error', duration })
}

const warning = (title: string, description?: string, duration?: number) => {
  return addToast({ title, description, variant: 'warning', duration })
}

const info = (title: string, description?: string, duration?: number) => {
  return addToast({ title, description, variant: 'info', duration })
}

export const useToast = () => {
  return {
    toasts: readonly(toasts),
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  }
}

// 全局实例，类似 ElMessage
export const $toast = {
  success,
  error,
  warning,
  info,
  show: addToast,
  clear: clearToasts
}
