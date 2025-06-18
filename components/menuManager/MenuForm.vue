<template>
  <form @submit.prevent="$emit('save')">
    <div class="mb-6">
      <h4 class="text-sm font-medium text-muted-foreground mb-3">菜单关系</h4>
      <div class="space-y-4">
        <div>
          <Label for="parent_id" class="text-sm mb-2 block">父级菜单</Label>
          <Select v-model="menu.parent_id">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="选择父级菜单" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="null">
                <div class="flex items-center">
                  <LayoutDashboard class="h-4 w-4 mr-2 text-primary" />
                  <span>无 (根菜单)</span>
                </div>
              </SelectItem>
              <SelectItem v-for="item in availableParents" :key="item.id" :value="item.id">
                <div class="flex items-center">
                  <CircleDashed class="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{{ item.title }}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <div class="mb-6">
      <h4 class="text-sm font-medium text-muted-foreground mb-3">基本信息</h4>
      <div class="space-y-4">
        <div>
          <Label for="title" class="text-sm">
            菜单标题 <span class="text-destructive">*</span>
          </Label>
          <div class="relative">
            <Input 
              id="title" 
              v-model="menu.title" 
              required
              class="pr-9"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <MenuSquare class="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div>
          <Label for="path" class="text-sm">路径</Label>
          <div class="relative">
            <Input 
              id="path" 
              :value="menu.path"
              @input="(e: any) => $emit('update:menu', { ...menu, path: e.target.value })"
              placeholder="/dashboard"
              class="pr-9"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <Link class="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-1">菜单链接的路由路径</p>
        </div>
      </div>
    </div>

    <div class="mb-6">
      <h4 class="text-sm font-medium text-muted-foreground mb-3">显示设置</h4>
      <div class="space-y-4">
        <div>
          <Label for="icon" class="text-sm">图标</Label>
          <div class="relative">
            <div class="flex gap-2">
              <div class="flex-1 relative">
                <Input 
                  id="icon" 
                  :value="menu.icon || ''"
                  @input="(e: any) => $emit('update:menu', { ...menu, icon: e.target.value || null })"
                  placeholder="输入图标名称，如 LayoutDashboard"
                  class="pr-9"
                />
                <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                  <div class="h-4 w-4 flex items-center justify-center">
                    <component 
                      :is="getIconComponent(menu.icon)"
                      class="h-4 w-4 text-foreground" 
                    />
                  </div>
                </div>
              </div>
              <Button 
                type="button"
                variant="outline"
                class="inline-flex items-center justify-center gap-2"
                @click="openIconLibrary"
              >
                <ExternalLink class="h-4 w-4" />
                浏览图标
              </Button>
            </div>
            <p class="text-xs text-muted-foreground mt-1">在 <a href="https://lucide.dev/icons" target="_blank" class="text-primary hover:underline">Lucide 图标库</a> 中选择图标，点击图标后复制 <span class="font-medium">Component Name</span> 粘贴到此处</p>
          </div>
        </div>

        <div>
          <Label for="sort_order" class="text-sm">
            排序 <span class="text-destructive">*</span>
          </Label>
          <div class="relative">
            <Input 
              id="sort_order" 
              v-model="menu.sort_order" 
              type="number"
              required
              class="pr-9"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <ArrowUpDown class="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-1">数字越小排序越靠前</p>
        </div>
      </div>
    </div>

    <div v-if="error" class="flex p-4 border-l-4 border-destructive bg-destructive/10 rounded mb-6">
      <AlertTriangle class="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
      <p class="text-destructive text-sm">{{ error }}</p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { LayoutDashboard, CircleDashed, MenuSquare, Link, ArrowUpDown, AlertTriangle, ExternalLink } from 'lucide-vue-next'
import * as LucideIcons from 'lucide-vue-next'
import type { Menu } from '~/types/menu'

const props = defineProps<{
  menu: Partial<Menu>
  allMenus: Menu[]
  error?: string | null
}>()

defineEmits<{
  (e: 'save'): void
  (e: 'update:menu', value: Partial<Menu>): void
}>()

const availableParents = computed(() => {
  return props.allMenus.filter(m => m.id !== props.menu.id)
})

const getIconComponent = (iconName: string | null | undefined) => {
  if (!iconName) return null
  const IconComponent = (LucideIcons as any)[iconName]
  return typeof IconComponent === 'function' ? IconComponent : null
}

const openIconLibrary = () => {
  window.open('https://lucide.dev/icons', '_blank')
}
</script> 