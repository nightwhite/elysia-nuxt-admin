import { getAll, getOne, db } from '../db';

// 菜单类型定义
export interface Menu {
  id: number;
  parent_id: number | null;
  title: string;
  path: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// 菜单创建参数
export interface CreateMenuParams {
  parent_id?: number | null;
  title: string;
  path?: string;
  icon?: string;
  sort_order?: number;
}

// 菜单更新参数
export interface UpdateMenuParams {
  parent_id?: number | null;
  title?: string;
  path?: string | null;
  icon?: string | null;
  sort_order?: number;
}

/**
 * 获取所有菜单
 */
export function getAllMenus(): Menu[] {
  return getAll(`
    SELECT id, parent_id, title, path, icon, sort_order, created_at, updated_at
    FROM menus
    ORDER BY sort_order, id
  `);
}

/**
 * 获取菜单树
 * 将所有菜单转换为树形结构
 */
export function getMenuTree(): any[] {
  const menus = getAllMenus();
  const menuMap: {[key: number]: any} = {};
  const roots: any[] = [];

  // 将所有菜单添加到 Map 中
  menus.forEach(menu => {
    menuMap[menu.id] = {
      ...menu,
      children: []
    };
  });

  // 构建树形结构
  menus.forEach(menu => {
    if (menu.parent_id === null) {
      // 根菜单
      roots.push(menuMap[menu.id]);
    } else if (menuMap[menu.parent_id]) {
      // 子菜单
      menuMap[menu.parent_id].children.push(menuMap[menu.id]);
    }
  });

  return roots;
}

/**
 * 根据ID获取菜单
 */
export function getMenuById(id: number): Menu | null {
  return getOne(`
    SELECT id, parent_id, title, path, icon, sort_order, created_at, updated_at
    FROM menus
    WHERE id = ?
  `, [id]);
}

/**
 * 创建菜单
 */
export function createMenu(params: CreateMenuParams): number {
  const { parent_id, title, path, icon, sort_order } = params;
  
  db.run(`
    INSERT INTO menus (parent_id, title, path, icon, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `, [parent_id || null, title, path || null, icon || null, sort_order || 0]);
  
  return db.query("SELECT last_insert_rowid() as id").get().id;
}

/**
 * 更新菜单
 */
export function updateMenu(id: number, params: UpdateMenuParams): boolean {
  const fields: string[] = [];
  const values: any[] = [];
  
  if (params.parent_id !== undefined) {
    fields.push("parent_id = ?");
    values.push(params.parent_id);
  }
  
  if (params.title) {
    fields.push("title = ?");
    values.push(params.title);
  }
  
  if (params.path !== undefined) {
    fields.push("path = ?");
    values.push(params.path);
  }
  
  if (params.icon !== undefined) {
    fields.push("icon = ?");
    values.push(params.icon);
  }
  
  if (params.sort_order !== undefined) {
    fields.push("sort_order = ?");
    values.push(params.sort_order);
  }
  
  // 更新时间
  fields.push("updated_at = CURRENT_TIMESTAMP");
  
  if (fields.length === 0) {
    return false;
  }
  
  values.push(id);
  
  db.run(`
    UPDATE menus
    SET ${fields.join(", ")}
    WHERE id = ?
  `, values);
  
  return true;
}

/**
 * 删除菜单
 */
export function deleteMenu(id: number): boolean {
  // 查找子菜单
  const children = getAll("SELECT id FROM menus WHERE parent_id = ?", [id]);
  
  // 如果有子菜单，则禁止删除
  if (children.length > 0) {
    return false;
  }
  
  db.run("DELETE FROM menus WHERE id = ?", [id]);
  return true;
}

/**
 * 根据角色获取菜单
 */
export function getMenusByRole(role: string): Menu[] {
  if (role === 'admin') {
    // 管理员角色获取所有菜单
    return getAllMenus();
  }
  
  // 其他角色通过关联表获取
  return getAll(`
    SELECT m.id, m.parent_id, m.title, m.path, m.icon, m.sort_order, m.created_at, m.updated_at
    FROM menus m
    JOIN role_menu rm ON m.id = rm.menu_id
    JOIN roles r ON rm.role_id = r.id
    WHERE r.name = ?
    ORDER BY m.sort_order, m.id
  `, [role]);
} 