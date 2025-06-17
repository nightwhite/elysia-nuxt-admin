<template>
  <div class="h-full flex flex-col border-r">
    <div class="flex-1 overflow-auto py-4">
      <nav class="grid gap-1 px-2">
        <NuxtLink 
          to="/" 
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground"
          active-class="bg-muted text-foreground"
        >
          <Home class="h-4 w-4" />
          <span>首页</span>
        </NuxtLink>
        
        <NuxtLink 
          to="/dashboard" 
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground"
          active-class="bg-muted text-foreground"
        >
          <LayoutDashboard class="h-4 w-4" />
          <span>仪表盘</span>
        </NuxtLink>
        
        <NuxtLink 
          to="/userManager" 
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground"
          active-class="bg-muted text-foreground"
        >
          <Users class="h-4 w-4" />
          <span>用户管理</span>
        </NuxtLink>
        
        <NuxtLink 
          to="/menusManager" 
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground"
          active-class="bg-muted text-foreground"
        >
          <Menu class="h-4 w-4" />
          <span>菜单管理</span>
        </NuxtLink>
        
        <Separator class="my-2" />
        
        <NuxtLink 
          to="/test" 
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground"
          active-class="bg-muted text-foreground"
        >
          <Beaker class="h-4 w-4" />
          <span>API 测试</span>
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Separator } from '~/components/ui/separator'
import { Home, LayoutDashboard, Users, Menu, Beaker } from 'lucide-vue-next'
</script> 