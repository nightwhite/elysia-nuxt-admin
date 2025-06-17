<template>
  <div class="container mx-auto p-4 text-center">
    <h1 class="text-4xl font-bold mb-4">{{ error?.statusCode || '错误' }}</h1>
    <p class="mb-4">{{ error?.message || '发生了一个错误' }}</p>
    <Button @click="handleError">
      返回首页
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'

// 获取错误对象
const props = defineProps({
  error: Object
})

// 清除错误并返回首页
const handleError = () => {
  clearError({ redirect: '/' })
}
</script> 