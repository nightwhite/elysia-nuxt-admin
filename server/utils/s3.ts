import { S3Client } from "@aws-sdk/client-s3"
import { getDB } from "../db"

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

/**
 * 获取S3配置（所有配置，不过滤enabled状态）
 */
export function getS3Config(): S3Config | null {
  const db = getDB()
  const config = db.query('SELECT * FROM s3_config ORDER BY id DESC LIMIT 1').get() as S3Config | null
  return config
}

/**
 * 获取启用的S3配置（只返回enabled=1的配置）
 */
export function getEnabledS3Config(): S3Config | null {
  const db = getDB()
  const config = db.query('SELECT * FROM s3_config WHERE enabled = 1 ORDER BY id DESC LIMIT 1').get() as S3Config | null
  return config
}

/**
 * 保存S3配置
 */
export function saveS3Config(config: Omit<S3Config, 'id' | 'created_at' | 'updated_at'>): S3Config {
  const db = getDB()

  // 转换enabled字段为布尔值
  const normalizedConfig = {
    ...config,
    enabled: Boolean(config.enabled)
  }

  // 检查是否已有配置
  const existingConfig = getS3Config()

  if (existingConfig) {
    // 更新现有配置
    db.run(`
      UPDATE s3_config
      SET enabled = ?, endpoint_url = ?, aws_access_key_id = ?, aws_secret_access_key = ?,
          region_name = ?, bucket_name = ?, folder = ?, bucket_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      normalizedConfig.enabled,
      normalizedConfig.endpoint_url || null,
      normalizedConfig.aws_access_key_id,
      normalizedConfig.aws_secret_access_key,
      normalizedConfig.region_name,
      normalizedConfig.bucket_name,
      normalizedConfig.folder || null,
      normalizedConfig.bucket_url || null,
      existingConfig.id
    ])

    return getS3Config()!
  } else {
    // 创建新配置
    db.run(`
      INSERT INTO s3_config (enabled, endpoint_url, aws_access_key_id, aws_secret_access_key, region_name, bucket_name, folder, bucket_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      normalizedConfig.enabled,
      normalizedConfig.endpoint_url || null,
      normalizedConfig.aws_access_key_id,
      normalizedConfig.aws_secret_access_key,
      normalizedConfig.region_name,
      normalizedConfig.bucket_name,
      normalizedConfig.folder || null,
      normalizedConfig.bucket_url || null
    ])

    return getS3Config()!
  }
}

/**
 * 创建S3客户端（用于文件操作，需要启用的配置）
 */
export function createS3Client() {
  const config = getEnabledS3Config()
  if (!config) {
    throw new Error("S3配置未找到或未启用")
  }

  const s3ClientConfig: any = {
    region: config.region_name,
    credentials: {
      accessKeyId: config.aws_access_key_id,
      secretAccessKey: config.aws_secret_access_key,
    },
  }

  if (config.endpoint_url) {
    s3ClientConfig.endpoint = config.endpoint_url
    s3ClientConfig.forcePathStyle = true
  }

  return { client: new S3Client(s3ClientConfig), config }
}

/**
 * 创建S3客户端（用于测试连接，可以使用任意配置）
 */
export function createS3ClientForTesting(config: S3Config) {
  const normalizedConfig = {
    ...config,
    enabled: Boolean(config.enabled)
  }

  const s3ClientConfig: any = {
    region: normalizedConfig.region_name,
    credentials: {
      accessKeyId: normalizedConfig.aws_access_key_id,
      secretAccessKey: normalizedConfig.aws_secret_access_key,
    },
  }

  if (normalizedConfig.endpoint_url) {
    s3ClientConfig.endpoint = normalizedConfig.endpoint_url
    s3ClientConfig.forcePathStyle = true
  }

  return { client: new S3Client(s3ClientConfig), config: normalizedConfig }
}
