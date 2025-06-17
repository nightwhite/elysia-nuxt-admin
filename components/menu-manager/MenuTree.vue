<template>
  <ul class="pl-5 space-y-2">
    <li v-for="item in menuTree" :key="item.id" class="border-l-2 pl-3 py-1">
      <div class="font-medium flex items-center">
        <FolderIcon class="h-4 w-4 mr-2 text-primary" />
        {{ item.title }} 
        <span class="text-gray-500 text-sm ml-2">({{ item.path || '无路径' }})</span>
      </div>
      
      <ul v-if="item.children && item.children.length > 0" class="pl-5 space-y-1 mt-2">
        <li v-for="child in item.children" :key="child.id" class="border-l-2 pl-3 py-1">
          <div class="flex items-center">
            <FileIcon class="h-4 w-4 mr-2 text-muted-foreground" />
            {{ child.title }} 
            <span class="text-gray-500 text-sm ml-2">({{ child.path || '无路径' }})</span>
          </div>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { Folder as FolderIcon, File as FileIcon } from 'lucide-vue-next'
import type { Menu } from '~/types/menu'

interface MenuTreeItem extends Menu {
  children: MenuTreeItem[];
}

defineProps<{
  menuTree: MenuTreeItem[]
}>()
</script> 