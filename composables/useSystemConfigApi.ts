import { useApi } from './useApi'

// 系统配置类型定义
export interface SystemConfig {
  id?: number
  config_key: string
  config_value: string | null
  config_type: 'string' | 'number' | 'boolean' | 'json'
  description?: string
  created_at?: string
  updated_at?: string
}

// 系统基本信息类型
export interface SystemInfo {
  name: string
  logo: string
  logoUrl: string
  description: string
  version: string
  copyright: string
}

// 系统配置更新请求类型
export interface SystemConfigUpdateRequest {
  configs: Array<{
    key: string
    value: string | null
    type?: SystemConfig['config_type']
    description?: string
  }>
}

// API响应类型
export interface SystemConfigResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

/**
 * 系统配置API组合函数
 */
export function useSystemConfigApi() {
  const api = useApi()

  /**
   * 获取所有系统配置
   */
  const getAllConfigs = async (): Promise<SystemConfigResponse<SystemConfig[]>> => {
    return await api.get('/api/system-config')
  }

  /**
   * 获取系统基本信息
   */
  const getSystemInfo = async (): Promise<SystemConfigResponse<SystemInfo>> => {
    return await api.get('/api/system-config/info')
  }

  /**
   * 获取单个系统配置
   */
  const getConfig = async (key: string): Promise<SystemConfigResponse<SystemConfig>> => {
    return await api.get(`/api/system-config/${key}`)
  }

  /**
   * 批量更新系统配置
   */
  const updateConfigs = async (request: SystemConfigUpdateRequest): Promise<SystemConfigResponse<SystemConfig[]>> => {
    return await api.put('/api/system-config', request)
  }

  /**
   * 更新单个系统配置
   */
  const updateConfig = async (
    key: string,
    value: string | null,
    type: SystemConfig['config_type'] = 'string',
    description?: string
  ): Promise<SystemConfigResponse<SystemConfig>> => {
    return await api.put(`/api/system-config/${key}`, {
      value,
      type,
      description
    })
  }

  /**
   * 删除系统配置
   */
  const deleteConfig = async (key: string): Promise<SystemConfigResponse> => {
    return await api.delete(`/api/system-config/${key}`)
  }

  /**
   * 重置系统配置为默认值
   */
  const resetToDefaults = async (): Promise<SystemConfigResponse<SystemConfig[]>> => {
    return await api.post('/api/system-config/reset')
  }

  return {
    getAllConfigs,
    getSystemInfo,
    getConfig,
    updateConfigs,
    updateConfig,
    deleteConfig,
    resetToDefaults
  }
}
