<template>
  <div class="container mx-auto p-4 text-center">
    <h1 class="text-4xl font-bold mb-4">404</h1>
    <p class="mb-4">页面未找到</p>
    <Button asChild>
      <NuxtLink to="/">
        返回首页
      </NuxtLink>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'

// 设置正确的状态码
definePageMeta({
  layout: 'default'
})

// 设置 HTTP 状态码为 404
if (process.client) {
  useHead({
    title: '404 - 页面未找到',
    meta: [
      { name: 'robots', content: 'noindex' }
    ]
  })
}
</script> 