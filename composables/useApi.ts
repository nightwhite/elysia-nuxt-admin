import { useAuth } from './useAuth'

// API 响应类型
interface ApiResponse<T = any> {
  data?: T
  error?: string
  success?: boolean
}

// API 请求选项
interface ApiOptions extends RequestInit {
  // 是否需要身份验证，默认为 true
  requireAuth?: boolean
  // 是否在 401 时自动重定向到登录页，默认为 true
  autoRedirect?: boolean
}

// API 错误类
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * 封装的 API 请求方法
 */
export const useApi = () => {
  const { token } = useAuth()

  /**
   * 通用 API 请求方法
   */
  const request = async <T = any>(
    url: string,
    options: ApiOptions = {}
  ): Promise<T> => {
    const {
      requireAuth = true,
      autoRedirect = true,
      headers = {},
      ...fetchOptions
    } = options

    // 构建请求头
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // 合并传入的 headers
    if (headers) {
      if (headers instanceof Headers) {
        headers.forEach((value, key) => {
          requestHeaders[key] = value
        })
      } else if (Array.isArray(headers)) {
        headers.forEach(([key, value]) => {
          requestHeaders[key] = value
        })
      } else {
        Object.assign(requestHeaders, headers)
      }
    }

    // 如果需要身份验证，添加 Authorization 头
    if (requireAuth && token.value) {
      requestHeaders.Authorization = `Bearer ${token.value}`
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: requestHeaders,
      })

      // 处理 401 未授权
      if (response.status === 401) {
        // 尝试解析具体的错误消息
        let errorMessage = '未授权'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || '未授权'
        } catch {
          // 如果无法解析错误响应，使用默认消息
        }

        if (autoRedirect) {
          await navigateTo('/login')
          // 对于需要重定向的情况，不要显示重定向消息，而是显示原始错误
          throw new ApiError(errorMessage, 401, response)
        } else {
          throw new ApiError(errorMessage, 401, response)
        }
      }

      // 处理其他错误状态
      if (!response.ok) {
        let errorMessage = `HTTP 错误: ${response.status}`
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch {
          // 如果无法解析错误响应，使用默认错误消息
        }
        
        throw new ApiError(errorMessage, response.status, response)
      }

      // 尝试解析 JSON 响应
      try {
        return await response.json()
      } catch {
        // 如果响应不是 JSON，返回空对象
        return {} as T
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      // 网络错误或其他错误
      throw new ApiError(
        error instanceof Error ? error.message : '网络请求失败',
        0
      )
    }
  }

  /**
   * GET 请求
   */
  const get = <T = any>(url: string, options?: Omit<ApiOptions, 'method' | 'body'>) => {
    return request<T>(url, { ...options, method: 'GET' })
  }

  /**
   * POST 请求
   */
  const post = <T = any>(
    url: string,
    data?: any,
    options?: Omit<ApiOptions, 'method' | 'body'>
  ) => {
    return request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT 请求
   */
  const put = <T = any>(
    url: string,
    data?: any,
    options?: Omit<ApiOptions, 'method' | 'body'>
  ) => {
    return request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE 请求
   */
  const del = <T = any>(url: string, options?: Omit<ApiOptions, 'method' | 'body'>) => {
    return request<T>(url, { ...options, method: 'DELETE' })
  }

  /**
   * PATCH 请求
   */
  const patch = <T = any>(
    url: string,
    data?: any,
    options?: Omit<ApiOptions, 'method' | 'body'>
  ) => {
    return request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  return {
    request,
    get,
    post,
    put,
    delete: del,
    patch,
    ApiError,
  }
}

// 导出类型
export type { ApiOptions, ApiResponse }
export { ApiError }
