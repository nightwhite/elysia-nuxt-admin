import { 
  ListObjectsV2Command, 
  DeleteObjectCommand, 
  PutObjectCommand,
  GetObjectCommand
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import * as mimeTypes from "mime-types"
import { createS3Client, getEnabledS3Config } from "../utils/s3"

// 文件信息类型
export interface S3FileInfo {
  key: string
  name: string
  size: number
  lastModified: Date
  etag: string
  isFolder: boolean
  mimeType?: string
  url?: string
}

// 文件列表响应类型
export interface S3FileListResponse {
  success: boolean
  data: {
    files: S3FileInfo[]
    folders: S3FileInfo[]
    currentPath: string
    totalCount: number
    hasMore: boolean
    nextToken?: string
  }
  message?: string
}

// 文件操作结果类型
export interface S3FileOperationResult {
  success: boolean
  message: string
  url?: string
}

/**
 * S3文件服务类
 */
export class S3FileService {
  /**
   * 获取文件MIME类型
   */
  private static getMimeType(filename: string): string {
    return mimeTypes.lookup(filename) || 'application/octet-stream'
  }

  /**
   * 生成文件访问URL
   */
  static async generateFileUrl(key: string, usePublicUrl: boolean = true): Promise<string> {
    try {
      const { client, config } = createS3Client()

      // 如果配置了bucket_url且要求使用公共URL，优先使用自定义域名
      if (usePublicUrl && config.bucket_url) {
        const cleanBucketUrl = config.bucket_url.endsWith('/')
          ? config.bucket_url.slice(0, -1)
          : config.bucket_url
        return `${cleanBucketUrl}/${key}`
      }

      // 否则生成预签名URL，有效期1小时
      const command = new GetObjectCommand({
        Bucket: config.bucket_name,
        Key: key
      })

      const url = await getSignedUrl(client, command, { expiresIn: 3600 })
      return url
    } catch (error) {
      console.error('生成文件URL失败:', error)
      return ''
    }
  }

  /**
   * 列出文件和文件夹
   */
  static async listFiles(
    prefix: string = '', 
    maxKeys: number = 100, 
    continuationToken?: string
  ): Promise<S3FileListResponse> {
    try {
      const { client, config } = createS3Client()
      
      const command = new ListObjectsV2Command({
        Bucket: config.bucket_name,
        Prefix: prefix,
        MaxKeys: maxKeys,
        Delimiter: '/',
        ContinuationToken: continuationToken
      })

      const response = await client.send(command)
      
      const files: S3FileInfo[] = []
      const folders: S3FileInfo[] = []

      // 处理文件夹
      if (response.CommonPrefixes) {
        for (const folder of response.CommonPrefixes) {
          if (folder.Prefix) {
            const folderName = folder.Prefix.replace(prefix, '').replace('/', '')
            if (folderName) {
              folders.push({
                key: folder.Prefix,
                name: folderName,
                size: 0,
                lastModified: new Date(),
                etag: '',
                isFolder: true
              })
            }
          }
        }
      }

      // 处理文件
      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key && object.Key !== prefix && !object.Key.endsWith('/')) {
            const fileName = object.Key.replace(prefix, '')
            const mimeType = this.getMimeType(fileName)
            
            files.push({
              key: object.Key,
              name: fileName,
              size: object.Size || 0,
              lastModified: object.LastModified || new Date(),
              etag: object.ETag || '',
              isFolder: false,
              mimeType,
              url: await this.generateFileUrl(object.Key)
            })
          }
        }
      }

      return {
        success: true,
        data: {
          files,
          folders,
          currentPath: prefix,
          totalCount: (response.KeyCount || 0),
          hasMore: response.IsTruncated || false,
          nextToken: response.NextContinuationToken
        }
      }
    } catch (error: any) {
      return {
        success: false,
        data: {
          files: [],
          folders: [],
          currentPath: prefix,
          totalCount: 0,
          hasMore: false
        },
        message: `获取文件列表失败: ${error.message}`
      }
    }
  }

  /**
   * 删除文件
   */
  static async deleteFile(key: string): Promise<S3FileOperationResult> {
    try {
      const { client, config } = createS3Client()
      
      const command = new DeleteObjectCommand({
        Bucket: config.bucket_name,
        Key: key
      })

      await client.send(command)
      
      return {
        success: true,
        message: "文件删除成功"
      }
    } catch (error: any) {
      return {
        success: false,
        message: `删除文件失败: ${error.message}`
      }
    }
  }

  /**
   * 上传文件
   */
  static async uploadFile(
    key: string,
    file: File,
    contentType?: string
  ): Promise<S3FileOperationResult> {
    try {
      const { client, config } = createS3Client()

      console.log('准备上传到S3:', {
        bucket: config.bucket_name,
        key: key,
        fileSize: file.size,
        contentType: contentType || this.getMimeType(key)
      })

      const fileBuffer = await file.arrayBuffer()
      console.log('文件buffer大小:', fileBuffer.byteLength)

      const command = new PutObjectCommand({
        Bucket: config.bucket_name,
        Key: key,
        Body: new Uint8Array(fileBuffer),
        ContentType: contentType || this.getMimeType(key)
      })

      const uploadResult = await client.send(command)
      console.log('S3上传结果:', uploadResult)
      
      const url = await this.generateFileUrl(key)
      
      return {
        success: true,
        message: "文件上传成功",
        url
      }
    } catch (error: any) {
      return {
        success: false,
        message: `上传文件失败: ${error.message}`
      }
    }
  }

  /**
   * 获取文件预览URL
   */
  static async getPreviewUrl(key: string, usePublicUrl: boolean = true): Promise<{ success: boolean; data?: any; message: string }> {
    try {
      const url = await this.generateFileUrl(key, usePublicUrl)

      return {
        success: true,
        data: {
          url,
          isPublic: usePublicUrl && !!getEnabledS3Config()?.bucket_url
        },
        message: "获取预览URL成功"
      }
    } catch (error: any) {
      return {
        success: false,
        message: `获取预览URL失败: ${error.message}`
      }
    }
  }

  /**
   * 获取文件的多种URL类型
   */
  static async getFileUrls(key: string): Promise<{ success: boolean; data?: any; message: string }> {
    try {
      const config = getEnabledS3Config()

      const urls: any = {
        signedUrl: await this.generateFileUrl(key, false), // 预签名URL
      }

      // 如果配置了bucket_url，生成公共URL
      if (config?.bucket_url) {
        const cleanBucketUrl = config.bucket_url.endsWith('/')
          ? config.bucket_url.slice(0, -1)
          : config.bucket_url
        urls.publicUrl = `${cleanBucketUrl}/${key}`
      }

      return {
        success: true,
        data: urls,
        message: "获取文件URL成功"
      }
    } catch (error: any) {
      return {
        success: false,
        message: `获取文件URL失败: ${error.message}`
      }
    }
  }
}
