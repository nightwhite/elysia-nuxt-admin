<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-hidden">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <span class="text-2xl">{{ getFileIcon(file?.mimeType, false) }}</span>
          <span>{{ file?.name }}</span>
        </DialogTitle>
        <DialogDescription>
          <div class="flex items-center gap-4 text-sm">
            <span>大小: {{ formatFileSize(file?.size || 0) }}</span>
            <span>修改时间: {{ formatDate(file?.lastModified) }}</span>
            <span v-if="file?.mimeType">类型: {{ file.mimeType }}</span>
          </div>
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 overflow-auto">
        <!-- 加载状态 -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-2">加载中...</span>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="text-center py-12">
          <div class="text-red-600 mb-2">{{ error }}</div>
          <Button @click="loadPreview" variant="outline" size="sm">
            重试
          </Button>
        </div>

        <!-- 预览内容 -->
        <div v-else-if="previewUrl" class="space-y-4">
          <!-- 图片预览 -->
          <div v-if="isImage" class="text-center">
            <img 
              :src="previewUrl" 
              :alt="file?.name"
              class="max-w-full max-h-[60vh] object-contain mx-auto rounded-lg shadow-lg"
              @error="handlePreviewError"
            />
          </div>

          <!-- 视频预览 -->
          <div v-else-if="isVideo" class="text-center">
            <video 
              :src="previewUrl" 
              controls
              class="max-w-full max-h-[60vh] mx-auto rounded-lg shadow-lg"
              @error="handlePreviewError"
            >
              您的浏览器不支持视频播放
            </video>
          </div>

          <!-- 音频预览 -->
          <div v-else-if="isAudio" class="text-center py-8">
            <div class="text-6xl mb-4">🎵</div>
            <audio 
              :src="previewUrl" 
              controls
              class="w-full max-w-md mx-auto"
              @error="handlePreviewError"
            >
              您的浏览器不支持音频播放
            </audio>
          </div>

          <!-- PDF预览 -->
          <div v-else-if="isPdf" class="h-[60vh]">
            <iframe
              :src="previewUrl"
              class="w-full h-full border rounded-lg"
              @error="handlePreviewError"
            >
            </iframe>
            <div v-if="error" class="text-center mt-4">
              <p>您的浏览器不支持PDF预览。<a :href="previewUrl" target="_blank" class="text-blue-600 hover:underline">点击下载</a></p>
            </div>
          </div>

          <!-- 文本预览 -->
          <div v-else-if="isText" class="bg-gray-50 p-4 rounded-lg max-h-[60vh] overflow-auto">
            <pre v-if="textContent" class="whitespace-pre-wrap text-sm">{{ textContent }}</pre>
            <div v-else class="text-center py-8">
              <div class="text-gray-500 mb-2">正在加载文本内容...</div>
            </div>
          </div>

          <!-- 不支持的文件类型 -->
          <div v-else class="text-center py-12">
            <div class="text-6xl mb-4">{{ getFileIcon(file?.mimeType, false) }}</div>
            <div class="text-gray-600 mb-4">此文件类型不支持预览</div>
            <Button @click="downloadFile" variant="outline">
              <Download class="w-4 h-4 mr-2" />
              下载文件
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter class="flex justify-between">
        <div class="flex gap-2">
          <Button @click="downloadFile" variant="outline" size="sm">
            <Download class="w-4 h-4 mr-2" />
            下载
          </Button>
          <Button @click="copyLink" variant="outline" size="sm">
            <Copy class="w-4 h-4 mr-2" />
            复制链接
          </Button>
          <Button @click="showUrlOptions" variant="outline" size="sm">
            <Copy class="w-4 h-4 mr-2" />
            获取URL
          </Button>
        </div>
        <Button @click="closePreview" variant="outline">
          关闭
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- URL选项对话框 -->
  <Dialog v-model:open="showUrlDialog">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>文件访问链接</DialogTitle>
        <DialogDescription>
          选择要复制的链接类型
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <!-- 公共URL -->
        <div v-if="fileUrls?.publicUrl" class="space-y-2">
          <Label class="text-sm font-medium">公共访问链接 (CDN)</Label>
          <div class="flex gap-2">
            <Input
              :value="fileUrls.publicUrl"
              readonly
              class="text-sm"
            />
            <Button
              @click="copyToClipboard(fileUrls.publicUrl, '公共链接')"
              variant="outline"
              size="sm"
            >
              <Copy class="w-4 h-4" />
            </Button>
          </div>
          <p class="text-xs text-gray-500">
            永久有效的公共访问链接，适合分享和嵌入
          </p>
        </div>

        <!-- 预签名URL -->
        <div v-if="fileUrls?.signedUrl" class="space-y-2">
          <Label class="text-sm font-medium">临时访问链接</Label>
          <div class="flex gap-2">
            <Input
              :value="fileUrls.signedUrl"
              readonly
              class="text-sm"
            />
            <Button
              @click="copyToClipboard(fileUrls.signedUrl, '临时链接')"
              variant="outline"
              size="sm"
            >
              <Copy class="w-4 h-4" />
            </Button>
          </div>
          <p class="text-xs text-gray-500">
            1小时内有效的安全访问链接
          </p>
        </div>

        <!-- 加载状态 -->
        <div v-if="urlsLoading" class="text-center py-4">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <span class="text-sm text-gray-600 mt-2">获取链接中...</span>
        </div>
      </div>

      <DialogFooter>
        <Button @click="showUrlDialog = false" variant="outline">
          关闭
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Download, Copy } from 'lucide-vue-next'
import { useS3Files, type S3FileInfo } from '~/composables/useS3Files'
import { useMessage } from '~/composables/useMessage'

