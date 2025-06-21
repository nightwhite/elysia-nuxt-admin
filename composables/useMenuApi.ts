import { useApi } from './useApi'
import type { Menu, CreateMenuParams, UpdateMenuParams } from '~/types/menu'

/**
 * 菜单 API 服务
 */
export const useMenuApi = () => {
  const api = useApi()

  /**
   * 获取所有菜单
   */
  const getMenus = () => {
    return api.get<Menu[]>('/api/menus')
  }

  /**
   * 获取菜单树
   */
  const getMenuTree = () => {
    return api.get<Menu[]>('/api/menus/tree')
  }

  /**
   * 根据 ID 获取菜单
   */
  const getMenuById = (id: number) => {
    return api.get<Menu>(`/api/menus/${id}`)
  }

  /**
   * 根据角色获取菜单
   */
  const getMenusByRole = (role: string) => {
    return api.get<Menu[]>(`/api/menus/role/${role}`)
  }

  /**
   * 创建菜单
   */
  const createMenu = (menuData: CreateMenuParams) => {
    return api.post<{ id: number; success: boolean }>('/api/menus', menuData)
  }

  /**
   * 更新菜单
   */
  const updateMenu = (id: number, menuData: UpdateMenuParams) => {
    return api.put<{ success: boolean }>(`/api/menus/${id}`, menuData)
  }

  /**
   * 删除菜单
   */
  const deleteMenu = (id: number) => {
    return api.delete<{ success: boolean }>(`/api/menus/${id}`)
  }

  return {
    getMenus,
    getMenuTree,
    getMenuById,
    getMenusByRole,
    createMenu,
    updateMenu,
    deleteMenu,
  }
}
