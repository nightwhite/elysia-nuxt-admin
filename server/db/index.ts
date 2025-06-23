import { Database } from "bun:sqlite";
import fs from "node:fs";
import path from "node:path";
import { hashPassword } from '../utils/crypto';

// 确保数据库目录存在
const DB_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// 数据库文件路径
const DB_PATH = path.join(DB_DIR, "admin.db");

// 初始化数据库变量
let db: Database | null = null;

/**
 * 数据库查询结果类型
 */
export interface QueryResult<T> {
  get(...params: any[]): T | null;
  all(...params: any[]): T[];
  run(...params: any[]): { changes: number };
}

/**
 * 初始化数据库
 */
export async function initDB() {
  if (db) {
    return db;
  }

  db = new Database(DB_PATH);
  
  // 用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 菜单表
  db.run(`
    CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER,
      title TEXT NOT NULL,
      path TEXT,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES menus (id) ON DELETE CASCADE
    )
  `);

  // 角色表
  db.run(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 角色-菜单关联表
  db.run(`
    CREATE TABLE IF NOT EXISTS role_menu (
      role_id INTEGER NOT NULL,
      menu_id INTEGER NOT NULL,
      PRIMARY KEY (role_id, menu_id),
      FOREIGN KEY (role_id) REFERENCES roles(id),
      FOREIGN KEY (menu_id) REFERENCES menus(id)
    )
  `);

  // S3配置表
  db.run(`
    CREATE TABLE IF NOT EXISTS s3_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enabled BOOLEAN DEFAULT true,
      endpoint_url TEXT,
      aws_access_key_id TEXT NOT NULL,
      aws_secret_access_key TEXT NOT NULL,
      region_name TEXT NOT NULL,
      bucket_name TEXT NOT NULL,
      folder TEXT,
      bucket_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 检查s3_config表是否需要添加列（用于数据库迁移）
  try {
    const tableInfo = db.query("PRAGMA table_info(s3_config)").all();
    const columnNames = tableInfo.map((col: any) => col.name);

    if (!columnNames.includes('aws_access_key_id')) {
      // 如果表存在但缺少新的列结构，删除并重新创建
      db.run('DROP TABLE IF EXISTS s3_config');
      db.run(`
        CREATE TABLE s3_config (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          enabled BOOLEAN DEFAULT true,
          endpoint_url TEXT,
          aws_access_key_id TEXT NOT NULL,
          aws_secret_access_key TEXT NOT NULL,
          region_name TEXT NOT NULL,
          bucket_name TEXT NOT NULL,
          folder TEXT,
          bucket_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("S3配置表已重新创建");
    }
  } catch (error) {
    console.log("S3配置表检查完成");
  }

  // 检查是否需要插入初始数据
  const adminUser = db.query('SELECT id FROM users WHERE username = ?').get('admin');
  
  if (!adminUser) {
    // 插入默认管理员用户
    const hashedPassword = await hashPassword('Admin@123'); // 使用更安全的初始密码
    
    db.run(`
      INSERT INTO users (username, password, name, role, email)
      VALUES ('admin', ?, '系统管理员', 'admin', 'admin@example.com')
    `, [hashedPassword]);

    // 插入默认角色
    db.run(`INSERT INTO roles (name, description) VALUES ('admin', '系统管理员')`);
    db.run(`INSERT INTO roles (name, description) VALUES ('user', '普通用户')`);

    // 插入默认菜单
    db.run(`INSERT INTO menus (id, parent_id, title, path, icon, sort_order) VALUES
      (1, NULL, '仪表盘', '/dashboard', 'LayoutDashboard', 0),
      (2, NULL, '用户管理', '/userManager', 'Users', 1),
      (3, NULL, '文件管理', '/files', 'FolderOpen', 2),
      (4, NULL, '菜单管理', '/menusManager', 'Menu', 3),
      (5, NULL, '测试', '', 'CircleDashed', 8),
      (6, 5, 'API 测试', '/test', 'Bot', 0),
      (7, 5, 'Toast 测试', '/test/toast', 'MessageSquare', 1),
      (8, NULL, '系统设置', '/settings', 'Settings', 9)
    `);
  }

  console.log("数据库初始化完成");

  return db;
}

/**
 * 获取数据库实例
 */
export function getDB(): Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

/**
 * 执行查询并返回结果
 */
export function query<T extends Record<string, any>>(sql: string): QueryResult<T> {
  const database = getDB();
  const stmt = database.query(sql);
  return {
    get: (...params: any[]) => stmt.get(...params) as T | null,
    all: (...params: any[]) => stmt.all(...params) as T[],
    run: (...params: any[]) => ({ changes: database.run(sql, params).changes })
  };
}

export { db }; 