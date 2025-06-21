<template>
  <Sheet :open="isOpen" @update:open="$emit('update:isOpen', $event)" class="sheet-animation">
    <SheetContent class="sm:max-w-md p-0 overflow-y-auto" :class="{'sheet-content-show': isOpen}">
      <SheetHeader class="sr-only">
        <SheetTitle>{{ isEditing ? '编辑用户' : '添加用户' }}</SheetTitle>
        <SheetDescription>{{ isEditing ? '修改用户信息' : '创建新用户账号' }}</SheetDescription>
      </SheetHeader>
      <div class="flex flex-col h-full">
        <!-- 模态框头部 -->
        <div class="p-6 border-b">
          <div class="flex items-center">
            <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
              <UserPlus class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 class="text-lg font-medium">{{ isEditing ? '编辑用户' : '添加用户' }}</h3>
              <p class="text-sm text-muted-foreground">{{ isEditing ? '修改用户信息' : '创建新用户账号' }}</p>
            </div>
          </div>
        </div>

        <!-- 表单主体 -->
        <div class="flex-1 overflow-y-auto p-6">
          <form @submit.prevent="handleSubmit">
            <!-- 基本信息 -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-muted-foreground mb-3">基本信息</h4>
              <div class="space-y-4">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <Label for="username" class="text-sm">
                      用户名 <span class="text-destructive">*</span>
                    </Label>
                  </div>
                  <div class="relative">
                    <Input
                      id="username"
                      v-model="formData.username"
                      :disabled="isEditing"
                      required
                      autocomplete="username"
                      class="pr-9"
                    />
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                      <AtSign class="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <p class="text-xs text-muted-foreground mt-1">用户登录系统的唯一标识</p>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-2">
                    <Label for="name" class="text-sm">
                      姓名 <span class="text-destructive">*</span>
                    </Label>
                  </div>
                  <div class="relative">
                    <Input
                      id="name"
                      v-model="formData.name"
                      required
                      autocomplete="name"
                      class="pr-9"
                    />
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                      <UserIcon class="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 安全信息 -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-muted-foreground mb-3">安全信息</h4>
              <div class="space-y-4">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <Label for="password" class="text-sm">
                      密码 <span v-if="!isEditing" class="text-destructive">*</span>
                    </Label>
                  </div>
                  <div class="relative">
                    <Input
                      id="password"
                      v-model="formData.password"
                      type="password"
                      :placeholder="isEditing ? '不修改请留空' : '请输入密码'"
                      :required="!isEditing"
                      autocomplete="new-password"
                      class="pr-9"
                    />
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                      <LockKeyhole class="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <p v-if="isEditing" class="text-xs text-muted-foreground mt-1">如不需要修改密码，请保留为空</p>
                </div>

                <div>
                  <Label for="role" class="text-sm mb-2 block">
                    角色 <span class="text-destructive">*</span>
                  </Label>
                  <Select :model-value="formData.role" @update:model-value="(value) => formData.role = String(value)">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="选择角色" />
                    </SelectTrigger>
                    <SelectContent>
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
                </div>
              </div>
            </div>

            <!-- 联系信息 -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-muted-foreground mb-3">联系信息</h4>
              <div>
                <Label for="email" class="text-sm mb-2 block">电子邮箱</Label>
                <div class="relative">
                  <Input
                    id="email"
                    v-model="formData.email"
                    type="email"
                    autocomplete="email"
                    class="pr-9"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Mail class="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>

            <div v-if="error" class="flex p-4 border-l-4 border-destructive bg-destructive/10 rounded mb-6">
              <AlertTriangle class="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
              <p class="text-destructive text-sm">{{ error }}</p>
            </div>
          </form>
        </div>

        <!-- 模态框底部 -->
        <div class="p-4 bg-muted/30 border-t flex items-center justify-end gap-2">
          <Button type="button" variant="outline" @click="handleClose">
            取消
          </Button>
          <Button type="button" @click="handleSubmit" :disabled="saving" class="gap-2">
            <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
            <Save v-else class="h-4 w-4" />
            {{ isEditing ? '更新用户' : '创建用户' }}
          </Button>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Button } from '~/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '~/components/ui/sheet'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import {
  AlertTriangle, Save, Loader2, LockKeyhole,
  AtSign, User as UserIcon, ShieldAlert, UserPlus, Mail
} from 'lucide-vue-next'

import type { User } from '~/composables/useUserApi'

interface UserFormData {
  id?: number
  username: string
  name: string
  password: string
  role: string
  email?: string
}

interface Props {
  isOpen: boolean
  user?: User | null
  saving?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
  saving: false,
  error: null
})

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'save': [data: UserFormData]
}>()

const formData = ref<UserFormData>({
  username: '',
  name: '',
  password: '',
  role: 'user',
  email: ''
})

const isEditing = computed(() => !!props.user?.id)

// 监听用户数据变化
watch(() => props.user, (user) => {
  if (user) {
    // 编辑现有用户
    formData.value = {
      id: user.id,
      username: user.username,
      name: user.name,
      password: '', // 不回填密码
      role: user.role,
      email: user.email
    }
  } else {
    // 创建新用户
    formData.value = {
      username: '',
      name: '',
      password: '',
      role: 'user',
      email: ''
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  emit('save', { ...formData.value })
}

const handleClose = () => {
  emit('update:isOpen', false)
}
</script>

<style scoped>
.sheet-animation {
  --sheet-animation-duration: 300ms;
}

.sheet-content-show {
  animation: sheet-content-slide-in var(--sheet-animation-duration) cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-radius: 12px 0 0 12px;
  border-left: 1px solid rgba(var(--color-border), 0.2);
}

@keyframes sheet-content-slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
