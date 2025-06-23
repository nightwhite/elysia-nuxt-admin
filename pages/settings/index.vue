<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">系统设置</h1>
    </div>

    <div class="grid gap-6">
      <!-- 基本设置 -->
      <Card>
        <CardHeader>
          <CardTitle>基本设置</CardTitle>
          <CardDescription>
            系统的基本配置项
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div>
              <Label>系统名称</Label>
              <Input placeholder="输入系统名称" />
            </div>
            <div>
              <Label>系统描述</Label>
              <Input placeholder="输入系统描述" />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 安全设置 -->
      <Card>
        <CardHeader>
          <CardTitle>安全设置</CardTitle>
          <CardDescription>
            系统安全相关的配置
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label for="terms">启用双因素认证</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox id="terms2" />
              <Label for="terms2">启用登录验证码</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- S3存储配置 -->
      <Card>
        <CardHeader>
          <CardTitle>S3存储配置</CardTitle>
          <CardDescription>
            配置S3对象存储服务
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="saveS3Config" class="space-y-4">
            <!-- 启用状态 -->
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <input
                  id="enabled"
                  type="checkbox"
                  v-model="s3Form.enabled"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <Label for="enabled">启用S3存储</Label>
              </div>
              <p class="text-sm text-gray-500">
                {{ s3Form.enabled ? '✅ S3存储已启用，文件管理器功能可用' : '⚠️ S3存储已禁用，文件管理器功能不可用' }}
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="aws_access_key_id">AWS Access Key ID *</Label>
                <Input
                  id="aws_access_key_id"
                  v-model="s3Form.aws_access_key_id"
                  placeholder="输入AWS Access Key ID"
                  autocomplete="off"
                  required
                />
              </div>
              <div>
                <Label for="aws_secret_access_key">AWS Secret Access Key *</Label>
                <Input
                  id="aws_secret_access_key"
                  v-model="s3Form.aws_secret_access_key"
                  type="text"
                  placeholder="输入AWS Secret Access Key"
                  autocomplete="off"
                  required
                />
              </div>
              <div>
                <Label for="bucket_name">Bucket Name *</Label>
                <Input
                  id="bucket_name"
                  v-model="s3Form.bucket_name"
                  placeholder="输入Bucket名称"
                  autocomplete="off"
                  required
                />
              </div>
              <div>
                <Label for="region_name">Region Name *</Label>
                <Input
                  id="region_name"
                  v-model="s3Form.region_name"
                  placeholder="输入Region名称"
                  autocomplete="off"
                  required
                />
              </div>
              <div class="md:col-span-2">
                <Label for="endpoint_url">Endpoint URL (可选)</Label>
                <Input
                  id="endpoint_url"
                  v-model="s3Form.endpoint_url"
                  placeholder="输入自定义Endpoint URL (留空使用AWS默认)"
                  autocomplete="off"
                />
              </div>
              <div>
                <Label for="folder">文件夹 (可选)</Label>
                <Input
                  id="folder"
                  v-model="s3Form.folder"
                  placeholder="输入存储文件夹路径"
                  autocomplete="off"
                />
              </div>
              <div>
                <Label for="bucket_url">Bucket URL (可选)</Label>
                <Input
                  id="bucket_url"
                  v-model="s3Form.bucket_url"
                  placeholder="输入Bucket访问URL"
                  autocomplete="off"
                />
              </div>
            </div>

            <div class="flex gap-2 pt-4">
              <Button
                type="submit"
                :disabled="s3Loading"
              >
                <span v-if="s3Loading">保存中...</span>
                <span v-else>保存配置</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                @click="testS3Connection"
                :disabled="s3Loading || !isS3FormValid"
              >
                <span v-if="testLoading">测试中...</span>
                <span v-else>测试连接</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- 其他设置 -->
      <Card>
        <CardHeader>
          <CardTitle>其他设置</CardTitle>
          <CardDescription>
            其他系统配置项
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div>
              <Label>时区设置</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="选择时区" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asia-shanghai">Asia/Shanghai</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Button } from '~/components/ui/button'
import { useS3Api, type S3ConfigForm } from '~/composables/useS3Api'
import { useMessage } from '~/composables/useMessage'

// S3配置表单数据
const s3Form = ref<S3ConfigForm>({
  enabled: false, // 默认为false，等待从API加载真实值
  endpoint_url: '',
  aws_access_key_id: '',
  aws_secret_access_key: '',
  region_name: '',
  bucket_name: '',
  folder: '',
  bucket_url: ''
})

// 加载状态
const s3Loading = ref(false)
const testLoading = ref(false)

// API和消息服务
const s3Api = useS3Api()
const { showMessage } = useMessage()

// 表单验证
const isS3FormValid = computed(() => {
  return s3Form.value.aws_access_key_id &&
         s3Form.value.aws_secret_access_key &&
         s3Form.value.bucket_name &&
         s3Form.value.region_name
})

// 加载S3配置
const loadS3Config = async () => {
  try {
    const response = await s3Api.getS3Config()

    if (response.success && response.data) {
      s3Form.value = {
        enabled: Boolean(response.data.enabled), // 确保转换为布尔值
        endpoint_url: response.data.endpoint_url || '',
        aws_access_key_id: response.data.aws_access_key_id,
        aws_secret_access_key: response.data.aws_secret_access_key,
        region_name: response.data.region_name,
        bucket_name: response.data.bucket_name,
        folder: response.data.folder || '',
        bucket_url: response.data.bucket_url || ''
      }
    }
  } catch (error: any) {
    showMessage('加载S3配置失败: ' + error.message, 'error')
  }
}

// 保存S3配置
const saveS3Config = async () => {
  if (!isS3FormValid.value) {
    showMessage('请填写所有必填字段', 'error')
    return
  }

  s3Loading.value = true
  try {
    const response = await s3Api.saveS3Config(s3Form.value)
    if (response.success) {
      const statusMessage = s3Form.value.enabled
        ? 'S3配置保存成功，文件管理器功能已启用'
        : 'S3配置保存成功，文件管理器功能已禁用'
      showMessage(statusMessage, 'success')
      // 重新加载配置
      await loadS3Config()
    } else {
      showMessage('保存失败', 'error')
    }
  } catch (error: any) {
    showMessage('保存S3配置失败: ' + error.message, 'error')
  } finally {
    s3Loading.value = false
  }
}


// 测试S3连接
const testS3Connection = async () => {
  if (!isS3FormValid.value) {
    showMessage('请填写所有必填字段', 'error')
    return
  }

  testLoading.value = true
  try {
    const result = await s3Api.testS3Connection(s3Form.value)
    if (result.success) {
      showMessage(result.message, 'success')
    } else {
      showMessage(result.message, 'error')
    }
  } catch (error: any) {
    showMessage('测试连接失败: ' + error.message, 'error')
  } finally {
    testLoading.value = false
  }
}

// 组件挂载时加载配置
onMounted(() => {
  loadS3Config()
})

// 添加登录验证
definePageMeta({
  middleware: ['auth']
})
</script>