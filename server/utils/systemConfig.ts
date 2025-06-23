import { getDB } from "../db"

// 系统配置类型
export interface SystemConfig {
  id?: number
  config_key: string
  config_value: string | null
  config_type: 'string' | 'number' | 'boolean' | 'json'
  description?: string
  created_at?: string
  updated_at?: string
}

// 系统配置键值枚举
export enum SystemConfigKey {
  SYSTEM_NAME = 'system_name',
  SYSTEM_LOGO = 'system_logo',
  SYSTEM_LOGO_URL = 'system_logo_url',
  SYSTEM_DESCRIPTION = 'system_description',
  SYSTEM_VERSION = 'system_version',
  SYSTEM_COPYRIGHT = 'system_copyright'
}

/**
 * 获取所有系统配置
 */
export function getAllSystemConfigs(): SystemConfig[] {
  const db = getDB()
  const configs = db.query('SELECT * FROM system_config ORDER BY config_key').all() as SystemConfig[]
  return configs
}

/**
 * 获取单个系统配置
 */
export function getSystemConfig(key: string): SystemConfig | null {
  const db = getDB()
  const config = db.query('SELECT * FROM system_config WHERE config_key = ?').get(key) as SystemConfig | null
  return config
}

/**
 * 获取系统配置值
 */
export function getSystemConfigValue(key: string, defaultValue: string = ''): string {
  const config = getSystemConfig(key)
  if (!config || config.config_value === null) {
    return defaultValue
  }
  
  // 根据类型转换值
  switch (config.config_type) {
    case 'boolean':
      return config.config_value === 'true' ? 'true' : 'false'
    case 'number':
      return config.config_value
    case 'json':
      try {
        return JSON.stringify(JSON.parse(config.config_value))
      } catch {
        return defaultValue
      }
    default:
      return config.config_value
  }
}

/**
 * 设置系统配置
 */
export function setSystemConfig(
  key: string, 
  value: string | null, 
  type: SystemConfig['config_type'] = 'string',
  description?: string
): SystemConfig {
  const db = getDB()
  
  // 检查配置是否已存在
  const existingConfig = getSystemConfig(key)
  
  if (existingConfig) {
    // 更新现有配置
    db.run(`
      UPDATE system_config 
      SET config_value = ?, config_type = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE config_key = ?
    `, [value, type, description || existingConfig.description, key])
  } else {
    // 创建新配置
    db.run(`
      INSERT INTO system_config (config_key, config_value, config_type, description)
      VALUES (?, ?, ?, ?)
    `, [key, value, type, description || ''])
  }
  
  return getSystemConfig(key)!
}

/**
 * 批量设置系统配置
 */
export function setSystemConfigs(configs: Array<{
  key: string
  value: string | null
  type?: SystemConfig['config_type']
  description?: string
}>): SystemConfig[] {
  const results: SystemConfig[] = []
  
  for (const config of configs) {
    const result = setSystemConfig(
      config.key, 
      config.value, 
      config.type || 'string', 
      config.description
    )
    results.push(result)
  }
  
  return results
}

/**
 * 删除系统配置
 */
export function deleteSystemConfig(key: string): boolean {
  const db = getDB()
  const result = db.run('DELETE FROM system_config WHERE config_key = ?', [key])
  return result.changes > 0
}

/**
 * 获取系统基本信息（常用配置的组合）
 */
export function getSystemInfo() {
  return {
    name: getSystemConfigValue(SystemConfigKey.SYSTEM_NAME, 'Admin System'),
    logo: getSystemConfigValue(SystemConfigKey.SYSTEM_LOGO, 'A'),
    logoUrl: getSystemConfigValue(SystemConfigKey.SYSTEM_LOGO_URL, ''),
    description: getSystemConfigValue(SystemConfigKey.SYSTEM_DESCRIPTION, '现代化的后台管理系统'),
    version: getSystemConfigValue(SystemConfigKey.SYSTEM_VERSION, '1.0.0'),
    copyright: getSystemConfigValue(SystemConfigKey.SYSTEM_COPYRIGHT, '© 2024 Admin System. All rights reserved.')
  }
}
