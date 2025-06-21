import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 class
 * @param inputs
 * @returns
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 添加默认导出以符合 Nuxt 插件要求
export default defineNuxtPlugin(() => {
  // 这个插件只是导出工具函数，不需要在这里做任何初始化
})