// Props
interface Props {
  file: S3FileInfo | null
  open: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

// 组合式函数
const s3Files = useS3Files()
const { showMessage } = useMessage()

// 响应式数据
const loading = ref(false)
const error = ref('')
const previewUrl = ref('')
const textContent = ref('')
const showUrlDialog = ref(false)
const urlsLoading = ref(false)
const fileUrls = ref<{ signedUrl: string; publicUrl?: string } | null>(null)

// 计算属性
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const isImage = computed(() => 
  props.file?.mimeType?.startsWith('image/') || false
)

const isVideo = computed(() => 
  props.file?.mimeType?.startsWith('video/') || false
)

const isAudio = computed(() => 
  props.file?.mimeType?.startsWith('audio/') || false
)

const isPdf = computed(() => 
  props.file?.mimeType?.includes('pdf') || false
)

const isText = computed(() => 
  props.file?.mimeType?.startsWith('text/') || false
)

// 方法
const loadPreview = async () => {
  if (!props.file) return

  loading.value = true
  error.value = ''
  textContent.value = ''

  try {
    // 如果文件已经有URL，直接使用
    if (props.file.url) {
      previewUrl.value = props.file.url
    } else {
      // 获取预览URL
      const response = await s3Files.getFilePreviewUrl(props.file.key)
      if (response.success && response.data?.url) {
        previewUrl.value = response.data.url
      } else {
        throw new Error(response.message || '获取预览链接失败')
      }
    }

    // 如果是文本文件，加载文本内容
    if (isText.value && previewUrl.value) {
      try {
        const textResponse = await fetch(previewUrl.value)
        if (textResponse.ok) {
          textContent.value = await textResponse.text()
        }
      } catch (textError) {
        console.warn('加载文本内容失败:', textError)
      }
    }
  } catch (err: any) {
    error.value = err.message || '加载预览失败'
  } finally {
    loading.value = false
  }
}

const handlePreviewError = () => {
  error.value = '预览加载失败'
}

const downloadFile = () => {
  if (previewUrl.value && props.file) {
    const link = document.createElement('a')
    link.href = previewUrl.value
    link.download = props.file.name
    link.click()
  }
}

const copyLink = async () => {
  if (previewUrl.value) {
    try {
      await navigator.clipboard.writeText(previewUrl.value)
      showMessage('链接已复制到剪贴板', 'success')
    } catch (error) {
      showMessage('复制链接失败', 'error')
    }
  }
}

const showUrlOptions = async () => {
  if (!props.file) return

  urlsLoading.value = true
  showUrlDialog.value = true

  try {
    const response = await s3Files.getFileUrls(props.file.key)
    if (response.success && response.data) {
      fileUrls.value = response.data
    } else {
      showMessage('获取文件链接失败', 'error')
    }
  } catch (error: any) {
    showMessage('获取文件链接失败: ' + error.message, 'error')
  } finally {
    urlsLoading.value = false
  }
}

const copyToClipboard = async (text: string, type: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showMessage(`${type}已复制到剪贴板`, 'success')
  } catch (error) {
    showMessage(`复制${type}失败`, 'error')
  }
}

const closePreview = () => {
  isOpen.value = false
}

const formatFileSize = (bytes: number): string => {
  return s3Files.formatFileSize(bytes)
}

const formatDate = (date?: Date): string => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const getFileIcon = (mimeType?: string, isFolder?: boolean): string => {
  return s3Files.getFileIcon(mimeType, isFolder)
}

// 监听文件变化
watch(() => props.file, (newFile) => {
  if (newFile && props.open) {
    loadPreview()
  }
}, { immediate: true })

// 监听打开状态
watch(() => props.open, (isOpen) => {
  if (isOpen && props.file) {
    loadPreview()
  } else {
    // 清理状态
    previewUrl.value = ''
    textContent.value = ''
    error.value = ''
  }
})
</script>
