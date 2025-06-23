import { useApi } from './useApi'

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

// 文件操作响应类型
export interface S3FileOperationResponse {
  success: boolean
  message: string
  url?: string
}

// 文件预览响应类型
export interface S3FilePreviewResponse {
  success: boolean
  data?: {
    url: string
    isPublic?: boolean
  }
  message?: string
}

// 文件URL响应类型
export interface S3FileUrlsResponse {
  success: boolean
  data?: {
    signedUrl: string
    publicUrl?: string
  }
  message?: string
}

// 文件上传参数
export interface S3FileUploadParams {
  file: File
  path?: string
}

// 文件列表查询参数
export interface S3FileListParams {
  prefix?: string
  maxKeys?: number
  continuationToken?: string
}

/**
 * S3文件管理 API 服务
 */
export const useS3Files = () => {
  const api = useApi()

  /**
   * 获取文件列表
   */
  const getFileList = (params: S3FileListParams = {}) => {
    const queryParams = new URLSearchParams()
    
    if (params.prefix) queryParams.append('prefix', params.prefix)
    if (params.maxKeys) queryParams.append('maxKeys', params.maxKeys.toString())
    if (params.continuationToken) queryParams.append('continuationToken', params.continuationToken)
    
    const queryString = queryParams.toString()
    const url = `/api/s3-files/list${queryString ? `?${queryString}` : ''}`
    
    return api.get<S3FileListResponse>(url)
  }

  /**
   * 删除文件
   */
  const deleteFile = (key: string) => {
    const encodedKey = encodeURIComponent(key)
    return api.delete<S3FileOperationResponse>(`/api/s3-files/delete/${encodedKey}`)
  }

  /**
   * 上传文件
   */
  const uploadFile = (params: S3FileUploadParams) => {
    const formData = new FormData()
    formData.append('file', params.file)
    if (params.path) {
      formData.append('path', params.path)
    }
    
    return api.post<S3FileOperationResponse>('/api/s3-files/upload', formData)
  }

  /**
   * 获取文件预览URL
   */
  const getFilePreviewUrl = (key: string, usePublic: boolean = true) => {
    const encodedKey = encodeURIComponent(key)
    const publicParam = usePublic ? '' : '?public=false'
    return api.get<S3FilePreviewResponse>(`/api/s3-files/preview/${encodedKey}${publicParam}`)
  }

  /**
   * 获取文件的多种URL
   */
  const getFileUrls = (key: string) => {
    const encodedKey = encodeURIComponent(key)
    return api.get<S3FileUrlsResponse>(`/api/s3-files/urls/${encodedKey}`)
  }

  /**
   * 批量上传文件
   */
  const uploadFiles = async (files: File[], path?: string) => {
    const results = []
    
    for (const file of files) {
      try {
        const result = await uploadFile({ file, path })
        results.push({ file: file.name, result })
      } catch (error) {
        results.push({ 
          file: file.name, 
          result: { 
            success: false, 
            message: `上传失败: ${error}` 
          } 
        })
      }
    }
    
    return results
  }

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 获取文件类型图标
   */
  const getFileIcon = (mimeType?: string, isFolder?: boolean): string => {
    if (isFolder) return '📁'
    
    if (!mimeType) return '📄'
    
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType.startsWith('video/')) return '🎥'
    if (mimeType.startsWith('audio/')) return '🎵'
    if (mimeType.includes('pdf')) return '📕'
    if (mimeType.includes('word') || mimeType.includes('document')) return '📘'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📗'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📙'
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return '📦'
    if (mimeType.includes('text/')) return '📝'
    
    return '📄'
  }

  /**
   * 检查文件是否可预览
   */
  const isPreviewable = (mimeType?: string): boolean => {
    if (!mimeType) return false
    
    return (
      mimeType.startsWith('image/') ||
      mimeType.startsWith('video/') ||
      mimeType.startsWith('audio/') ||
      mimeType.includes('pdf') ||
      mimeType.startsWith('text/')
    )
  }

  /**
   * 获取文件扩展名
   */
  const getFileExtension = (filename: string): string => {
    const lastDot = filename.lastIndexOf('.')
    return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : ''
  }

  /**
   * 构建文件路径
   */
  const buildPath = (currentPath: string, folderName: string): string => {
    if (!currentPath) return folderName + '/'
    return currentPath + folderName + '/'
  }

  /**
   * 解析路径为面包屑
   */
  const parseBreadcrumbs = (path: string): Array<{ name: string; path: string }> => {
    if (!path) return [{ name: '根目录', path: '' }]
    
    const parts = path.split('/').filter(Boolean)
    const breadcrumbs = [{ name: '根目录', path: '' }]
    
    let currentPath = ''
    for (const part of parts) {
      currentPath += part + '/'
      breadcrumbs.push({
        name: part,
        path: currentPath
      })
    }
    
    return breadcrumbs
  }

  return {
    // API 方法
    getFileList,
    deleteFile,
    uploadFile,
    uploadFiles,
    getFilePreviewUrl,
    getFileUrls,

    // 工具方法
    formatFileSize,
    getFileIcon,
    isPreviewable,
    getFileExtension,
    buildPath,
    parseBreadcrumbs,
  }
}
