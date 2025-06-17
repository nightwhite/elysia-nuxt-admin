import { db, getAll, getOne } from '../db';

// 用户类型定义
export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  email?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

// 用户登录参数
export interface LoginParams {
  username: string;
  password: string;
}

// 用户创建参数
export interface CreateUserParams {
  username: string;
  password: string;
  name: string;
  role: string;
  email?: string;
  avatar?: string;
}

// 用户更新参数
export interface UpdateUserParams {
  name?: string;
  role?: string;
  email?: string;
  avatar?: string;
  password?: string;
}

/**
 * 筛选查询参数
 */
export interface UserFilterParams {
  search?: string;
  role?: string;
}

/**
 * 获取筛选后的用户
 */
export function getFilteredUsers(filters: UserFilterParams): User[] {
  let query = `
    SELECT id, username, name, role, email, avatar, created_at, updated_at 
    FROM users
    WHERE 1=1
  `;
  
  const params: any[] = [];
  
  // 按角色筛选
  if (filters.role && filters.role !== 'all') {
    query += ` AND role = ?`;
    params.push(filters.role);
  }
  
  // 按关键词搜索
  if (filters.search && filters.search.trim()) {
    query += ` AND (
      username LIKE ? OR 
      name LIKE ? OR 
      email LIKE ?
    )`;
    const searchTerm = `%${filters.search.trim()}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  query += ` ORDER BY id`;
  
  return getAll(query, params);
}

/**
 * 获取所有用户
 */
export function getAllUsers(): User[] {

  return getAll(`
    SELECT id, username, name, role, email, avatar, created_at, updated_at 
    FROM users
    ORDER BY id
  `);
}

/**
 * 根据ID获取用户
 */
export function getUserById(id: number): User | null {
  return getOne(`
    SELECT id, username, name, role, email, avatar, created_at, updated_at 
    FROM users 
    WHERE id = ?
  `, [id]);
}

/**
 * 根据用户名获取用户
 */
export function getUserByUsername(username: string): User | null {
  return getOne(`
    SELECT id, username, name, role, email, avatar, created_at, updated_at 
    FROM users 
    WHERE username = ?
  `, [username]);
}

/**
 * 验证用户登录
 */
export function validateUser(username: string, password: string): User | null {
  // 查询用户
  const user = getOne(`
    SELECT id, username, password, name, role, email, avatar, created_at, updated_at 
    FROM users 
    WHERE username = ?
  `, [username]);
  
  if (!user) {
    return null;
  }
  
  // 检查密码是否匹配 (这里应该使用哈希对比，但为简单起见直接比较)
  // 提示：在实际应用中，永远不要存储明文密码和这样比较
  if (user.password === password) {
    // 返回用户信息，不包含密码
    const { password: _, ...userInfo } = user;
    return userInfo as User;
  }
  
  return null;
}

/**
 * 创建用户
 */
export function createUser(params: CreateUserParams): number {
  const { username, password, name, role, email, avatar } = params;
  
  db.run(`
    INSERT INTO users (username, password, name, role, email, avatar)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [username, password, name, role, email || null, avatar || null]);
  
  return db.query("SELECT last_insert_rowid() as id").get().id;
}

/**
 * 更新用户
 */
export function updateUser(id: number, params: UpdateUserParams): boolean {
  const fields: string[] = [];
  const values: any[] = [];
  
  if (params.name) {
    fields.push("name = ?");
    values.push(params.name);
  }
  
  if (params.role) {
    fields.push("role = ?");
    values.push(params.role);
  }
  
  if (params.email) {
    fields.push("email = ?");
    values.push(params.email);
  }
  
  if (params.avatar) {
    fields.push("avatar = ?");
    values.push(params.avatar);
  }
  
  if (params.password) {
    fields.push("password = ?");
    values.push(params.password);
  }
  
  // 更新时间
  fields.push("updated_at = CURRENT_TIMESTAMP");
  
  if (fields.length === 0) {
    return false;
  }
  
  values.push(id);
  
  db.run(`
    UPDATE users 
    SET ${fields.join(", ")} 
    WHERE id = ?
  `, values);
  
  return true;
}

/**
 * 删除用户
 */
export function deleteUser(id: number): boolean {
  db.run("DELETE FROM users WHERE id = ?", [id]);
  return true;
} 