export interface Menu {
  id?: number;
  parent_id?: number | null;
  title: string;
  path: string;
  icon?: string | null;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MenuTreeItem extends Menu {
  children?: MenuTreeItem[];
}

// 创建菜单的参数
export interface CreateMenuParams {
  parent_id?: number | null;
  title: string;
  path: string;
  icon?: string | null;
  sort_order?: number;
}

// 更新菜单的参数
export interface UpdateMenuParams {
  parent_id?: number | null;
  title?: string;
  path?: string;
  icon?: string | null;
  sort_order?: number;
} 