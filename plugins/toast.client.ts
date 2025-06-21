import { $toast } from '~/components/ui/toast'

export default defineNuxtPlugin(() => {
  // 将 $toast 添加到全局属性和 window 对象
  if (process.client) {
    // 添加到 window 对象，方便全局访问
    window.$toast = $toast
  }

  return {
    provide: {
      toast: $toast
    }
  }
})
