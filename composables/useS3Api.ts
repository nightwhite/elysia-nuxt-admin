import { useApi } from './useApi'

// S3配置类型
export interface S3Config {
  id?: number
  enabled: boolean
  endpoint_url?: string
  aws_access_key_id: string
  aws_secret_access_key: string
  region_name: string
  bucket_name: string
  folder?: string
  bucket_url?: string
  created_at?: string
  updated_at?: string
}

// S3配置表单类型（用于前端表单）
export interface S3ConfigForm {
  enabled: boolean
  endpoint_url?: string
  aws_access_key_id: string
  aws_secret_access_key: string
  region_name: string
  bucket_name: string
  folder?: string
  bucket_url?: string
}

// S3连接测试结果类型
export interface S3TestResult {
  success: boolean
  message: string
  details?: any
}

// API响应类型
export interface S3ConfigResponse {
  success: boolean
  data: S3Config | null
  message?: string
}

export interface S3SaveResponse {
  success: boolean
  data: S3Config
  message: string
}

/**
 * S3 API 服务
 */
export const useS3Api = () => {
  const api = useApi()

  /**
   * 获取S3配置
   */
  const getS3Config = () => {
    return api.get<S3ConfigResponse>('/api/s3/config')
  }

  /**
   * 保存S3配置
   */
  const saveS3Config = (config: S3ConfigForm) => {
    return api.post<S3SaveResponse>('/api/s3/config', config)
  }

  /**
   * 测试S3连接
   */
  const testS3Connection = (config: S3ConfigForm) => {
    return api.post<S3TestResult>('/api/s3/test', config)
  }

  return {
    getS3Config,
    saveS3Config,
    testS3Connection,
  }
}
