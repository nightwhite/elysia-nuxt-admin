<template>
  <ClientOnly>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <template #fallback>
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <div class="h-16 w-16 mx-auto mb-4 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p class="text-lg text-muted-foreground">加载中...</p>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup>
// 无需在这里定义全局中间件，会在 nuxt.config.ts 中配置
</script>
