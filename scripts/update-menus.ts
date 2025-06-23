import { Database } from "bun:sqlite";
import { join } from "path";

// 数据库文件路径
const dbPath = join(process.cwd(), "data", "admin.db");

// 创建数据库连接
const db = new Database(dbPath);

console.log("开始更新菜单数据...");

try {
  // 首先检查文件管理菜单是否已存在
  const existingFileMenu = db.query("SELECT * FROM menus WHERE title = '文件管理'").get();
  
  if (existingFileMenu) {
    console.log("文件管理菜单已存在:", existingFileMenu);
  } else {
    console.log("文件管理菜单不存在，开始添加...");
    
    // 插入文件管理菜单
    db.run(`
      INSERT INTO menus (title, path, icon, sort_order, parent_id) 
      VALUES ('文件管理', '/files', 'FolderOpen', 2, NULL)
    `);
    
    console.log("文件管理菜单添加成功");
  }
  
  // 更新其他菜单的排序，确保正确的顺序
  db.run("UPDATE menus SET sort_order = 3 WHERE title = '菜单管理'");
  db.run("UPDATE menus SET sort_order = 9 WHERE title = '系统设置'");
  
  console.log("菜单排序更新完成");

  // 验证更新后的菜单数据
  const menus = db.query("SELECT * FROM menus ORDER BY sort_order, id").all();
  console.log("更新后的菜单列表:");
  menus.forEach((menu: any) => {
    const parentInfo = menu.parent_id ? ` (父菜单ID: ${menu.parent_id})` : '';
    console.log(`- ID: ${menu.id}, 标题: ${menu.title}, 路径: ${menu.path}, 排序: ${menu.sort_order}${parentInfo}`);
  });

} catch (error) {
  console.error("更新菜单数据失败:", error);
}
