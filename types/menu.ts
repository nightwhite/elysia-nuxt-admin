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