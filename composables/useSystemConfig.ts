import { ref, computed, readonly } from 'vue'
import { useSystemConfigApi, type SystemInfo } from './useSystemConfigApi'

// 全局系统配置状态
const systemConfig = ref<SystemInfo>({
  name: 'Admin System',
  logo: 'A',
  logoUrl: '',
  description: '现代化的后台管理系统',
  version: '1.0.0',
  copyright: '© 2024 Admin System. All rights reserved.'
})

// 加载状态
const isLoading = ref(false)
const isLoaded = ref(false)

/**
 * 全局系统配置组合函数
 */
export function useSystemConfig() {
  const systemConfigApi = useSystemConfigApi()

  /**
   * 加载系统配置
   */
  const loadSystemConfig = async () => {
    if (isLoading.value) return
    
    isLoading.value = true
    try {
      const response = await systemConfigApi.getSystemInfo()
      
      if (response.success && response.data) {
        systemConfig.value = response.data
        isLoaded.value = true
      }
    } catch (error) {
      console.error('加载系统配置失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 刷新系统配置
   */
  const refreshSystemConfig = async () => {
    isLoaded.value = false
    await loadSystemConfig()
  }

  /**
   * 获取系统名称
   */
  const systemName = computed(() => systemConfig.value.name)

  /**
   * 获取系统Logo
   */
  const systemLogo = computed(() => {
    // 如果有Logo图片URL，优先使用图片
    if (systemConfig.value.logoUrl) {
      return {
        type: 'image',
        value: systemConfig.value.logoUrl
      }
    }
    // 否则使用文字Logo
    return {
      type: 'text',
      value: systemConfig.value.logo || 'A'
    }
  })

  /**
   * 获取系统描述
   */
  const systemDescription = computed(() => systemConfig.value.description)

  /**
   * 获取系统版本
   */
  const systemVersion = computed(() => systemConfig.value.version)

  /**
   * 获取版权信息
   */
  const systemCopyright = computed(() => systemConfig.value.copyright)

  /**
   * 获取完整的系统信息
   */
  const systemInfo = computed(() => systemConfig.value)

  // 如果还没有加载过配置，自动加载一次
  if (!isLoaded.value && !isLoading.value) {
    loadSystemConfig()
  }

  return {
    // 状态
    systemConfig: readonly(systemConfig),
    isLoading: readonly(isLoading),
    isLoaded: readonly(isLoaded),
    
    // 计算属性
    systemName,
    systemLogo,
    systemDescription,
    systemVersion,
    systemCopyright,
    systemInfo,
    
    // 方法
    loadSystemConfig,
    refreshSystemConfig
  }
}
