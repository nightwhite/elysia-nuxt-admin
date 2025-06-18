<template>
  <div class="h-full flex flex-col border-r">
    <div class="flex-1 overflow-auto py-4">
      <nav class="grid gap-1 px-2">
        <template v-for="item in menus" :key="item.path">
          <!-- 根菜单 -->
          <div 
            v-if="item.children && item.children.length > 0"
            class="flex flex-col"
          >
            <button
              @click="item.id && toggleMenu(item.id)"
              class="flex items-center justify-between rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground"
              :class="{ 'bg-muted/20': item.id && expandedMenus.includes(item.id) }"
            >
              <div class="flex items-center gap-3">
                <component :is="getIconComponent(item.icon)" class="h-4 w-4" />
                <span>{{ item.title }}</span>
              </div>
              <ChevronDown
                class="h-4 w-4 transition-transform"
                :class="{ 'rotate-180': item.id && expandedMenus.includes(item.id) }"
              />
            </button>
            
            <!-- 子菜单 -->
            <div
              v-show="item.id && expandedMenus.includes(item.id)"
              class="grid gap-1 transition-all"
            >
              <NuxtLink 
                v-for="child in item.children"
                :key="child.path"
                :to="child.path" 
                class="flex items-center gap-3 rounded-lg px-3 py-2 pl-10 text-sm text-muted-foreground transition-all hover:text-foreground"
                :class="{ 'bg-muted text-foreground': route.path === child.path }"
              >
                <component :is="getIconComponent(child.icon)" class="h-3.5 w-3.5" />
                <span>{{ child.title }}</span>
              </NuxtLink>
            </div>
          </div>

          <!-- 无子菜单的普通菜单项 -->
          <NuxtLink 
            v-else
            :to="item.path" 
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground"
            :class="{ 'bg-muted text-foreground': route.path === item.path }"
          >
            <component :is="getIconComponent(item.icon)" class="h-4 w-4" />
            <span>{{ item.title }}</span>
          </NuxtLink>
        </template>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as LucideIcons from 'lucide-vue-next'
import { ChevronDown } from 'lucide-vue-next'
import { useRoute } from 'vue-router'

interface MenuItem {
  id?: number
  parent_id?: number | null
  title: string
  path: string
  icon?: string
  sort_order?: number
  children?: MenuItem[]
}

// 展开的菜单ID列表
const expandedMenus = ref<number[]>([])
const route = useRoute()

// 切换菜单展开状态
const toggleMenu = (menuId?: number) => {
  if (!menuId) return
  const index = expandedMenus.value.indexOf(menuId)
  if (index === -1) {
    expandedMenus.value.push(menuId)
  } else {
    expandedMenus.value.splice(index, 1)
  }
}

// 检查菜单是否激活（仅检查当前路径）
const isMenuActive = (item: MenuItem) => {
  return route.path === item.path
}

// 获取图标组件
const getIconComponent = (iconName?: string) => {
  if (!iconName) return null
  
  // 处理 heroicons 格式
  if (iconName.startsWith('i-heroicons-')) {
    // 转换图标名称格式
    const baseName = iconName.replace('i-heroicons-', '')
    // 转换为大驼峰命名
    const lucideName = baseName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
    
    // 检查图标是否存在
    if (lucideName in LucideIcons) {
      return (LucideIcons as any)[lucideName]
    }
  }
  
  // 直接检查 Lucide 图标
  if (iconName in LucideIcons) {
    return (LucideIcons as any)[iconName]
  }
  
  // 如果找不到图标，返回帮助图标
  console.warn(`Icon ${iconName} not found in lucide-vue-next`)
  return LucideIcons.HelpCircle
}

// 菜单数据
const menus = ref<MenuItem[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// 获取菜单数据
const fetchMenus = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch('/api/menus/tree')
    if (!response.ok) {
      throw new Error(`HTTP 错误: ${response.status}`)
    }
    
    const data = await response.json()
    
    // 转换菜单数据结构
    const transformMenuItem = (item: any): MenuItem => ({
      id: item.id,
      parent_id: item.parent_id,
      title: item.title,
      path: item.path || '',
      icon: item.icon,
      sort_order: item.sort_order,
      children: item.children?.map(transformMenuItem)
    })
    
    menus.value = data.map(transformMenuItem)
      .sort((a: MenuItem, b: MenuItem) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    
  } catch (e: any) {
    error.value = e.message || '获取菜单数据失败'
    console.error('获取菜单失败:', e)
    
    // 使用默认菜单作为后备
    menus.value = [
      {
        path: '/',
        title: '首页',
        icon: 'Home'
      },
      {
        path: '/dashboard',
        title: '仪表盘',
        icon: 'LayoutDashboard'
      }
    ]
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取菜单数据
onMounted(() => {
  fetchMenus()
})
</script> 