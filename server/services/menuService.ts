import { query } from "../db";
import { AppError } from "../utils/errors";
import { logger } from "../utils/logger";

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
  children?: Menu[];
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
  try {
    return query<Menu>(`
      SELECT 
        id,
        parent_id,
        title,
        path,
        icon,
        sort_order,
        created_at,
        updated_at
      FROM menus 
      ORDER BY sort_order ASC
    `).all();
  } catch (error) {
    logger.error("获取菜单列表失败:", error as Record<string, any>);
    throw new AppError("获取菜单列表失败", 500);
  }
}

/**
 * 获取菜单树
 */
export function getMenuTree(): Menu[] {
  try {
    const menus = query<Menu>(`
      SELECT 
        id,
        parent_id,
        title,
        path,
        icon,
        sort_order,
        created_at,
        updated_at
      FROM menus 
      ORDER BY sort_order ASC
    `).all();
    return buildMenuTree(menus);
  } catch (error) {
    logger.error("获取菜单树失败:", error as Record<string, any>);
    throw new AppError("获取菜单树失败", 500);
  }
}

/**
 * 构建菜单树
 */
function buildMenuTree(menus: Menu[], parentId: number | null = null): Menu[] {
  return menus
    .filter(menu => menu.parent_id === parentId)
    .map(menu => ({
      ...menu,
      children: buildMenuTree(menus, menu.id)
    }));
}

/**
 * 根据ID获取菜单
 */
export function getMenuById(id: number): Menu | null {
  return query<Menu>(`
    SELECT 
      id,
      parent_id,
      title,
      path,
      icon,
      sort_order,
      created_at,
      updated_at
    FROM menus
    WHERE id = ?
  `).get(id);
}

/**
 * 创建菜单
 */
export function createMenu(menu: CreateMenuParams): Menu {
  try {
    const result = query<Menu>(`
      INSERT INTO menus (
        parent_id, title, path, icon, sort_order
      ) VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `).get(
      menu.parent_id || null,
      menu.title,
      menu.path || null,
      menu.icon || null,
      menu.sort_order || 0
    );

    if (!result) {
      throw new AppError("创建菜单失败", 500);
    }

    return result;
  } catch (error) {
    logger.error("创建菜单失败:", error as Record<string, any>);
    throw new AppError("创建菜单失败", 500);
  }
}

/**
 * 更新菜单
 */
export function updateMenu(id: number, menu: UpdateMenuParams): Menu {
  try {
    const updates: string[] = [];
    const values: any[] = [];

    // 构建更新语句
    Object.entries(menu).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      throw new AppError("没有需要更新的内容", 400);
    }

    // 添加更新时间
    updates.push('updated_at = CURRENT_TIMESTAMP');

    // 添加ID条件
    values.push(id);

    const result = query<Menu>(`
      UPDATE menus 
      SET ${updates.join(', ')}
      WHERE id = ?
      RETURNING *
    `).get(...values);

    if (!result) {
      throw new AppError("菜单不存在", 404);
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("更新菜单失败:", error as Record<string, any>);
    throw new AppError("更新菜单失败", 500);
  }
}

/**
 * 删除菜单
 */
export function deleteMenu(id: number): void {
  try {
    const result = query<Menu>("DELETE FROM menus WHERE id = ?").run(id);
    
    if (!result.changes) {
      throw new AppError("菜单不存在", 404);
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("删除菜单失败:", error as Record<string, any>);
    throw new AppError("删除菜单失败", 500);
  }
}

/**
 * 根据角色获取菜单
 */
export function getMenusByRole(role: string): Menu[] {
  // 管理员角色获取所有菜单
  if (role === 'admin') {
    return getAllMenus();
  }
  
  // 其他角色通过关联表获取
  return query<Menu>(`
    SELECT 
      m.id,
      m.parent_id,
      m.title,
      m.path,
      m.icon,
      m.sort_order,
      m.created_at,
      m.updated_at
    FROM menus m
    JOIN role_menu rm ON m.id = rm.menu_id
    JOIN roles r ON rm.role_id = r.id
    WHERE r.name = ?
    ORDER BY m.sort_order ASC
  `).all(role);
} 