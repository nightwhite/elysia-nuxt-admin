import type { $toast } from '~/components/ui/toast'

// 认证用户类型定义
export interface AuthUser {
  id: number;
  username: string;
  role: string;
}

declare global {
  interface Window {
    $toast: typeof $toast
  }
}

export {}
