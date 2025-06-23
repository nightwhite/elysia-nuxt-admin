import { 
  getAllSystemConfigs, 
  getSystemConfig, 
  getSystemConfigValue,
  setSystemConfig, 
  setSystemConfigs,
  deleteSystemConfig,
  getSystemInfo,
  SystemConfig,
  SystemConfigKey
} from "../utils/systemConfig"

/**
 * 系统配置服务响应类型
 */
export interface SystemConfigResponse {
  success: boolean
  data?: any
  message?: string
}

/**
 * 系统配置更新请求类型
 */
export interface SystemConfigUpdateRequest {
  configs: Array<{
    key: string
    value: string | null
    type?: SystemConfig['config_type']
    description?: string
  }>
}

/**
 * 系统配置服务类
 */
export class SystemConfigService {
  /**
   * 获取所有系统配置
   */
  static getAllConfigs(): SystemConfigResponse {
    try {
      const configs = getAllSystemConfigs()
      return {
        success: true,
        data: configs
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * 获取单个系统配置
   */
  static getConfig(key: string): SystemConfigResponse {
    try {
      const config = getSystemConfig(key)
      if (!config) {
        return {
          success: false,
          message: `配置项 ${key} 不存在`
        }
      }
      return {
        success: true,
        data: config
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * 获取系统基本信息
   */
  static getSystemInfo(): SystemConfigResponse {
    try {
      const info = getSystemInfo()
      return {
        success: true,
        data: info
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * 更新系统配置
   */
  static updateConfigs(request: SystemConfigUpdateRequest): SystemConfigResponse {
    try {
      // 验证请求数据
      if (!request.configs || !Array.isArray(request.configs)) {
        return {
          success: false,
          message: '无效的配置数据'
        }
      }

      // 验证每个配置项
      for (const config of request.configs) {
        if (!config.key || typeof config.key !== 'string') {
          return {
            success: false,
            message: '配置项key不能为空'
          }
        }
      }

      // 批量更新配置
      const updatedConfigs = setSystemConfigs(request.configs)

      return {
        success: true,
        data: updatedConfigs,
        message: '系统配置更新成功'
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * 更新单个系统配置
   */
  static updateConfig(
    key: string, 
    value: string | null, 
    type: SystemConfig['config_type'] = 'string',
    description?: string
  ): SystemConfigResponse {
    try {
      if (!key || typeof key !== 'string') {
        return {
          success: false,
          message: '配置项key不能为空'
        }
      }

      const updatedConfig = setSystemConfig(key, value, type, description)

      return {
        success: true,
        data: updatedConfig,
        message: '配置更新成功'
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * 删除系统配置
   */
  static deleteConfig(key: string): SystemConfigResponse {
    try {
      if (!key || typeof key !== 'string') {
        return {
          success: false,
          message: '配置项key不能为空'
        }
      }

      // 检查是否为系统关键配置，防止误删
      const protectedKeys = [
        SystemConfigKey.SYSTEM_NAME,
        SystemConfigKey.SYSTEM_LOGO,
        SystemConfigKey.SYSTEM_VERSION
      ]

      if (protectedKeys.includes(key as SystemConfigKey)) {
        return {
          success: false,
          message: '系统关键配置不能删除'
        }
      }

      const deleted = deleteSystemConfig(key)
      if (!deleted) {
        return {
          success: false,
          message: '配置项不存在或删除失败'
        }
      }

      return {
        success: true,
        message: '配置删除成功'
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * 重置系统配置为默认值
   */
  static resetToDefaults(): SystemConfigResponse {
    try {
      const defaultConfigs = [
        { key: SystemConfigKey.SYSTEM_NAME, value: 'Admin System', description: '系统名称' },
        { key: SystemConfigKey.SYSTEM_LOGO, value: 'A', description: '系统Logo文字' },
        { key: SystemConfigKey.SYSTEM_LOGO_URL, value: '', description: '系统Logo图片URL' },
        { key: SystemConfigKey.SYSTEM_DESCRIPTION, value: '现代化的后台管理系统', description: '系统描述' },
        { key: SystemConfigKey.SYSTEM_VERSION, value: '1.0.0', description: '系统版本' },
        { key: SystemConfigKey.SYSTEM_COPYRIGHT, value: '© 2024 Admin System. All rights reserved.', description: '版权信息' }
      ]

      const updatedConfigs = setSystemConfigs(defaultConfigs)

      return {
        success: true,
        data: updatedConfigs,
        message: '系统配置已重置为默认值'
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      }
    }
  }
}
