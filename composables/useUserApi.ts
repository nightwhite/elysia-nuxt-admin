import { useApi } from './useApi'

// 用户类型定义
export interface User {
  id: number
  username: string
  name: string
  role: string
  email?: string
  avatar?: string
  created_at: string
  updated_at: string
}

// 创建用户参数
export interface CreateUserParams {
  username: string
  password: string
  name: string
  role?: string
  email?: string
}

// 更新用户参数
export interface UpdateUserParams {
  name?: string
  role?: string
  email?: string
  password?: string
}

// 用户筛选参数
export interface UserFilterParams {
  search?: string
  role?: string
}

// 分页参数
export interface PaginationParams {
  page?: number
  pageSize?: number
}

// 分页查询参数
export interface UserListParams extends UserFilterParams, PaginationParams {}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 登录参数
export interface LoginParams {
  username: string
  password: string
}

// 登录响应
export interface LoginResponse {
  user: User
  token: string
}

/**
 * 用户 API 服务
 */
export const useUserApi = () => {
  const api = useApi()

  /**
   * 获取所有用户（保持向后兼容）
   */
  const getUsers = () => {
    return api.get<PaginatedResponse<User>>('/api/users/list')
  }

  /**
   * 分页获取用户列表
   */
  const getUsersPaginated = (params: UserListParams = {}) => {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append('page', params.page.toString())
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params.search) queryParams.append('search', params.search)
    if (params.role) queryParams.append('role', params.role)

    const queryString = queryParams.toString()
    const url = queryString ? `/api/users/list?${queryString}` : '/api/users/list'

    return api.get<PaginatedResponse<User>>(url)
  }

  /**
   * 筛选用户
   */
  const filterUsers = (params: UserFilterParams) => {
    const searchParams = new URLSearchParams()
    
    if (params.search) {
      searchParams.append('search', params.search)
    }
    if (params.role && params.role !== 'all') {
      searchParams.append('role', params.role)
    }
    
    const queryString = searchParams.toString()
    const url = queryString ? `/api/users/filter?${queryString}` : '/api/users/list'
    
    return api.get<User[]>(url)
  }

  /**
   * 根据 ID 获取用户
   */
  const getUserById = (id: number) => {
    return api.get<User>(`/api/users/${id}`)
  }

  /**
   * 创建用户
   */
  const createUser = (userData: CreateUserParams) => {
    return api.post<{ id: number; success: boolean }>('/api/users', userData)
  }

  /**
   * 更新用户
   */
  const updateUser = (id: number, userData: UpdateUserParams) => {
    return api.put<{ success: boolean }>(`/api/users/${id}`, userData)
  }

  /**
   * 删除用户
   */
  const deleteUser = (id: number) => {
    return api.delete<{ success: boolean }>(`/api/users/${id}`)
  }

  /**
   * 用户登录
   */
  const login = (credentials: LoginParams) => {
    return api.post<LoginResponse>('/api/users/login', credentials, {
      requireAuth: false, // 登录接口不需要身份验证
      autoRedirect: false, // 登录失败时不自动重定向
    })
  }

  /**
   * 刷新令牌
   */
  const refreshToken = () => {
    return api.post<{ token: string }>('/api/users/refresh-token')
  }

  return {
    getUsers,
    getUsersPaginated,
    filterUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    login,
    refreshToken,
  }
}
