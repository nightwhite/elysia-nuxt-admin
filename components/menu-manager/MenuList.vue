<template>
  <Table>
    <TableHeader>
      <TableRow class="bg-muted/50">
        <TableHead>ID</TableHead>
        <TableHead>菜单信息</TableHead>
        <TableHead>路径</TableHead>
        <TableHead>图标</TableHead>
        <TableHead>排序</TableHead>
        <TableHead class="text-right">操作</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="menu in menus" :key="menu.id" class="hover:bg-muted/50 transition-colors">
        <TableCell>{{ menu.id }}</TableCell>
        <TableCell>
          <div class="flex items-center gap-3">
            <div>
              <div class="font-medium">{{ menu.title }}</div>
              <div class="text-xs text-muted-foreground">
                {{ menu.parent_id ? `子菜单 (父ID: ${menu.parent_id})` : '根菜单' }}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div class="flex items-center">
            <Link class="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{{ menu.path || '无' }}</span>
          </div>
        </TableCell>
        <TableCell>
          <div v-if="menu.icon" class="flex items-center gap-2">
            <div class="h-6 w-6 flex items-center justify-center rounded bg-primary/10">
              <component :is="getIconComponent(menu.icon)" class="h-3.5 w-3.5 text-primary" />
            </div>
            <span class="text-sm">{{ menu.icon }}</span>
          </div>
          <span v-else class="text-muted-foreground">未设置</span>
        </TableCell>
        <TableCell>
          <span class="inline-flex items-center justify-center px-2 py-1 rounded-full bg-muted text-xs font-medium">
            {{ menu.sort_order }}
          </span>
        </TableCell>
        <TableCell class="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" class="h-8 w-8">
                <MoreHorizontalIcon class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="$emit('edit', menu)">
                <EditIcon class="mr-2 h-4 w-4" />
                <span>编辑</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="$emit('delete', menu)" class="text-destructive focus:text-destructive">
                <TrashIcon class="mr-2 h-4 w-4" />
                <span>删除</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      <TableRow v-if="menus.length === 0">
        <TableCell colspan="6">
          <div class="flex flex-col items-center py-8">
            <MenuSquare class="h-10 w-10 text-muted-foreground mb-2" />
            <p class="text-muted-foreground text-center">没有菜单数据</p>
            <Button variant="outline" size="sm" class="mt-4" @click="$emit('add')">
              <PlusIcon class="h-4 w-4 mr-2" />
              添加第一个菜单
            </Button>
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '~/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { PlusIcon, EditIcon, TrashIcon, MoreHorizontalIcon, MenuSquare, Link } from 'lucide-vue-next'
import * as LucideIcons from 'lucide-vue-next'
import type { Menu } from '~/types/menu'

defineProps<{
  menus: Menu[]
}>()

defineEmits<{
  (e: 'edit', menu: Menu): void
  (e: 'delete', menu: Menu): void
  (e: 'add'): void
}>()

const getIconComponent = (iconName: string | null) => {
  if (!iconName) return null
  const IconComponent = (LucideIcons as any)[iconName]
  return typeof IconComponent === 'function' ? IconComponent : null
}
</script> 