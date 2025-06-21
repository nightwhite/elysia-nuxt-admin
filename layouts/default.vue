<template>
  <div class="min-h-screen flex flex-col">
    <!-- 顶部导航栏 -->
    <header class="border-b bg-background">
      <div class="flex h-14 items-center px-4 w-full">
        <div class="flex items-center gap-2">
          <Button variant="ghost" size="icon" class="md:hidden" @click="toggleSidebar">
            <Menu class="h-5 w-5" />
            <span class="sr-only">切换侧边栏</span>
          </Button>
          <!-- 添加Logo和系统标题 -->
          <div class="hidden md:flex items-center gap-2">
            <div class="h-8 w-8 rounded-md bg-primary/90 flex items-center justify-center text-primary-foreground font-bold">
              A
            </div>
            <h2 class="text-lg font-semibold hidden lg:block">Admin System</h2>
          </div>
        </div>
        
        <div class="flex-1"></div>
        
        <div class="flex items-center">
          <div v-if="user" class="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger class="outline-none">
                <div class="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted transition-colors">
                  <Avatar class="h-8 w-8 border border-border">
                    <AvatarImage v-if="user.avatar" :src="user.avatar" />
                    <AvatarFallback class="bg-primary/10 text-primary font-medium">
                      {{ user.name.substring(0, 1) }}
                    </AvatarFallback>
                  </Avatar>
                  <div class="hidden md:flex flex-col items-start text-sm">
                    <div class="font-medium">{{ user.name }}</div>
                    <div class="text-xs text-muted-foreground">{{ user.role === 'admin' ? '系统管理员' : '用户' }}</div>
                  </div>
                  <ChevronDown class="h-4 w-4 text-muted-foreground hidden md:block" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-48">
                <div class="flex flex-col gap-1 p-2 md:hidden">
                  <div class="font-medium">{{ user.name }}</div>
                  <div class="text-xs text-muted-foreground">
                    {{ user.role === 'admin' ? '系统管理员' : '用户' }}
                  </div>
                </div>
                <DropdownMenuSeparator class="md:hidden" />
                <DropdownMenuItem @click="goToProfile">
                  <User class="mr-2 h-4 w-4" />
                  <span>个人资料</span>
                </DropdownMenuItem>
                <DropdownMenuItem @click="goToSettings">
                  <Settings class="mr-2 h-4 w-4" />
                  <span>设置</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="confirmLogout" class="text-destructive focus:text-destructive">
                  <LogOut class="mr-2 h-4 w-4" />
                  <span>登出</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
    
    <!-- 主体内容 -->
    <div class="flex-1 flex">
      <!-- 侧边栏 - 桌面端 -->
      <div class="w-64 shrink-0 border-r bg-background hidden md:block">
        <ClientOnly>
          <Sidebar />
          <template #fallback>
            <div class="w-64 p-4">
              <div class="h-8 w-full bg-muted/50 animate-pulse rounded mb-2"></div>
              <div class="h-8 w-full bg-muted/50 animate-pulse rounded mb-2"></div>
              <div class="h-8 w-full bg-muted/50 animate-pulse rounded mb-2"></div>
            </div>
          </template>
        </ClientOnly>
      </div>
      
      <!-- 侧边栏 - 移动端 -->
      <div 
        v-if="isSidebarOpen" 
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
        @click="toggleSidebar"
      ></div>
      
      <div 
        v-if="isSidebarOpen"
        class="fixed top-0 left-0 bottom-0 z-50 w-64 border-r bg-background md:hidden"
      >
        <ClientOnly>
          <Sidebar />
          <template #fallback>
            <div class="w-64 p-4">
              <div class="h-8 w-full bg-muted/50 animate-pulse rounded mb-2"></div>
              <div class="h-8 w-full bg-muted/50 animate-pulse rounded mb-2"></div>
              <div class="h-8 w-full bg-muted/50 animate-pulse rounded mb-2"></div>
            </div>
          </template>
        </ClientOnly>
      </div>
      
      <!-- 内容区域 -->
      <div class="flex-1 overflow-auto p-4">
        <slot />
      </div>
    </div>

    <!-- 登出确认对话框 -->
    <Sheet v-model:open="isLogoutDialogOpen">
      <SheetContent side="bottom" class="sm:max-w-md sm:mx-auto">
        <SheetHeader>
          <SheetTitle class="flex items-center gap-2">
            <LogOut class="h-5 w-5 text-destructive" />
            确认登出
          </SheetTitle>
          <SheetDescription>
            您确定要登出当前账户吗？登出后需要重新登录才能访问系统。
          </SheetDescription>
        </SheetHeader>
        <SheetFooter class="flex-col sm:flex-row gap-2 mt-6">
          <Button variant="outline" @click="isLogoutDialogOpen = false" class="flex-1">
            取消
          </Button>
          <Button @click="handleLogout" variant="destructive" class="flex-1">
            <LogOut class="h-4 w-4 mr-2" />
            确认登出
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator
} from '~/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet'
import { User, Settings, LogOut, ChevronDown, Menu } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'
import { useMessage } from '~/composables/useMessage'
import Sidebar from '~/components/layout/Sidebar.vue'
import { ref } from 'vue'

const { user, logout } = useAuth()
const router = useRouter()
const message = useMessage()
const isSidebarOpen = ref(false)
const isLogoutDialogOpen = ref(false)

const confirmLogout = () => {
  isLogoutDialogOpen.value = true
}

const handleLogout = () => {
  try {
    logout()
    isLogoutDialogOpen.value = false

    // 显示登出成功提示
    message.success('登出成功', '您已安全登出系统，感谢使用！')

    // 延迟跳转，让用户看到提示消息
    setTimeout(() => {
      router.push('/login')
    }, 300)
  } catch (error) {
    console.error('登出失败:', error)
    message.error('登出失败', '登出过程中发生错误，请重试')
    isLogoutDialogOpen.value = false
  }
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const goToProfile = () => {
  router.push('/profile')
}

const goToSettings = () => {
  router.push('/settings')
}
</script> 