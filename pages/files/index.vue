<template>
  <div class="container mx-auto p-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">文件管理器</h1>
      <div class="flex gap-2">
        <Button @click="refreshFiles" variant="outline" size="sm">
          <RefreshCw class="w-4 h-4 mr-2" />
          刷新
        </Button>
        <Button
          @click="showUploadDialog = true"
          size="sm"
          :disabled="!s3Enabled"
        >
          <Upload class="w-4 h-4 mr-2" />
          上传文件
        </Button>
      </div>
    </div>

    <!-- 面包屑导航 -->
    <nav class="flex items-center space-x-2 mb-4 text-sm">
      <button
        v-for="(crumb, index) in breadcrumbs"
        :key="index"
        @click="navigateToPath(crumb.path)"
        class="flex items-center hover:text-blue-600 transition-colors"
        :class="{ 'text-gray-500': index < breadcrumbs.length - 1, 'text-gray-900 font-medium': index === breadcrumbs.length - 1 }"
      >
        <Home v-if="index === 0" class="w-4 h-4" />
        <span v-else>{{ crumb.name }}</span>
        <ChevronRight v-if="index < breadcrumbs.length - 1" class="w-4 h-4 mx-1 text-gray-400" />
      </button>
    </nav>

    <!-- 工具栏 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-4">
        <!-- 搜索框 -->
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            v-model="searchQuery"
            placeholder="搜索文件..."
            class="pl-10 w-64"
          />
        </div>
        
        <!-- 视图切换 -->
        <div class="flex border rounded-md">
          <Button
            variant="ghost"
            size="sm"
            @click="viewMode = 'grid'"
            :class="{ 'bg-gray-100': viewMode === 'grid' }"
          >
            <Grid3X3 class="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            @click="viewMode = 'list'"
            :class="{ 'bg-gray-100': viewMode === 'list' }"
          >
            <List class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <!-- 文件统计 -->
      <div class="text-sm text-gray-500">
        {{ filteredFiles.length + filteredFolders.length }} 项
      </div>
    </div>

    <!-- S3配置检查状态 -->
    <div v-if="s3ConfigLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">检查S3配置中...</span>
    </div>

    <!-- S3未启用状态 -->
    <div v-else-if="!s3Enabled" class="text-center py-12">
      <div class="text-6xl mb-4">⚠️</div>
      <div class="text-gray-600 mb-4">S3存储功能未启用</div>
      <div class="text-sm text-gray-500 mb-4">
        请在系统设置中配置并启用S3存储功能后再使用文件管理器
      </div>
      <div class="flex gap-2 justify-center">
        <Button @click="checkS3Config" variant="outline" size="sm">
          重新检查
        </Button>
        <Button @click="$router.push('/settings')" size="sm">
          前往设置
        </Button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">加载中...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-600 mb-2">{{ error }}</div>
      <div class="flex gap-2 justify-center">
        <Button @click="refreshFiles" variant="outline" size="sm">
          重试
        </Button>
        <Button @click="checkS3Config" variant="outline" size="sm">
          检查配置
        </Button>
      </div>
    </div>

    <!-- 文件列表 -->
    <div v-else>
      <!-- 网格视图 -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <!-- 文件夹 -->
        <div
          v-for="folder in filteredFolders"
          :key="folder.key"
          @click="navigateToPath(folder.key)"
          @contextmenu.prevent="showContextMenu($event, folder)"
          class="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div class="text-4xl mb-2">📁</div>
          <div class="text-sm text-center truncate w-full" :title="folder.name">
            {{ folder.name }}
          </div>
        </div>

        <!-- 文件 -->
        <div
          v-for="file in filteredFiles"
          :key="file.key"
          @click="handleFileClick(file)"
          @contextmenu.prevent="showContextMenu($event, file)"
          class="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div class="text-4xl mb-2">{{ s3Files.getFileIcon(file.mimeType, file.isFolder) }}</div>
          <div class="text-sm text-center truncate w-full" :title="file.name">
            {{ file.name }}
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {{ s3Files.formatFileSize(file.size) }}
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="border rounded-lg overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">名称</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">大小</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">修改时间</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <!-- 文件夹 -->
            <tr
              v-for="folder in filteredFolders"
              :key="folder.key"
              @click="navigateToPath(folder.key)"
              class="hover:bg-gray-50 cursor-pointer"
            >
              <td class="px-4 py-3 flex items-center">
                <span class="text-xl mr-3">📁</span>
                <span>{{ folder.name }}</span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-500">-</td>
              <td class="px-4 py-3 text-sm text-gray-500">-</td>
              <td class="px-4 py-3">
                <Button
                  @click.stop="deleteItem(folder)"
                  variant="ghost"
                  size="sm"
                  class="text-red-600 hover:text-red-700"
                >
                  <Trash2 class="w-4 h-4" />
                </Button>
              </td>
            </tr>

            <!-- 文件 -->
            <tr
              v-for="file in filteredFiles"
              :key="file.key"
              @click="handleFileClick(file)"
              class="hover:bg-gray-50 cursor-pointer"
            >
              <td class="px-4 py-3 flex items-center">
                <span class="text-xl mr-3">{{ s3Files.getFileIcon(file.mimeType, file.isFolder) }}</span>
                <span>{{ file.name }}</span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-500">
                {{ s3Files.formatFileSize(file.size) }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-500">
                {{ formatDate(file.lastModified) }}
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-1">
                  <Button
                    v-if="s3Files.isPreviewable(file.mimeType)"
                    @click.stop="openPreview(file)"
                    variant="ghost"
                    size="sm"
                  >
                    <Eye class="w-4 h-4" />
                  </Button>
                  <Button
                    @click.stop="downloadFile(file)"
                    variant="ghost"
                    size="sm"
                  >
                    <Download class="w-4 h-4" />
                  </Button>
                  <Button
                    @click.stop="deleteItem(file)"
                    variant="ghost"
                    size="sm"
                    class="text-red-600 hover:text-red-700"
                  >
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && filteredFiles.length === 0 && filteredFolders.length === 0" class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">📁</div>
        <div class="text-gray-600 mb-2">此文件夹为空</div>
        <Button @click="showUploadDialog = true" size="sm">
          <Upload class="w-4 h-4 mr-2" />
          上传第一个文件
        </Button>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="hasMore" class="flex justify-center mt-6">
      <Button @click="loadMore" variant="outline" :disabled="loadingMore">
        {{ loadingMore ? '加载中...' : '加载更多' }}
      </Button>
    </div>
  </div>

  <!-- 文件预览 -->
  <FilePreview
    v-model:open="showPreview"
    :file="previewFile"
  />

  <!-- 上传对话框 -->
  <Dialog v-model:open="showUploadDialog">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>上传文件</DialogTitle>
        <DialogDescription>
          选择要上传的文件
        </DialogDescription>
      </DialogHeader>
      
      <div class="space-y-4">
        <!-- 文件选择 -->
        <div
          @drop="handleDrop"
          @dragover.prevent
          @dragenter.prevent
          class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
        >
          <Upload class="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <div class="text-gray-600 mb-2">拖拽文件到此处或</div>
          <Button variant="outline" @click="$refs.fileInput?.click()">
            选择文件
          </Button>
          <input
            ref="fileInput"
            type="file"
            multiple
            @change="handleFileSelect"
            class="hidden"
          />
        </div>

        <!-- 选中的文件列表 -->
        <div v-if="selectedFiles.length > 0" class="space-y-2">
          <div class="text-sm font-medium">选中的文件 ({{ selectedFiles.length }})</div>
          <div class="max-h-32 overflow-y-auto space-y-1">
            <div
              v-for="(file, index) in selectedFiles"
              :key="index"
              class="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
            >
              <span class="truncate">{{ file.name }}</span>
              <Button
                @click="removeSelectedFile(index)"
                variant="ghost"
                size="sm"
              >
                <X class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="showUploadDialog = false">
          取消
        </Button>
        <Button @click="uploadSelectedFiles" :disabled="selectedFiles.length === 0 || uploading">
          {{ uploading ? '上传中...' : '上传' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '~/components/ui/dialog'
import {
  RefreshCw,
  Upload,
  Search,
  Grid3X3,
  List,
  Home,
  ChevronRight,
  Eye,
  Download,
  Trash2,
  X
} from 'lucide-vue-next'
import { useS3Files, type S3FileInfo } from '~/composables/useS3Files'
import { useS3Api } from '~/composables/useS3Api'
import { useMessage } from '~/composables/useMessage'
import FilePreview from '~/components/FilePreview.vue'

// 组合式函数
const s3Files = useS3Files()
const s3Api = useS3Api()
const { showMessage } = useMessage()

// 响应式数据
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const currentPath = ref('')
const files = ref<S3FileInfo[]>([])
const folders = ref<S3FileInfo[]>([])
const hasMore = ref(false)
const nextToken = ref<string>()
const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')

// 上传相关
const showUploadDialog = ref(false)
const selectedFiles = ref<File[]>([])
const uploading = ref(false)

// 预览相关
const showPreview = ref(false)
const previewFile = ref<S3FileInfo | null>(null)

// S3配置状态
const s3Enabled = ref(false)
const s3ConfigLoading = ref(false)

// 计算属性
const breadcrumbs = computed(() => s3Files.parseBreadcrumbs(currentPath.value))

const filteredFolders = computed(() => {
  if (!searchQuery.value) return folders.value
  return folders.value.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const filteredFiles = computed(() => {
  if (!searchQuery.value) return files.value
  return files.value.filter(file => 
    file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 方法
const checkS3Config = async () => {
  s3ConfigLoading.value = true
  try {
    const response = await s3Api.getS3Config()
    if (response.success && response.data) {
      s3Enabled.value = response.data.enabled
    } else {
      s3Enabled.value = false
    }
  } catch (error: any) {
    console.error('检查S3配置失败:', error)
    s3Enabled.value = false
  } finally {
    s3ConfigLoading.value = false
  }
}

const loadFiles = async (path: string = '', loadMore: boolean = false) => {
  // 检查S3是否启用
  if (!s3Enabled.value) {
    error.value = 'S3存储未启用，请在系统设置中启用S3存储功能'
    return
  }

  if (loadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
    error.value = ''
  }

  try {
    const response = await s3Files.getFileList({
      prefix: path,
      maxKeys: 50,
      continuationToken: loadMore ? nextToken.value : undefined
    })

    if (response.success) {
      if (loadMore) {
        files.value.push(...response.data.files)
        folders.value.push(...response.data.folders)
      } else {
        files.value = response.data.files
        folders.value = response.data.folders
        currentPath.value = response.data.currentPath
      }
      
      hasMore.value = response.data.hasMore
      nextToken.value = response.data.nextToken
    } else {
      error.value = response.message || '加载文件列表失败'
    }
  } catch (err: any) {
    error.value = err.message || '加载文件列表失败'
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const refreshFiles = () => {
  loadFiles(currentPath.value)
}

const loadMore = () => {
  if (hasMore.value && !loadingMore.value) {
    loadFiles(currentPath.value, true)
  }
}

const navigateToPath = (path: string) => {
  loadFiles(path)
}

const handleFileClick = (file: S3FileInfo) => {
  if (s3Files.isPreviewable(file.mimeType)) {
    openPreview(file)
  } else {
    downloadFile(file)
  }
}

const openPreview = (file: S3FileInfo) => {
  previewFile.value = file
  showPreview.value = true
}

const downloadFile = (file: S3FileInfo) => {
  if (file.url) {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    link.click()
  } else {
    showMessage('下载链接不可用', 'error')
  }
}

const deleteItem = async (item: S3FileInfo) => {
  if (!confirm(`确定要删除 "${item.name}" 吗？`)) return

  try {
    const response = await s3Files.deleteFile(item.key)
    if (response.success) {
      showMessage('删除成功', 'success')
      refreshFiles()
    } else {
      showMessage(response.message, 'error')
    }
  } catch (error: any) {
    showMessage('删除失败: ' + error.message, 'error')
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = Array.from(target.files)
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer?.files) {
    selectedFiles.value = Array.from(event.dataTransfer.files)
  }
}

const removeSelectedFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const uploadSelectedFiles = async () => {
  if (selectedFiles.value.length === 0) return

  // 检查S3是否启用
  if (!s3Enabled.value) {
    showMessage('S3存储未启用，无法上传文件', 'error')
    return
  }

  uploading.value = true
  console.log('前端上传参数:', {
    fileCount: selectedFiles.value.length,
    currentPath: currentPath.value,
    files: selectedFiles.value.map(f => f.name)
  })

  try {
    const results = await s3Files.uploadFiles(selectedFiles.value, currentPath.value)
    
    const successCount = results.filter(r => r.result.success).length
    const failCount = results.length - successCount
    
    if (failCount === 0) {
      showMessage(`成功上传 ${successCount} 个文件`, 'success')
    } else {
      showMessage(`上传完成：${successCount} 成功，${failCount} 失败`, 'warning')
    }
    
    selectedFiles.value = []
    showUploadDialog.value = false
    refreshFiles()
  } catch (error: any) {
    showMessage('上传失败: ' + error.message, 'error')
  } finally {
    uploading.value = false
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN')
}

const showContextMenu = (event: MouseEvent, item: S3FileInfo) => {
  // TODO: 实现右键菜单
  console.log('Context menu for:', item.name)
}

// 生命周期
onMounted(async () => {
  await checkS3Config()
  if (s3Enabled.value) {
    loadFiles()
  }
})

// 页面元数据
definePageMeta({
  middleware: ['auth']
})
</script>
