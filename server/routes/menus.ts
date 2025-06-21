import { Elysia, t } from "elysia";
import {
  getAllMenus,
  getMenuById,
  getMenuTree,
  createMenu,
  updateMenu,
  deleteMenu,
  getMenusByRole
} from "../services/menuService";

import { requireAdmin, requireAuth } from "../utils/auth";

/**
 * 菜单路由模块 - 需要认证的接口
 */
const menusAuth = new Elysia()
  .use(requireAuth)
  /**
   * 获取所有菜单
   */
  .get("/menus", () => getAllMenus(), {
    detail: {
      tags: ["菜单接口"],
      summary: "获取所有菜单",
      description: "返回系统中的所有菜单",
      responses: {
        200: {
          description: "成功响应",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    parent_id: { type: "number", nullable: true },
                    title: { type: "string" },
                    path: { type: "string", nullable: true },
                    icon: { type: "string", nullable: true },
                    sort_order: { type: "number" },
                    created_at: { type: "string" },
                    updated_at: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  /**
   * 获取菜单树
   */
  .get("/menus/tree", () => getMenuTree(), {
    detail: {
      tags: ["菜单接口"],
      summary: "获取菜单树",
      description: "返回树形结构的菜单",
      responses: {
        200: {
          description: "成功响应",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    parent_id: { type: "number", nullable: true },
                    title: { type: "string" },
                    path: { type: "string", nullable: true },
                    icon: { type: "string", nullable: true },
                    sort_order: { type: "number" },
                    children: { 
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Menu"
                      }
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  /**
   * 根据ID获取菜单
   */
  .get("/menus/:id", ({ params }) => {
    console.log('🔍 GET /menus/:id called');
    const menu = getMenuById(parseInt(params.id));
    if (!menu) {
      return new Response(JSON.stringify({ error: "菜单不存在" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return menu;
  }, {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ["菜单接口"],
      summary: "根据ID获取菜单",
      description: "返回指定ID的菜单信息",
    },
  })
  /**
   * 根据角色获取菜单
   */
  .get("/menus/role/:role", ({ params }) => {
    console.log('🔍 GET /menus/role/:role called');
    return getMenusByRole(params.role);
  }, {
    params: t.Object({
      role: t.String(),
    }),
    detail: {
      tags: ["菜单接口"],
      summary: "根据角色获取菜单",
      description: "返回指定角色可访问的菜单列表",
    },
  });

/**
 * 菜单路由模块 - 需要管理员权限的接口
 */
const menusAdmin = new Elysia()
  .use(requireAdmin)
  /**
   * 创建菜单
   */
  .post("/menus", ({ body }) => {
    try {
      const menu = createMenu(body);
      return { id: menu.id, success: true };
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }, {
    body: t.Object({
      parent_id: t.Optional(t.Union([t.Number(), t.Null()])),
      title: t.String(),
      path: t.Optional(t.String()),
      icon: t.Optional(t.String()),
      sort_order: t.Optional(t.Number()),
    }),
    detail: {
      tags: ["菜单接口"],
      summary: "创建菜单",
      description: "创建新的菜单",
    },
  })
  /**
   * 更新菜单
   */
  .put("/menus/:id", ({ params, body }) => {
    try {
      updateMenu(parseInt(params.id), body);
      return { success: true };
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      parent_id: t.Optional(t.Union([t.Number(), t.Null()])),
      title: t.Optional(t.String()),
      path: t.Optional(t.String()),
      icon: t.Optional(t.String()),
      sort_order: t.Optional(t.Number()),
    }),
    detail: {
      tags: ["菜单接口"],
      summary: "更新菜单",
      description: "更新指定ID的菜单信息",
    },
  })
  /**
   * 删除菜单
   */
  .delete("/menus/:id", ({ params }) => {
    try {
      deleteMenu(parseInt(params.id));
      return { success: true };
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ["菜单接口"],
      summary: "删除菜单",
      description: "删除指定ID的菜单",
    },
  });

/**
 * 导出合并的菜单路由
 */
export const menus = new Elysia()
  .use(menusAuth)
  .use(menusAdmin);
