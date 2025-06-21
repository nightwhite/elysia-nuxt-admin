<template>
  <div class="rounded-md border overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="min-w-[120px]">用户信息</TableHead>
          <TableHead class="min-w-[80px]">角色</TableHead>
          <TableHead class="min-w-[150px]">邮箱</TableHead>
          <TableHead class="min-w-[120px]">创建时间</TableHead>
          <TableHead class="text-right w-16">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="loading" class="hover:bg-transparent">
          <TableCell class="h-32 text-center" :colspan="5">
            <div class="flex items-center justify-center">
              <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
              <span class="ml-2 text-muted-foreground">加载中...</span>
            </div>
          </TableCell>
        </TableRow>

        <TableRow v-else-if="error" class="hover:bg-transparent">
          <TableCell class="h-32 text-center" :colspan="5">
            <div class="flex flex-col items-center justify-center text-center">
              <AlertTriangle class="h-8 w-8 text-destructive mb-2" />
              <p class="text-destructive/80 text-sm">{{ error }}</p>
              <Button
                variant="outline"
                size="sm"
                class="mt-2"
                @click="$emit('retry')"
              >
                重试
              </Button>
            </div>
          </TableCell>
        </TableRow>

        <template v-else-if="users.length > 0">
          <TableRow
            v-for="user in users"
            :key="user.id"
            class="group hover:bg-muted/30 transition-colors"
          >
            <TableCell class="min-w-[120px]">
              <div class="flex items-center space-x-3">
                <div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <UserCircle class="h-5 w-5 text-primary" />
                </div>
                <div class="min-w-0">
                  <div class="font-medium">{{ user.name }}</div>
                  <div class="text-sm text-muted-foreground">@{{ user.username }}</div>
                </div>
              </div>
            </TableCell>
            <TableCell class="min-w-[80px]">
              <div class="flex items-center">
                <ShieldAlert v-if="user.role === 'admin'" class="h-4 w-4 mr-2 text-primary" />
                <UserIcon v-else class="h-4 w-4 mr-2 text-muted-foreground" />
                <span class="capitalize">{{ user.role === 'admin' ? '管理员' : '普通用户' }}</span>
              </div>
            </TableCell>
            <TableCell class="min-w-[150px]">
              <div v-if="user.email" class="flex items-center text-sm">
                <Mail class="h-4 w-4 mr-2 text-muted-foreground" />
                <span class="truncate">{{ user.email }}</span>
              </div>
              <span v-else class="text-muted-foreground text-sm">未设置</span>
            </TableCell>
            <TableCell class="min-w-[120px]">
              <div class="flex items-center text-sm text-muted-foreground">
                <Calendar class="h-4 w-4 mr-2" />
                {{ formatDate(user.created_at) }}
              </div>
            </TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="$emit('edit-user', user)">
                    <Edit class="h-4 w-4 mr-2" />
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    @click="$emit('delete-user', user)"
                    class="text-destructive focus:text-destructive"
                  >
                    <Trash class="h-4 w-4 mr-2" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </template>

        <TableRow v-else class="hover:bg-transparent">
          <TableCell class="h-32 text-center" :colspan="5">
            <div class="flex flex-col items-center justify-center text-center">
              <div v-if="filterApplied">
                <FileSearch class="h-10 w-10 text-muted-foreground mb-2" />
                <p class="text-muted-foreground text-center">没有找到匹配的用户</p>
                <Button variant="outline" size="sm" class="mx-auto block w-22 whitespace-nowrap mt-4" @click="$emit('reset-filters')">
                  <div class="flex items-center justify-center w-full">
                    <X class="h-4 w-30 mr-1 flex-shrink-0" />
                    <span class="inline-block">清除筛选</span>
                  </div>
                </Button>
              </div>
              <div v-else>
                <UserX class="h-10 w-10 text-muted-foreground mb-2" />
                <p class="text-muted-foreground text-center">没有用户数据</p>
                <Button variant="outline" size="sm" class="mt-4" @click="$emit('add-user')">
                  <Plus class="h-4 w-4 mr-2" />
                  添加第一个用户
                </Button>
              </div>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '~/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import {
  MoreHorizontal, Edit, Trash, UserCircle, Mail, Calendar,
  AlertTriangle, Loader2, UserX, FileSearch, X, Plus,
  ShieldAlert, User as UserIcon
} from 'lucide-vue-next'

import type { User } from '~/composables/useUserApi'

interface Props {
  users: User[]
  loading?: boolean
  error?: string | null
  filterApplied?: boolean
}

defineProps<Props>()

defineEmits<{
  'edit-user': [user: User]
  'delete-user': [user: User]
  'add-user': []
  'reset-filters': []
  'retry': []
}>()

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}
</script>
