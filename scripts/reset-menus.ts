import { Database } from "bun:sqlite";
import { join } from "path";

// 数据库文件路径
const dbPath = join(process.cwd(), "data", "admin.db");

// 创建数据库连接
const db = new Database(dbPath);

console.log("开始重置菜单数据...");

try {
  // 清空现有菜单数据
  db.run("DELETE FROM menus");
  console.log("已清空现有菜单数据");

  // 重新插入菜单数据
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
  
  console.log("菜单数据重置完成");

  // 验证插入的数据
  const menus = db.query("SELECT * FROM menus ORDER BY sort_order, id").all();
  console.log("当前菜单列表:");
  menus.forEach((menu: any) => {
    console.log(`- ID: ${menu.id}, 标题: ${menu.title}, 路径: ${menu.path}, 排序: ${menu.sort_order}`);
  });

} catch (error) {
  console.error("重置菜单数据失败:", error);
}
