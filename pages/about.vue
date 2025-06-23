<template>
  <div class="container mx-auto p-4">
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">关于系统</h1>
      </div>

      <div class="grid gap-6">
        <!-- 系统信息 -->
        <Card>
          <CardHeader>
            <div class="flex items-center gap-4">
              <!-- 系统Logo -->
              <div v-if="systemLogo.type === 'image'" class="h-16 w-16 rounded-lg overflow-hidden">
                <img :src="systemLogo.value" :alt="systemInfo.name" class="w-full h-full object-cover" />
              </div>
              <div v-else class="h-16 w-16 rounded-lg bg-primary/90 flex items-center justify-center text-primary-foreground font-bold text-2xl">
                {{ systemLogo.value }}
              </div>
              
              <div>
                <CardTitle class="text-3xl">{{ systemInfo.name }}</CardTitle>
                <CardDescription class="text-lg mt-1">
                  {{ systemInfo.description }}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-semibold mb-2">系统信息</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">版本:</span>
                    <span class="font-mono">{{ systemInfo.version }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">环境:</span>
                    <span class="font-mono">{{ env }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">构建时间:</span>
                    <span class="font-mono">{{ buildTime }}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 class="font-semibold mb-2">技术栈</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">前端框架:</span>
                    <span>Nuxt 3 + Vue 3</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">后端框架:</span>
                    <span>Elysia + Bun</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">UI 组件:</span>
                    <span>shadcn-vue</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">样式框架:</span>
                    <span>Tailwind CSS</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">数据库:</span>
                    <span>SQLite</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 功能特性 -->
        <Card>
          <CardHeader>
            <CardTitle>功能特性</CardTitle>
            <CardDescription>
              系统提供的主要功能和特性
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="flex items-start gap-3">
                <div class="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center">
                  <Users class="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 class="font-medium">用户管理</h4>
                  <p class="text-sm text-muted-foreground">完整的用户CRUD操作和权限管理</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <div class="h-8 w-8 rounded-md bg-green-100 flex items-center justify-center">
                  <Menu class="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 class="font-medium">菜单管理</h4>
                  <p class="text-sm text-muted-foreground">动态菜单配置和权限控制</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <div class="h-8 w-8 rounded-md bg-purple-100 flex items-center justify-center">
                  <FolderOpen class="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 class="font-medium">文件管理</h4>
                  <p class="text-sm text-muted-foreground">S3对象存储集成和文件管理</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <div class="h-8 w-8 rounded-md bg-orange-100 flex items-center justify-center">
                  <Settings class="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h4 class="font-medium">系统配置</h4>
                  <p class="text-sm text-muted-foreground">灵活的系统参数配置管理</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <div class="h-8 w-8 rounded-md bg-red-100 flex items-center justify-center">
                  <Shield class="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h4 class="font-medium">安全认证</h4>
                  <p class="text-sm text-muted-foreground">JWT令牌认证和权限验证</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <div class="h-8 w-8 rounded-md bg-indigo-100 flex items-center justify-center">
                  <Smartphone class="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h4 class="font-medium">响应式设计</h4>
                  <p class="text-sm text-muted-foreground">适配桌面和移动设备</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 版权信息 -->
        <Card>
          <CardHeader>
            <CardTitle>版权信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-center space-y-4">
              <p class="text-lg">{{ systemInfo.copyright }}</p>
              <div class="text-sm text-muted-foreground space-y-1">
                <p>本系统基于开源技术构建，遵循相关开源协议</p>
                <p>如有问题或建议，请联系系统管理员</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Users, Menu, FolderOpen, Settings, Shield, Smartphone } from 'lucide-vue-next'
import { useSystemConfig } from '~/composables/useSystemConfig'

const { systemInfo, systemLogo } = useSystemConfig()

// 环境信息
const env = computed(() => {
  return process.env.NODE_ENV || 'development'
})

// 构建时间（这里使用当前时间作为示例，实际项目中可以在构建时注入）
const buildTime = computed(() => {
  return new Date().toLocaleDateString('zh-CN')
})

// 添加登录验证
definePageMeta({
  middleware: ['auth']
})

// 设置页面标题
useHead({
  title: `关于 - ${systemInfo.value.name}`,
  meta: [
    { name: 'description', content: systemInfo.value.description }
  ]
})
</script>
