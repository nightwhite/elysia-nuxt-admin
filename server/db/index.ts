import { Database } from "bun:sqlite";
import fs from "node:fs";
import path from "node:path";

// 确保数据库目录存在
const DB_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// 数据库文件路径
const DB_PATH = path.join(DB_DIR, "admin.db");

// 创建数据库连接
export const db = new Database(DB_PATH);

// 初始化数据库表
export function initDatabase() {
  // 用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
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
      FOREIGN KEY (parent_id) REFERENCES menus(id)
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

  // 检查是否需要插入初始数据
  const adminUser = db.query("SELECT * FROM users WHERE username = 'admin'").get();
  
  if (!adminUser) {
    // 插入默认管理员用户
    db.run(`
      INSERT INTO users (username, password, name, role, email)
      VALUES ('admin', 'admin123', '系统管理员', 'admin', 'admin@example.com')
    `);

    // 插入默认角色
    db.run(`INSERT INTO roles (name, description) VALUES ('admin', '系统管理员')`);
    db.run(`INSERT INTO roles (name, description) VALUES ('user', '普通用户')`);

    // 插入默认菜单
    db.run(`INSERT INTO menus (parent_id, title, path, icon, sort_order) VALUES (NULL, '仪表盘', '/dashboard', 'LayoutDashboard', 0)`);
    db.run(`INSERT INTO menus (parent_id, title, path, icon, sort_order) VALUES (NULL, '用户管理', '/users', 'Users', 1)`);
    db.run(`INSERT INTO menus (parent_id, title, path, icon, sort_order) VALUES (NULL, '系统设置', '/settings', 'Settings', 2)`);
  }

  console.log("数据库初始化完成");
}

// 导出查询帮助函数
export function getAll(query: string, params: any[] = []): any[] {
  return db.query(query).all(...params);
}

export function getOne(query: string, params: any[] = []): any {
  return db.query(query).get(...params);
}

export function run(query: string, params: any[] = []): void {
  db.run(query, params);
}

export default db; 