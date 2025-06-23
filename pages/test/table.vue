<template>
  <div class="container mx-auto p-4">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">表格测试页面</h1>

      <!-- 基础表格测试 -->
      <Card class="mb-6">
        <CardHeader>
          <CardTitle>📊 基础表格功能</CardTitle>
          <CardDescription>
            测试表格的基本功能：排序、筛选、分页、勾选等
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <!-- 操作栏 -->
            <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div class="flex gap-2">
                <Button @click="loadSampleData" :disabled="loading" size="sm">
                  <RefreshCw class="h-4 w-4 mr-2" />
                  重新加载数据
                </Button>
                <Button @click="clearData" variant="outline" size="sm">
                  清空数据
                </Button>
                <Button
                  v-if="tableData.length > 0 && selectedItems.length === 0"
                  @click="selectRandomItems"
                  variant="outline"
                  size="sm"
                >
                  随机选择几项
                </Button>
              </div>
              
              <div class="flex gap-2 items-center">
                <Input
                  v-model="searchQuery"
                  placeholder="搜索用户..."
                  class="w-48"
                />
                <Select
                  :model-value="roleFilter || 'all'"
                  @update:model-value="(value) => roleFilter = value === 'all' ? '' : String(value || '')"
                >
                  <SelectTrigger class="w-32">
                    <SelectValue placeholder="角色筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="admin">管理员</SelectItem>
                    <SelectItem value="user">用户</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>



            <!-- 表格 -->
            <div class="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="w-12">
                      <input
                        type="checkbox"
                        :checked="isAllSelected"
                        @change="toggleSelectAll"
                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </TableHead>
                    <TableHead 
                      class="cursor-pointer hover:bg-muted/50"
                      @click="sortBy('id')"
                    >
                      ID
                      <ArrowUpDown class="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead 
                      class="cursor-pointer hover:bg-muted/50"
                      @click="sortBy('name')"
                    >
                      姓名
                      <ArrowUpDown class="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead 
                      class="cursor-pointer hover:bg-muted/50"
                      @click="sortBy('email')"
                    >
                      邮箱
                      <ArrowUpDown class="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead 
                      class="cursor-pointer hover:bg-muted/50"
                      @click="sortBy('status')"
                    >
                      状态
                      <ArrowUpDown class="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead 
                      class="cursor-pointer hover:bg-muted/50"
                      @click="sortBy('createdAt')"
                    >
                      创建时间
                      <ArrowUpDown class="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead class="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-if="loading">
                    <TableCell colspan="8" class="text-center py-8">
                      <div class="flex items-center justify-center gap-2">
                        <RefreshCw class="h-4 w-4 animate-spin" />
                        加载中...
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow v-else-if="paginatedData.length === 0">
                    <TableCell colspan="8" class="text-center py-8 text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                  <TableRow 
                    v-else
                    v-for="item in paginatedData" 
                    :key="item.id"
                    class="hover:bg-muted/50"
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        :checked="selectedItems.includes(item.id)"
                        @change="() => toggleSelect(item.id)"
                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </TableCell>
                    <TableCell class="font-medium">{{ item.id }}</TableCell>
                    <TableCell>{{ item.name }}</TableCell>
                    <TableCell>{{ item.email }}</TableCell>
                    <TableCell>
                      <span
                        :class="[
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          item.role === 'admin'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        ]"
                      >
                        {{ item.role === 'admin' ? '管理员' : '用户' }}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        :class="[
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          item.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        ]"
                      >
                        {{ item.status === 'active' ? '活跃' : '禁用' }}
                      </span>
                    </TableCell>
                    <TableCell>{{ formatDate(item.createdAt) }}</TableCell>
                    <TableCell class="text-right">
                      <div class="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" @click="editItem(item)">
                          <Edit class="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" @click="deleteItem(item.id)">
                          <Trash2 class="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <!-- 分页控件 -->
            <div class="border-t pt-4">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <!-- 左侧：分页信息和页面大小选择器 -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div class="flex items-center h-8 text-sm text-muted-foreground">
                    <template v-if="filteredData.length > 0">
                      显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredData.length) }}
                      共 {{ filteredData.length }} 条记录
                    </template>
                    <template v-else>
                      共 0 条记录
                    </template>
                    <span v-if="selectedItems.length > 0" class="ml-2">
                      (已选择 {{ selectedItems.length }} 项)
                    </span>
                  </div>

                  <!-- 页面大小选择器 -->
                  <div class="flex items-center gap-2 h-8">
                    <span class="text-sm text-muted-foreground">每页</span>
                    <Select
                      :model-value="pageSize.toString()"
                      @update:model-value="changePageSize"
                    >
                      <SelectTrigger class="w-20 h-8">
                        <SelectValue :placeholder="pageSize.toString()">
                          {{ pageSize }}
                        </SelectValue>
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
                    :disabled="currentPage === 1"
                    @click="goToPage(currentPage - 1)"
                  >
                    <ChevronLeft class="h-4 w-4" />
                  </Button>

                  <!-- 页码显示 -->
                  <div class="flex items-center gap-1">
                    <template v-if="totalPages <= 5">
                      <Button
                        v-for="page in totalPages"
                        :key="page"
                        variant="outline"
                        size="sm"
                        class="h-8 min-w-[2rem] px-2"
                        :class="{ 'bg-primary text-primary-foreground': page === currentPage }"
                        @click="goToPage(page)"
                      >
                        {{ page }}
                      </Button>
                    </template>
                    <template v-else>
                      <!-- 简化的分页显示 -->
                      <span class="text-sm px-2">{{ currentPage }} / {{ totalPages }}</span>
                    </template>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    class="h-8 w-8 p-0"
                    :disabled="currentPage === totalPages"
                    @click="goToPage(currentPage + 1)"
                  >
                    <ChevronRight class="h-4 w-4" />
                  </Button>

                  <!-- 页码跳转（当页数较多时） -->
                  <div v-if="totalPages > 5" class="flex items-center gap-2 ml-4">
                    <span class="text-sm text-muted-foreground">跳转到</span>
                    <Input
                      type="number"
                      :min="1"
                      :max="totalPages"
                      :model-value="currentPage"
                      @keyup.enter="(e: any) => goToPage(parseInt((e.target as HTMLInputElement).value))"
                      class="w-16 h-8 text-center"
                      placeholder="页码"
                    />
                    <span class="text-sm text-muted-foreground">页</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 批量操作 -->
            <div v-if="selectedItems.length > 0" class="flex flex-wrap items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span class="text-sm font-medium text-blue-700">
                已选择 {{ selectedItems.length }} 项，批量操作:
              </span>
              <Button size="sm" variant="outline" @click="batchDelete" class="border-red-200 text-red-700 hover:bg-red-50">
                <Trash2 class="h-4 w-4 mr-1" />
                删除选中
              </Button>
              <Button size="sm" variant="outline" @click="batchExport" class="border-green-200 text-green-700 hover:bg-green-50">
                <Download class="h-4 w-4 mr-1" />
                导出选中
              </Button>
              <Button size="sm" variant="outline" @click="clearSelection" class="border-gray-200 text-gray-700 hover:bg-gray-50">
                取消选择
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 表格状态信息 -->
      <Card>
        <CardHeader>
          <CardTitle>📈 表格状态信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div class="p-3 bg-blue-50 rounded-lg">
              <div class="font-medium text-blue-700">总数据量</div>
              <div class="text-2xl font-bold text-blue-600">{{ tableData.length }}</div>
            </div>
            <div class="p-3 bg-green-50 rounded-lg">
              <div class="font-medium text-green-700">筛选结果</div>
              <div class="text-2xl font-bold text-green-600">{{ filteredData.length }}</div>
            </div>
            <div class="p-3 bg-purple-50 rounded-lg">
              <div class="font-medium text-purple-700">当前页面</div>
              <div class="text-2xl font-bold text-purple-600">{{ currentPage }}/{{ totalPages }}</div>
            </div>
            <div class="p-3 bg-orange-50 rounded-lg">
              <div class="font-medium text-orange-700">已选择</div>
              <div class="text-2xl font-bold text-orange-600">{{ selectedItems.length }}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import {
  RefreshCw,
  ArrowUpDown,
  Edit,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'
import { useMessage } from '~/composables/useMessage'

// 消息服务
const { showMessage } = useMessage()

// 表格数据类型
interface TableItem {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive'
  createdAt: string
}

// 状态管理
const loading = ref(false)
const tableData = ref<TableItem[]>([])
const selectedItems = ref<number[]>([])
const searchQuery = ref('')
const roleFilter = ref('')
const sortField = ref<keyof TableItem>('id')
const sortOrder = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const pageSize = ref(10)
const pageSizeOptions = ref([5, 10, 20, 50, 100])

// 生成示例数据
const generateSampleData = (): TableItem[] => {
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二']
  const domains = ['example.com', 'test.com', 'demo.com']
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: names[i % names.length] + (i > 9 ? Math.floor(i / 10) : ''),
    email: `user${i + 1}@${domains[i % domains.length]}`,
    role: Math.random() > 0.7 ? 'admin' : 'user',
    status: Math.random() > 0.2 ? 'active' : 'inactive',
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
  }))
}

