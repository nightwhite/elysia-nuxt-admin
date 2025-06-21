import { useApi } from './useApi'

// 管理系统信息类型
export interface AdminInfo {
  name: string
  version: string
  env: string
}

// 仪表盘统计数据类型
export interface DashboardStats {
  stats: {
    userCount: number
    menuCount: number
    roleCount: number
  }
  recentUsers: Array<{
    id: number
    username: string
    name: string
    role: string
    created_at: string
  }>
}

// 数据库表信息类型
export interface DatabaseTable {
  name: string
}

// 表详情类型
export interface TableDetails {
  schema: Array<{
    cid: number
    name: string
    type: string
    notnull: number
    dflt_value: string | null
    pk: number
  }>
  data: Array<Record<string, any>>
}

// SQL 查询结果类型
export interface SqlQueryResult {
  success: boolean
  data: Array<Record<string, any>>
}

/**
 * 管理员 API 服务
 */
export const useAdminApi = () => {
  const api = useApi()

  /**
   * 获取管理系统信息
   */
  const getAdminInfo = () => {
    return api.get<AdminInfo>('/api/admin/info')
  }

  /**
   * 获取仪表盘数据
   */
  const getDashboardData = () => {
    return api.get<DashboardStats>('/api/admin/dashboard')
  }

  /**
   * 获取所有数据库表
   */
  const getDatabaseTables = () => {
    return api.get<DatabaseTable[]>('/api/admin/db/tables')
  }

  /**
   * 获取表详情
   */
  const getTableDetails = (tableName: string) => {
    return api.get<TableDetails>(`/api/admin/db/table/${tableName}`)
  }

  /**
   * 执行 SQL 查询
   */
  const executeSqlQuery = (sql: string) => {
    return api.post<SqlQueryResult>('/api/admin/db/query', { sql })
  }

  /**
   * 获取调试用户数据（包含密码）
   */
  const getDebugUsers = () => {
    return api.get<Array<Record<string, any>>>('/api/admin/debug/users')
  }

  return {
    getAdminInfo,
    getDashboardData,
    getDatabaseTables,
    getTableDetails,
    executeSqlQuery,
    getDebugUsers,
  }
}
