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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'

// 添加登录验证
definePageMeta({
  middleware: ['auth']
})
</script> 