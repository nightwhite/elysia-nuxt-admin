<template>
  <div class="container mx-auto p-4">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">Toast 消息提示测试</h1>
      
      <Card class="mb-6">
        <CardHeader>
          <CardTitle>基础用法</CardTitle>
          <CardDescription>测试不同类型的消息提示</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button @click="showSuccess" variant="default">
              成功消息
            </Button>
            <Button @click="showError" variant="destructive">
              错误消息
            </Button>
            <Button @click="showWarning" variant="outline">
              警告消息
            </Button>
            <Button @click="showInfo" variant="secondary">
              信息消息
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card class="mb-6">
        <CardHeader>
          <CardTitle>自定义消息</CardTitle>
          <CardDescription>测试自定义标题和描述</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-4">
            <div>
              <Label for="title">标题</Label>
              <Input 
                id="title"
                v-model="customTitle" 
                placeholder="输入消息标题"
              />
            </div>
            <div>
              <Label for="description">描述</Label>
              <Input 
                id="description"
                v-model="customDescription" 
                placeholder="输入消息描述"
              />
            </div>
            <div class="flex gap-2">
              <Button @click="showCustom('success')" variant="default">
                显示成功
              </Button>
              <Button @click="showCustom('error')" variant="destructive">
                显示错误
              </Button>
              <Button @click="showCustom('warning')" variant="outline">
                显示警告
              </Button>
              <Button @click="showCustom('info')" variant="secondary">
                显示信息
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>批量操作</CardTitle>
          <CardDescription>测试多个消息和清空功能</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex gap-2">
            <Button @click="showMultiple" variant="outline">
              显示多个消息
            </Button>
            <Button @click="clearAll" variant="destructive">
              清空所有消息
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

const customTitle = ref('自定义标题')
const customDescription = ref('这是一个自定义的消息描述')

const message = useMessage()

const showSuccess = () => {
  message.success('操作成功', '您的操作已成功完成！')
}

const showError = () => {
  message.error('操作失败', '发生了一个错误，请重试。')
}

const showWarning = () => {
  message.warning('注意', '这是一个警告消息，请注意！')
}

const showInfo = () => {
  message.info('提示', '这是一个信息提示。')
}

const showCustom = (type: 'success' | 'error' | 'warning' | 'info') => {
  message[type](customTitle.value, customDescription.value)
}

const showMultiple = () => {
  message.success('第一个消息', '这是第一个成功消息')

  setTimeout(() => {
    message.warning('第二个消息', '这是第二个警告消息')
  }, 500)

  setTimeout(() => {
    message.info('第三个消息', '这是第三个信息消息')
  }, 1000)
}

const clearAll = () => {
  message.clear()
}

// 添加页面元数据
definePageMeta({
  middleware: ['auth']
})
</script>
