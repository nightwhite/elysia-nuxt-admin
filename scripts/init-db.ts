import { initDB } from "../server/db/index";

console.log("手动初始化数据库...");

async function main() {
  try {
    const db = await initDB();
    console.log("数据库初始化成功");

    // 检查表是否创建
    const tablesStmt = db.query("SELECT name FROM sqlite_master WHERE type='table'");
    const tables = tablesStmt.all();
    console.log("已创建的表:", tables);

    // 检查菜单数据
    const menusStmt = db.query("SELECT * FROM menus ORDER BY sort_order, id");
    const menus = menusStmt.all();
    console.log("菜单数据:", menus);

  } catch (error) {
    console.error("数据库初始化失败:", error);
  }
}

main()
