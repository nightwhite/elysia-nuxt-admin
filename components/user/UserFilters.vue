<template>
  <div class="mb-6 space-y-4">
    <!-- 移动端：垂直布局 -->
    <div class="flex flex-col gap-4 md:hidden">
      <!-- 搜索框 -->
      <div class="relative">
        <Input
          v-model="searchQuery"
          placeholder="搜索用户名、姓名或邮箱..."
          class="pl-10"
          @keyup.enter="handleSearch"
        />
        <div class="absolute inset-y-0 left-0 flex items-center pl-3">
          <Search class="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <!-- 筛选和操作按钮行 -->
      <div class="flex items-center gap-2">
        <!-- 角色筛选 -->
        <Select :model-value="roleFilter" @update:model-value="updateRoleFilter">
          <SelectTrigger class="flex-1">
            <div class="flex items-center">
              <FilterIcon class="h-4 w-4 mr-2" />
              <SelectValue placeholder="选择角色" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部角色</SelectItem>
            <SelectItem value="admin">
              <div class="flex items-center">
                <ShieldAlert class="h-4 w-4 mr-2 text-primary" />
                <span>管理员</span>
              </div>
            </SelectItem>
            <SelectItem value="user">
              <div class="flex items-center">
                <UserIcon class="h-4 w-4 mr-2 text-muted-foreground" />
                <span>普通用户</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <!-- 搜索按钮 -->
        <Button @click="handleSearch" :disabled="isFiltering" size="sm">
          <Loader2 v-if="isFiltering" class="h-4 w-4 animate-spin" />
          <FileSearch v-else class="h-4 w-4" />
          <span class="sr-only">搜索</span>
        </Button>

        <!-- 刷新按钮 -->
        <Button
          variant="outline"
          size="sm"
          @click="$emit('refresh')"
          :disabled="loading || isRefreshing || isFiltering"
        >
          <RefreshCw class="h-4 w-4" :class="{'animate-spin': isRefreshing}" />
          <span class="sr-only">刷新</span>
        </Button>
      </div>
    </div>

    <!-- 桌面端：水平布局 -->
    <div class="hidden md:flex items-center gap-4">
      <!-- 搜索框 -->
      <div class="flex-1 max-w-sm">
        <div class="relative">
          <Input
            v-model="searchQuery"
            placeholder="搜索用户名、姓名或邮箱..."
            class="pl-10"
            @keyup.enter="handleSearch"
          />
          <div class="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search class="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <!-- 角色筛选 -->
      <Select :model-value="roleFilter" @update:model-value="updateRoleFilter">
        <SelectTrigger class="w-40">
          <div class="flex items-center">
            <FilterIcon class="h-4 w-4 mr-2" />
            <SelectValue placeholder="选择角色" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部角色</SelectItem>
          <SelectItem value="admin">
            <div class="flex items-center">
              <ShieldAlert class="h-4 w-4 mr-2 text-primary" />
              <span>管理员</span>
            </div>
          </SelectItem>
          <SelectItem value="user">
            <div class="flex items-center">
              <UserIcon class="h-4 w-4 mr-2 text-muted-foreground" />
              <span>普通用户</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- 搜索按钮 -->
      <Button @click="handleSearch" :disabled="isFiltering">
        <Loader2 v-if="isFiltering" class="h-4 w-4 mr-2 animate-spin" />
        <FileSearch v-else class="h-4 w-4 mr-2" />
        搜索
      </Button>

      <!-- 刷新按钮 -->
      <Button
        variant="outline"
        size="sm"
        class="h-9"
        @click="$emit('refresh')"
        :disabled="loading || isRefreshing || isFiltering"
      >
        <RefreshCw class="h-4 w-4" :class="{'animate-spin': isRefreshing}" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { 
  Search, FilterIcon, RefreshCw, FileSearch, Loader2,
  ShieldAlert, User as UserIcon
} from 'lucide-vue-next'

interface Props {
  loading?: boolean
  isRefreshing?: boolean
  isFiltering?: boolean
  initialSearch?: string
  initialRole?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  isRefreshing: false,
  isFiltering: false,
  initialSearch: '',
  initialRole: 'all'
})

const emit = defineEmits<{
  'search': [query: string]
  'filter-change': []
  'refresh': []
}>()

const searchQuery = ref(props.initialSearch)
const roleFilter = ref(props.initialRole)

// 处理搜索
const handleSearch = () => {
  emit('search', searchQuery.value)
}

// 更新角色筛选
const updateRoleFilter = (value: any) => {
  if (value) {
    roleFilter.value = String(value)
    emit('filter-change')
  }
}

// 暴露给父组件的方法和数据
defineExpose({
  searchQuery,
  roleFilter,
  resetFilters: () => {
    searchQuery.value = ''
    roleFilter.value = 'all'
  }
})
</script>
