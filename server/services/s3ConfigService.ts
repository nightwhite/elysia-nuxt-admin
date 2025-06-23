import { ListBucketsCommand, HeadBucketCommand } from "@aws-sdk/client-s3"
import { 
  type S3Config, 
  getS3Config, 
  saveS3Config as saveS3ConfigUtil,
  createS3ClientForTesting 
} from "../utils/s3"

// S3连接测试结果类型
export interface S3TestResult {
  success: boolean
  message: string
  details?: any
}

/**
 * S3配置服务类
 */
export class S3ConfigService {
  /**
   * 获取S3配置
   */
  static getConfig(): { success: boolean; data: S3Config | null; message?: string } {
    try {
      const config = getS3Config()
      if (!config) {
        return {
          success: true,
          data: null,
          message: "暂无S3配置"
        }
      }

      // 确保enabled字段是布尔值
      const normalizedConfig = {
        ...config,
        enabled: Boolean(config.enabled)
      }

      return {
        success: true,
        data: normalizedConfig
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.message
      }
    }
  }

  /**
   * 保存S3配置
   */
  static saveConfig(configData: Omit<S3Config, 'id' | 'created_at' | 'updated_at'>): { success: boolean; data?: S3Config; message: string } {
    try {
      // 标准化enabled字段
      const normalizedBody = {
        ...configData,
        enabled: Boolean(configData.enabled)
      }
      const config = saveS3ConfigUtil(normalizedBody)

      return {
        success: true,
        data: config,
        message: "S3配置保存成功"
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * 测试S3连接
   */
  static async testConnection(config: any): Promise<S3TestResult> {
    // 标准化配置数据
    const normalizedConfig: S3Config = {
      ...config,
      enabled: Boolean(config.enabled)
    }
    try {
      // 基本参数验证
      if (!normalizedConfig.aws_access_key_id || !normalizedConfig.aws_secret_access_key || !normalizedConfig.bucket_name || !normalizedConfig.region_name) {
        return {
          success: false,
          message: "配置参数不完整，请检查必填字段"
        }
      }

      // 使用工具函数创建S3客户端
      const { client: s3Client, config: clientConfig } = createS3ClientForTesting(normalizedConfig)

      // 测试1: 检查bucket是否存在
      try {
        await s3Client.send(new HeadBucketCommand({ Bucket: clientConfig.bucket_name }))
      } catch (error: any) {
        if (error.name === 'NotFound') {
          return {
            success: false,
            message: `Bucket '${clientConfig.bucket_name}' 不存在或无权限访问`
          }
        }
        throw error // 重新抛出其他错误
      }

      // 测试2: 尝试列出buckets（验证凭据）
      try {
        const listResult = await s3Client.send(new ListBucketsCommand({}))
        const bucketNames = listResult.Buckets?.map((b: any) => b.Name) || []

        return {
          success: true,
          message: "S3连接测试成功",
          details: {
            bucket: clientConfig.bucket_name,
            region: clientConfig.region_name,
            endpoint: clientConfig.endpoint_url || "AWS默认端点",
            folder: clientConfig.folder,
            bucketUrl: clientConfig.bucket_url,
            bucketExists: bucketNames.includes(clientConfig.bucket_name),
            availableBuckets: bucketNames.slice(0, 5) // 只显示前5个bucket
          }
        }
      } catch (error: any) {
        // 如果无法列出buckets但bucket存在，可能是权限问题
        return {
          success: true,
          message: "S3连接成功，但无法列出所有buckets（可能是权限限制）",
          details: {
            bucket: clientConfig.bucket_name,
            region: clientConfig.region_name,
            endpoint: clientConfig.endpoint_url || "AWS默认端点",
            folder: clientConfig.folder,
            bucketUrl: clientConfig.bucket_url,
            bucketExists: true,
            note: "目标bucket可访问，但可能没有ListAllMyBuckets权限"
          }
        }
      }

    } catch (error: any) {
      let errorMessage = "S3连接测试失败"

      // 根据错误类型提供更具体的错误信息
      if (error.name === 'CredentialsProviderError') {
        errorMessage = "凭据配置错误，请检查Access Key和Secret Key"
      } else if (error.name === 'UnknownEndpoint') {
        errorMessage = "无法连接到指定的端点，请检查Region或Endpoint配置"
      } else if (error.name === 'InvalidAccessKeyId') {
        errorMessage = "Access Key无效"
      } else if (error.name === 'SignatureDoesNotMatch') {
        errorMessage = "Secret Key错误"
      } else if (error.name === 'AccessDenied') {
        errorMessage = "访问被拒绝，请检查权限配置"
      } else if (error.message) {
        errorMessage = `S3连接测试失败: ${error.message}`
      }

      return {
        success: false,
        message: errorMessage,
        details: {
          errorType: error.name,
          errorCode: error.$metadata?.httpStatusCode,
          region: normalizedConfig.region_name,
          endpoint: normalizedConfig.endpoint_url
        }
      }
    }
  }
}
