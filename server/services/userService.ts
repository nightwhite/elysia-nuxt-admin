import { getDB, query } from '../db';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/crypto';
import { ValidationError, NotFoundError } from '../utils/errors';

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
  let sql = `
    SELECT id, username, name, role, email, avatar, created_at, updated_at 
    FROM users
    WHERE 1=1
  `;
  
  const params: any[] = [];
  
  // 按角色筛选
  if (filters.role && filters.role !== 'all') {
    sql += ` AND role = ?`;
    params.push(filters.role);
  }
  
  // 按关键词搜索
  if (filters.search && filters.search.trim()) {
    sql += ` AND (
      username LIKE ? OR 
      name LIKE ? OR 
      email LIKE ?
    )`;
    const searchTerm = `%${filters.search.trim()}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  sql += ` ORDER BY id`;
  
  return query<User>(sql).all(...params);
}

/**
 * 获取所有用户
 */
export function getAllUsers(): User[] {
  return query<User>(`
    SELECT id, username, name, role, email, avatar, created_at, updated_at 
    FROM users
    ORDER BY id
  `).all();
}

/**
 * 根据ID获取用户
 */
export function getUserById(id: number): User | null {
  return query<User>(`
    SELECT id, username, name, role, email, avatar, created_at, updated_at 
    FROM users 
    WHERE id = ?
  `).get(id);
}

/**
 * 根据用户名获取用户
 */
export function getUserByUsername(username: string): User | null {
  return query<User>(`
    SELECT id, username, name, role, email, avatar, created_at, updated_at 
    FROM users 
    WHERE username = ?
  `).get(username);
}

/**
 * 验证用户登录
 */
export async function validateUser(username: string, password: string): Promise<User | null> {
  // 查询用户（包含密码字段）
  const userWithPassword = query<User & { password: string }>(`
    SELECT id, username, password, name, role, email, avatar, created_at, updated_at 
    FROM users 
    WHERE username = ?
  `).get(username);
  
  if (!userWithPassword) {
    return null;
  }
  
  // 验证密码
  const isValid = await verifyPassword(password, userWithPassword.password);
  if (!isValid) {
    return null;
  }

  // 检查是否需要更新密码哈希（迁移策略）
  if (needsRehash(userWithPassword.password)) {
    await updatePasswordHash(userWithPassword.id, password);
  }
  
  // 返回用户信息，不包含密码
  const { password: _, ...userInfo } = userWithPassword;
  return userInfo;
}

/**
 * 检查密码是否需要重新哈希
 */
function needsRehash(hashedPassword: string): boolean {
  // Argon2id 的哈希字符串格式以 $argon2id$ 开头
  return !hashedPassword.startsWith('$argon2id$');
}

/**
 * 更新用户密码哈希
 */
async function updatePasswordHash(userId: number, plainPassword: string): Promise<void> {
  const hashedPassword = await hashPassword(plainPassword);
  
  getDB().run(`
    UPDATE users 
    SET password = ?, 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [hashedPassword, userId]);
}

/**
 * 创建用户
 */
export async function createUser(params: CreateUserParams): Promise<number> {
  const { username, password, name, role, email, avatar } = params;
  
  // 验证密码强度
  const { isValid, message } = validatePasswordStrength(password);
  if (!isValid) {
    throw new ValidationError(message);
  }
  
  // 检查用户名是否已存在
  const existingUser = getUserByUsername(username);
  if (existingUser) {
    throw new ValidationError('用户名已存在');
  }
  
  // 对密码进行哈希处理
  const hashedPassword = await hashPassword(password);
  
  getDB().run(`
    INSERT INTO users (username, password, name, role, email, avatar)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [username, hashedPassword, name, role, email || null, avatar || null]);
  
  return getDB().query("SELECT last_insert_rowid() as id").get().id;
}

/**
 * 更新用户
 */
export async function updateUser(id: number, params: UpdateUserParams): Promise<boolean> {
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
    // 验证新密码强度
    const { isValid, message } = validatePasswordStrength(params.password);
    if (!isValid) {
      throw new ValidationError(message);
    }
    
    // 对新密码进行哈希处理
    const hashedPassword = await hashPassword(params.password);
    fields.push("password = ?");
    values.push(hashedPassword);
  }
  
  // 更新时间
  fields.push("updated_at = CURRENT_TIMESTAMP");
  
  if (fields.length === 0) {
    return false;
  }
  
  // 检查用户是否存在
  const user = getUserById(id);
  if (!user) {
    throw new NotFoundError('用户');
  }
  
  values.push(id);
  
  getDB().run(`
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
  getDB().run("DELETE FROM users WHERE id = ?", [id]);
  return true;
} 