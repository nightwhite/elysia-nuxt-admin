<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <TransitionGroup
        name="toast"
        tag="div"
        class="flex flex-col gap-2"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
            'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
            getToastVariantClass(toast.variant)
          ]"
        >
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0">
              <component :is="getToastIcon(toast.variant)" class="h-5 w-5" />
            </div>
            <div class="grid gap-1">
              <div v-if="toast.title" class="text-sm font-semibold">
                {{ toast.title }}
              </div>
              <div v-if="toast.description" class="text-sm opacity-90">
                {{ toast.description }}
              </div>
            </div>
          </div>
          <button
            @click="removeToast(toast.id)"
            class="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-vue-next'
import { useToast } from './useToast'

const { toasts, removeToast } = useToast()

const getToastIcon = (variant: string) => {
  switch (variant) {
    case 'success':
      return CheckCircle
    case 'error':
    case 'destructive':
      return XCircle
    case 'warning':
      return AlertCircle
    case 'info':
    default:
      return Info
  }
}

const getToastVariantClass = (variant: string) => {
  switch (variant) {
    case 'success':
      return 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-50'
    case 'error':
    case 'destructive':
      return 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-50'
    case 'warning':
      return 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-50'
    case 'info':
      return 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-50'
    default:
      return 'border bg-background text-foreground'
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
