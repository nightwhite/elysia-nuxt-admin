// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['nuxt-elysia', 'shadcn-nuxt'],
  nuxtElysia: {
    path: '/api'  // 将 Elysia 挂载到 /api 而不是默认的 /_api
  },
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  shadcn: {
    /**
     * 所有导入组件的前缀
     */
    prefix: '',
    /**
     * 组件所在的目录
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  },
  // 添加路由规则，处理Chrome DevTools路径
  routeRules: {
    '/.well-known/**': { redirect: '/404' }
  },
  // 配置SSR选项，解决水合不匹配问题
  experimental: {
    renderJsonPayloads: false
  },
  // 配置 Nitro 使用 bun 预设
  nitro: {
    preset: 'bun'
  }
})