// 页面加载时自动加载默认数据
tableData.value = generateSampleData()

// 加载示例数据
const loadSampleData = async () => {
  loading.value = true
  try {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    tableData.value = generateSampleData()
    showMessage('示例数据加载成功', 'success')
  } finally {
    loading.value = false
  }
}

// 清空数据
const clearData = () => {
  tableData.value = []
  selectedItems.value = []
  currentPage.value = 1
  showMessage('数据已清空', 'success')
}

// 筛选数据
const filteredData = computed(() => {
  let data = tableData.value

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query)
    )
  }

  // 角色筛选
  if (roleFilter.value) {
    data = data.filter(item => item.role === roleFilter.value)
  }

  // 排序
  data.sort((a, b) => {
    const aVal = a[sortField.value]
    const bVal = b[sortField.value]
    
    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return data
})

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredData.value.length / pageSize.value))
})

// 全选状态
const isAllSelected = computed(() => {
  return paginatedData.value.length > 0 && 
         paginatedData.value.every(item => selectedItems.value.includes(item.id))
})

// 排序
const sortBy = (field: keyof TableItem) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

// 选择操作
const toggleSelect = (id: number) => {
  const index = selectedItems.value.indexOf(id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(id)
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // 取消选择当前页所有项
    paginatedData.value.forEach(item => {
      const index = selectedItems.value.indexOf(item.id)
      if (index > -1) {
        selectedItems.value.splice(index, 1)
      }
    })
  } else {
    // 选择当前页所有项
    paginatedData.value.forEach(item => {
      if (!selectedItems.value.includes(item.id)) {
        selectedItems.value.push(item.id)
      }
    })
  }
}

