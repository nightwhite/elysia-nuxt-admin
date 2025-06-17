<template>
  <div class="container mx-auto p-4">
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>欢迎使用 Admin 模板</CardTitle>
        <CardDescription>基于 Nuxt + Elysia + shadcn-vue + SQLite 构建的管理系统模板</CardDescription>
      </CardHeader>
      <CardContent>
        <p class="mb-4">这是一个基础的管理系统模板，集成了以下技术：</p>
        <ul class="list-disc pl-6 space-y-2">
          <li>Nuxt 3 - Vue 3 框架</li>
          <li>Elysia - 高性能 API 服务器</li>
          <li>shadcn-vue - 美观的 UI 组件库</li>
          <li>Tailwind CSS - 实用优先的 CSS 框架</li>
          <li>SQLite - 轻量级数据库</li>
          <li>Bun - 高性能 JavaScript 运行时</li>
        </ul>
      </CardContent>
      <CardFooter class="flex flex-wrap gap-2">
        <Button asChild>
          <NuxtLink to="/dashboard">
            查看仪表盘
          </NuxtLink>
        </Button>
        <Button variant="outline" asChild>
          <NuxtLink to="/userManager">
            用户管理
          </NuxtLink>
        </Button>
        <Button variant="outline" asChild>
          <NuxtLink to="/menusManager">
            菜单管理
          </NuxtLink>
        </Button>
        <Button variant="secondary" asChild>
          <NuxtLink to="/test">
            API 测试
          </NuxtLink>
        </Button>
      </CardFooter>
    </Card>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>完整后台管理</CardTitle>
        </CardHeader>
        <CardContent>
          <p>包含用户管理、菜单管理、权限控制等核心功能。</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>前后端一体化</CardTitle>
        </CardHeader>
        <CardContent>
          <p>基于 Nuxt 和 Elysia 的前后端一体化架构，简化开发流程。</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>内置 SQLite 数据库</CardTitle>
        </CardHeader>
        <CardContent>
          <p>使用轻量级 SQLite 数据库，无需额外配置，即开即用。</p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '~/components/ui/card'

// 添加登录验证
definePageMeta({
  middleware: ['auth']
})
</script> 