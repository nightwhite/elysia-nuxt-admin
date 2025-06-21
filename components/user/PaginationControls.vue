<template>
  <div class="py-4 space-y-4">
    <!-- 移动端布局 -->
    <div class="md:hidden space-y-4">
      <!-- 分页信息 -->
      <div class="text-sm text-muted-foreground text-center">
        <span v-if="filterApplied">
          <span class="font-medium text-primary">筛选结果:</span>
          第 {{ (pagination.page - 1) * pagination.pageSize + 1 }} -
          {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }} 条，
          共 <span class="font-medium">{{ pagination.total }}</span> 条记录
        </span>
        <span v-else>
          第 {{ (pagination.page - 1) * pagination.pageSize + 1 }} -
          {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }} 条，
          共 <span class="font-medium">{{ pagination.total }}</span> 条记录
        </span>
      </div>

      <!-- 分页大小选择器 -->
      <div class="flex items-center justify-center gap-2">
        <span class="text-sm text-muted-foreground">每页</span>
        <Select
          :model-value="pagination.pageSize.toString()"
          @update:model-value="(value) => value && $emit('change-page-size', parseInt(String(value)))"
        >
          <SelectTrigger class="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="size in pageSizeOptions"
              :key="size"
              :value="size.toString()"
            >
              {{ size }}
            </SelectItem>
          </SelectContent>
        </Select>
        <span class="text-sm text-muted-foreground">条</span>
      </div>

      <!-- 分页导航 -->
      <div class="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          class="h-8 w-8 p-0"
          :disabled="pagination.page <= 1"
          @click="$emit('go-to-page', pagination.page - 1)"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>

        <!-- 简化的页码显示（移动端） -->
        <div class="flex items-center gap-1">
          <span class="text-sm px-2">{{ pagination.page }} / {{ pagination.totalPages }}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          class="h-8 w-8 p-0"
          :disabled="pagination.page >= pagination.totalPages"
          @click="$emit('go-to-page', pagination.page + 1)"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>

      <!-- 清除筛选按钮（移动端） -->
      <div v-if="filterApplied" class="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          @click="$emit('reset-filters')"
        >
          <X class="h-4 w-4 mr-2" />
          清除筛选
        </Button>
      </div>
    </div>

    <!-- 桌面端布局 -->
    <div class="hidden md:flex items-center justify-between">
      <!-- 左侧：分页信息和分页大小选择器 -->
      <div class="flex items-center gap-4">
        <div class="text-sm text-muted-foreground">
          <span v-if="filterApplied">
            <span class="font-medium text-primary">筛选结果:</span>
            第 {{ (pagination.page - 1) * pagination.pageSize + 1 }} -
            {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }} 条，
            共 <span class="font-medium">{{ pagination.total }}</span> 条记录
            <Button
              variant="link"
              class="h-auto p-0 text-sm text-primary ml-2"
              @click="$emit('reset-filters')"
            >
              <div class="flex items-center">
                <X class="h-3 w-3 mr-1 flex-shrink-0" />
                <span class="inline-block">清除筛选</span>
              </div>
            </Button>
          </span>
          <span v-else>
            显示第 {{ (pagination.page - 1) * pagination.pageSize + 1 }} -
            {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }} 条，
            共 <span class="font-medium">{{ pagination.total }}</span> 条记录
          </span>
        </div>

        <!-- 分页大小选择器 -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground">每页</span>
          <Select
            :model-value="pagination.pageSize.toString()"
            @update:model-value="(value) => value && $emit('change-page-size', parseInt(String(value)))"
          >
            <SelectTrigger class="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="size in pageSizeOptions"
                :key="size"
                :value="size.toString()"
              >
                {{ size }}
              </SelectItem>
            </SelectContent>
          </Select>
          <span class="text-sm text-muted-foreground">条</span>
        </div>
      </div>

      <!-- 右侧：分页导航 -->
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          class="h-8 w-8 p-0"
          :disabled="pagination.page <= 1"
          @click="$emit('go-to-page', pagination.page - 1)"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>

        <!-- 页码显示 -->
        <div class="flex items-center gap-1">
          <template v-if="pagination.totalPages <= 5">
            <Button
              v-for="page in pagination.totalPages"
              :key="page"
              variant="outline"
              size="sm"
              class="h-8 min-w-[2rem] px-2"
              :class="{ 'bg-primary text-primary-foreground': page === pagination.page }"
              @click="$emit('go-to-page', page)"
            >
              {{ page }}
            </Button>
          </template>
          <template v-else>
            <!-- 复杂分页逻辑 -->
            <Button
              v-if="pagination.page > 2"
              variant="outline"
              size="sm"
              class="h-8 min-w-[2rem] px-2"
              @click="$emit('go-to-page', 1)"
            >
              1
            </Button>
            <span v-if="pagination.page > 3" class="px-2">...</span>

            <Button
              v-for="page in getVisiblePages()"
              :key="page"
              variant="outline"
              size="sm"
              class="h-8 min-w-[2rem] px-2"
              :class="{ 'bg-primary text-primary-foreground': page === pagination.page }"
              @click="$emit('go-to-page', page)"
            >
              {{ page }}
            </Button>

            <span v-if="pagination.page < pagination.totalPages - 2" class="px-2">...</span>
            <Button
              v-if="pagination.page < pagination.totalPages - 1"
              variant="outline"
              size="sm"
              class="h-8 min-w-[2rem] px-2"
              @click="$emit('go-to-page', pagination.totalPages)"
            >
              {{ pagination.totalPages }}
            </Button>
          </template>
        </div>

        <Button
          variant="outline"
          size="sm"
          class="h-8 w-8 p-0"
          :disabled="pagination.page >= pagination.totalPages"
          @click="$emit('go-to-page', pagination.page + 1)"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>

        <!-- 页码跳转 -->
        <div class="flex items-center gap-2 ml-4" v-if="pagination.totalPages > 5">
          <span class="text-sm text-muted-foreground">跳转到</span>
          <Input
            type="number"
            :min="1"
            :max="pagination.totalPages"
            :model-value="pagination.page"
            @keyup.enter="(e: any) => $emit('go-to-page', parseInt((e.target as HTMLInputElement).value))"
            class="w-16 h-8 text-center"
            placeholder="页码"
          />
          <span class="text-sm text-muted-foreground">页</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Input } from '~/components/ui/input'
import { ChevronLeft, ChevronRight, X } from 'lucide-vue-next'

interface PaginationData {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface Props {
  pagination: PaginationData
  filterApplied?: boolean
  pageSizeOptions?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  filterApplied: false,
  pageSizeOptions: () => [5, 10, 20, 50, 100]
})

defineEmits<{
  'go-to-page': [page: number]
  'change-page-size': [size: number]
  'reset-filters': []
}>()

// 获取可见的页码
const getVisiblePages = () => {
  const current = props.pagination.page
  const total = props.pagination.totalPages
  const pages = []
  
  // 显示当前页前后各1页
  const start = Math.max(1, current - 1)
  const end = Math.min(total, current + 1)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
}
</script>