// 操作函数
const editItem = (item: TableItem) => {
  showMessage(`编辑用户: ${item.name}`, 'info')
}

const deleteItem = (id: number) => {
  const index = tableData.value.findIndex(item => item.id === id)
  if (index > -1) {
    const item = tableData.value[index]
    tableData.value.splice(index, 1)
    showMessage(`已删除用户: ${item.name}`, 'success')
    
    // 移除选择
    const selectedIndex = selectedItems.value.indexOf(id)
    if (selectedIndex > -1) {
      selectedItems.value.splice(selectedIndex, 1)
    }
  }
}

const batchDelete = () => {
  const count = selectedItems.value.length
  selectedItems.value.forEach(id => {
    const index = tableData.value.findIndex(item => item.id === id)
    if (index > -1) {
      tableData.value.splice(index, 1)
    }
  })
  selectedItems.value = []
  showMessage(`已删除 ${count} 个用户`, 'success')
}

const batchExport = () => {
  const selectedData = tableData.value.filter(item => selectedItems.value.includes(item.id))
  console.log('导出数据:', selectedData)
  showMessage(`已导出 ${selectedData.length} 条记录`, 'success')
}

// 清除选择
const clearSelection = () => {
  selectedItems.value = []
  showMessage('已取消所有选择', 'success')
}

// 随机选择几项（用于演示）
const selectRandomItems = () => {
  if (paginatedData.value.length === 0) return

  // 从当前页面的数据中随机选择
  const count = Math.min(3, paginatedData.value.length) // 最多选择3项
  const randomIds: number[] = []

  while (randomIds.length < count) {
    const randomIndex = Math.floor(Math.random() * paginatedData.value.length)
    const id = paginatedData.value[randomIndex].id
    if (!randomIds.includes(id)) {
      randomIds.push(id)
    }
  }

  // 清除之前的选择，只保留新选择的项目
  selectedItems.value = [...randomIds]
  showMessage(`已从当前页随机选择 ${count} 项，可以测试批量操作功能`, 'success')
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 分页控制函数
const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

// 切换页面大小
const changePageSize = (value: any) => {
  if (!value) return
  const newSize = parseInt(String(value))
  if (newSize && newSize > 0) {
    pageSize.value = newSize
    currentPage.value = 1 // 重置到第一页
  }
}

// 监听筛选变化，重置页码
watch([searchQuery, roleFilter], () => {
  currentPage.value = 1
})

// 页面元数据
definePageMeta({
  middleware: ['auth']
})
</script>
