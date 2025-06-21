<template>
  <Sheet :open="isOpen" @update:open="$emit('update:isOpen', $event)" class="sheet-animation">
    <SheetContent class="sm:max-w-md p-0" :class="{'sheet-content-show': isOpen}">
      <SheetHeader class="sr-only">
        <SheetTitle>确认删除</SheetTitle>
        <SheetDescription>删除用户 "{{ user?.name }}"</SheetDescription>
      </SheetHeader>
      <div class="flex flex-col h-full">
        <!-- 模态框头部 -->
        <div class="p-6 border-b">
          <div class="flex items-center">
            <div class="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center mr-4">
              <Trash class="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 class="text-lg font-medium">确认删除</h3>
              <p class="text-sm text-muted-foreground">删除用户 "{{ user?.name }}"</p>
            </div>
          </div>
        </div>
        
        <!-- 内容区域 -->
        <div class="flex-1 p-6">
          <div class="flex items-start p-4 rounded-lg bg-destructive/5 mb-6">
            <AlertTriangle class="h-5 w-5 text-destructive mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 class="font-medium text-destructive mb-1">警告</h4>
              <p class="text-sm text-muted-foreground">删除用户将永久移除其所有数据，包括个人信息和关联权限。此操作不可撤销。</p>
            </div>
          </div>
          
          <div v-if="error" class="flex p-4 border-l-4 border-destructive bg-destructive/10 rounded mb-6">
            <AlertTriangle class="h-5 w-5 text-destructive mr-2 flex-shrink-0" />
            <p class="text-destructive text-sm">{{ error }}</p>
          </div>
        </div>
        
        <!-- 模态框底部 -->
        <div class="p-4 bg-muted/30 border-t flex items-center justify-end gap-2">
          <Button type="button" variant="outline" @click="handleClose">
            取消
          </Button>
          <Button type="button" variant="destructive" @click="handleConfirm" :disabled="deleting" class="gap-2">
            <Loader2 v-if="deleting" class="h-4 w-4 animate-spin" />
            <Trash v-else class="h-4 w-4" />
            确认删除
          </Button>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '~/components/ui/sheet'
import { AlertTriangle, Trash, Loader2 } from 'lucide-vue-next'

import type { User } from '~/composables/useUserApi'

interface Props {
  isOpen: boolean
  user?: User | null
  deleting?: boolean
  error?: string | null
}

defineProps<Props>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'confirm': []
}>()

const handleConfirm = () => {
  emit('confirm')
}

const handleClose = () => {
  emit('update:isOpen', false)
}
</script>

<style scoped>
.sheet-animation {
  --sheet-animation-duration: 300ms;
}

.sheet-content-show {
  animation: sheet-content-slide-in var(--sheet-animation-duration) cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-radius: 12px 0 0 12px;
  border-left: 1px solid rgba(var(--color-border), 0.2);
}

@keyframes sheet-content-slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
