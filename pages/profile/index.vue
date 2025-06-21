<template>
  <div class="container mx-auto p-4">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl md:text-3xl font-bold mb-6">个人资料</h1>
      
      <div class="grid gap-6 md:grid-cols-3">
        <!-- 左侧：头像和基本信息 -->
        <div class="md:col-span-1">
          <Card>
            <CardContent class="p-6">
              <div class="flex flex-col items-center text-center">
                <Avatar class="h-24 w-24 mb-4">
                  <AvatarImage v-if="userProfile?.avatar" :src="userProfile.avatar" />
                  <AvatarFallback class="bg-primary/10 text-primary text-2xl font-medium">
                    {{ userProfile?.name?.substring(0, 1) || 'U' }}
                  </AvatarFallback>
                </Avatar>
                
                <h2 class="text-xl font-semibold mb-1">{{ userProfile?.name || '未知用户' }}</h2>
                <p class="text-sm text-muted-foreground mb-2">@{{ userProfile?.username || 'unknown' }}</p>
                
                <div class="flex items-center justify-center mb-4">
                  <ShieldAlert v-if="userProfile?.role === 'admin'" class="h-4 w-4 mr-2 text-primary" />
                  <UserIcon v-else class="h-4 w-4 mr-2 text-muted-foreground" />
                  <span class="text-sm">{{ userProfile?.role === 'admin' ? '系统管理员' : '普通用户' }}</span>
                </div>
                
                <Button @click="isEditMode = true" class="w-full" :disabled="loading">
                  <Edit class="h-4 w-4 mr-2" />
                  编辑资料
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- 右侧：详细信息 -->
        <div class="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>查看和编辑您的个人信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="loading" class="flex items-center justify-center py-8">
                <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
                <span class="ml-2 text-muted-foreground">加载中...</span>
              </div>
              
              <div v-else-if="error" class="text-center py-8">
                <AlertTriangle class="h-8 w-8 text-destructive mb-2 mx-auto" />
                <p class="text-destructive/80 text-sm mb-4">{{ error }}</p>
                <Button variant="outline" size="sm" @click="fetchProfile">重试</Button>
              </div>
              
              <div v-else class="space-y-6">
                <!-- 只读模式 -->
                <div v-if="!isEditMode" class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label class="text-sm font-medium text-muted-foreground">姓名</Label>
                      <p class="mt-1 text-sm">{{ userProfile?.name || '未设置' }}</p>
                    </div>
                    <div>
                      <Label class="text-sm font-medium text-muted-foreground">用户名</Label>
                      <p class="mt-1 text-sm">{{ userProfile?.username || '未设置' }}</p>
                    </div>
                    <div>
                      <Label class="text-sm font-medium text-muted-foreground">邮箱</Label>
                      <p class="mt-1 text-sm">{{ userProfile?.email || '未设置' }}</p>
                    </div>
                    <div>
                      <Label class="text-sm font-medium text-muted-foreground">角色</Label>
                      <p class="mt-1 text-sm">{{ userProfile?.role === 'admin' ? '系统管理员' : '普通用户' }}</p>
                    </div>
                    <div>
                      <Label class="text-sm font-medium text-muted-foreground">创建时间</Label>
                      <p class="mt-1 text-sm">{{ formatDate(userProfile?.created_at) }}</p>
                    </div>
                    <div>
                      <Label class="text-sm font-medium text-muted-foreground">最后更新</Label>
                      <p class="mt-1 text-sm">{{ formatDate(userProfile?.updated_at) }}</p>
                    </div>
                  </div>
                </div>

                <!-- 编辑模式 -->
                <form v-else @submit.prevent="handleSave" class="space-y-4">
                  <div v-if="saveError" class="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                    <p class="text-sm text-destructive">{{ saveError }}</p>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label for="name">姓名 *</Label>
                      <Input
                        id="name"
                        v-model="editForm.name"
                        placeholder="请输入姓名"
                        autocomplete="name"
                        :disabled="saving"
                        required
                      />
                    </div>
                    <div>
                      <Label for="username">用户名 *</Label>
                      <Input
                        id="username"
                        v-model="editForm.username"
                        placeholder="请输入用户名"
                        autocomplete="username"
                        :disabled="saving"
                        required
                      />
                    </div>
                    <div class="md:col-span-2">
                      <Label for="email">邮箱</Label>
                      <Input
                        id="email"
                        v-model="editForm.email"
                        type="email"
                        placeholder="请输入邮箱"
                        autocomplete="email"
                        :disabled="saving"
                      />
                    </div>
                    <div class="md:col-span-2">
                      <Label for="password">新密码</Label>
                      <Input
                        id="password"
                        v-model="editForm.password"
                        type="password"
                        placeholder="留空则不修改密码"
                        autocomplete="new-password"
                        :disabled="saving"
                      />
                      <div class="mt-2 text-xs text-muted-foreground">
                        <p>密码要求：</p>
                        <ul class="list-disc list-inside space-y-1 mt-1">
                          <li :class="passwordValidation.length ? 'text-green-600' : 'text-muted-foreground'">
                            至少8个字符
                          </li>
                          <li :class="passwordValidation.uppercase ? 'text-green-600' : 'text-muted-foreground'">
                            包含大写字母
                          </li>
                          <li :class="passwordValidation.lowercase ? 'text-green-600' : 'text-muted-foreground'">
                            包含小写字母
                          </li>
                          <li :class="passwordValidation.number ? 'text-green-600' : 'text-muted-foreground'">
                            包含数字
                          </li>
                          <li :class="passwordValidation.special ? 'text-green-600' : 'text-muted-foreground'">
                            包含特殊字符 (!@#$%^&*(),.?":{}|&lt;&gt;)
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div class="md:col-span-2">
                      <Label for="confirmPassword">确认新密码</Label>
                      <Input
                        id="confirmPassword"
                        v-model="editForm.confirmPassword"
                        type="password"
                        placeholder="请再次输入新密码"
                        autocomplete="new-password"
                        :disabled="saving"
                        :class="{ 'border-red-500': editForm.password && editForm.confirmPassword && editForm.password !== editForm.confirmPassword }"
                      />
                      <p v-if="editForm.password && editForm.confirmPassword && editForm.password !== editForm.confirmPassword"
                         class="mt-1 text-xs text-red-600">
                        两次输入的密码不一致
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-3 pt-4">
                    <Button
                      type="submit"
                      :disabled="saving || (editForm.password && !isPasswordValid) || (editForm.password && editForm.confirmPassword && editForm.password !== editForm.confirmPassword)"
                    >
                      <Loader2 v-if="saving" class="h-4 w-4 mr-2 animate-spin" />
                      <Save v-else class="h-4 w-4 mr-2" />
                      保存更改
                    </Button>
                    <Button type="button" variant="outline" @click="cancelEdit" :disabled="saving">
                      <X class="h-4 w-4 mr-2" />
                      取消
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { 
  Edit, Save, X, Loader2, AlertTriangle, 
  ShieldAlert, User as UserIcon 
} from 'lucide-vue-next'
import { useUserApi } from '~/composables/useUserApi'
import { useAuth } from '~/composables/useAuth'
import { useMessage } from '~/composables/useMessage'

// 类型定义
interface UserProfile {
  id: number
  username: string
  name: string
  email?: string
  role: string
  avatar?: string
  created_at: string
  updated_at: string
}

interface EditForm {
  name: string
  username: string
  email: string
  password: string
  confirmPassword: string
}

// 状态管理
const userProfile = ref<UserProfile | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const isEditMode = ref(false)
const saving = ref(false)
const saveError = ref<string | null>(null)

// 编辑表单
const editForm = ref<EditForm>({
  name: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// API 和工具
const userApi = useUserApi()
const { user, updateUser } = useAuth()
const message = useMessage()

// 获取用户资料
const fetchProfile = async () => {
  if (!user.value?.id) {
    error.value = '用户信息不存在'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    const profile = await userApi.getUserById(user.value.id)
    userProfile.value = profile
  } catch (e: any) {
    error.value = e.message || '获取用户资料失败'
    console.error('获取用户资料失败:', e)
  } finally {
    loading.value = false
  }
}

// 初始化编辑表单
const initEditForm = () => {
  if (userProfile.value) {
    editForm.value = {
      name: userProfile.value.name || '',
      username: userProfile.value.username || '',
      email: userProfile.value.email || '',
      password: '',
      confirmPassword: ''
    }
  }
}

// 取消编辑
const cancelEdit = () => {
  isEditMode.value = false
  saveError.value = null
  initEditForm()
}

// 保存更改
const handleSave = async () => {
  if (!userProfile.value) return

  // 验证表单
  if (!editForm.value.name.trim() || !editForm.value.username.trim()) {
    saveError.value = '姓名和用户名不能为空'
    return
  }

  if (editForm.value.password && editForm.value.password !== editForm.value.confirmPassword) {
    saveError.value = '两次输入的密码不一致'
    return
  }

  if (editForm.value.password && !isPasswordValid.value) {
    saveError.value = '密码不符合强度要求，请检查密码要求'
    return
  }

  saving.value = true
  saveError.value = null

  try {
    const updateData: any = {
      name: editForm.value.name.trim(),
      username: editForm.value.username.trim(),
      email: editForm.value.email.trim() || undefined
    }

    if (editForm.value.password) {
      updateData.password = editForm.value.password
    }

    await userApi.updateUser(userProfile.value.id, updateData)
    
    // 更新本地用户信息
    await updateUser()
    
    // 重新获取资料
    await fetchProfile()
    
    isEditMode.value = false
    message.success('保存成功', '个人资料已更新')
  } catch (e: any) {
    saveError.value = e.message || '保存失败'
    message.error('保存失败', e.message || '更新个人资料失败')
  } finally {
    saving.value = false
  }
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '未知'
  try {
    return new Date(dateString).toLocaleString('zh-CN')
  } catch {
    return '无效日期'
  }
}

// 密码强度验证
const passwordValidation = computed(() => {
  const password = editForm.value.password
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
})

// 检查密码是否符合所有要求
const isPasswordValid = computed(() => {
  if (!editForm.value.password) return true // 空密码表示不修改
  const validation = passwordValidation.value
  return validation.length && validation.uppercase && validation.lowercase && validation.number && validation.special
})

// 监听编辑模式变化
watch(isEditMode, (newValue) => {
  if (newValue) {
    initEditForm()
  }
})

// 组件挂载时获取数据
onMounted(() => {
  fetchProfile()
})

// 添加页面元数据
definePageMeta({
  middleware: ['auth']
})
</script>
