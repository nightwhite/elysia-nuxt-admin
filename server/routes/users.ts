import { Elysia, t } from "elysia";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  validateUser,
  getFilteredUsers
} from "../services/userService";
import type {
  LoginParams,
  CreateUserParams,
  UpdateUserParams,
  UserFilterParams
} from "../services/userService";
import { getOne } from "../db";
import { config } from "../config";

/**
 * 用户路由模块
 */
export const users = new Elysia({
  prefix: "/users",
})
  /**
   * 获取所有用户
   */
  .get("/list", () => getAllUsers(), {
    detail: {
      tags: ["用户接口"],
      summary: "获取所有用户",
      description: "返回系统中的所有用户",
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
                    username: { type: "string" },
                    name: { type: "string" },
                    role: { type: "string" },
                    email: { type: "string" },
                    avatar: { type: "string" },
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
   * 筛选用户
   */
  .get("/filter", ({ query }) => {
    const filters: UserFilterParams = {
      search: query.search,
      role: query.role
    };
    
    return getFilteredUsers(filters);
  }, {
    query: t.Object({
      search: t.Optional(t.String()),
      role: t.Optional(t.String()),
    }),
    detail: {
      tags: ["用户接口"],
      summary: "筛选用户",
      description: "根据条件筛选用户",
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
                    username: { type: "string" },
                    name: { type: "string" },
                    role: { type: "string" },
                    email: { type: "string" },
                    avatar: { type: "string" },
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
   * 根据ID获取用户
   */
  .get("/:id", ({ params }) => {
    const user = getUserById(parseInt(params.id));
    if (!user) {
      return new Response(JSON.stringify({ error: "用户不存在" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return user;
  }, {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ["用户接口"],
      summary: "根据ID获取用户",
      description: "返回指定ID的用户信息",
      responses: {
        200: {
          description: "成功响应",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  username: { type: "string" },
                  name: { type: "string" },
                  role: { type: "string" },
                  email: { type: "string" },
                  avatar: { type: "string" },
                  created_at: { type: "string" },
                  updated_at: { type: "string" },
                },
              },
            },
          },
        },
        404: {
          description: "用户不存在",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  })
  /**
   * 创建用户
   */
  .post("/", ({ body }) => {
    try {
      const id = createUser(body);
      return { id, success: true };
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }, {
    body: t.Object({
      username: t.String(),
      password: t.String(),
      name: t.String(),
      role: t.String(),
      email: t.Optional(t.String()),
      avatar: t.Optional(t.String()),
    }),
    detail: {
      tags: ["用户接口"],
      summary: "创建用户",
      description: "创建新的用户",
      responses: {
        200: {
          description: "创建成功",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  success: { type: "boolean" },
                },
              },
            },
          },
        },
        400: {
          description: "创建失败",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  })
  /**
   * 更新用户
   */
  .put("/:id", ({ params, body }) => {
    try {
      const success = updateUser(parseInt(params.id), body);
      if (!success) {
        return new Response(JSON.stringify({ error: "更新失败" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
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
      name: t.Optional(t.String()),
      role: t.Optional(t.String()),
      email: t.Optional(t.String()),
      avatar: t.Optional(t.String()),
      password: t.Optional(t.String()),
    }),
    detail: {
      tags: ["用户接口"],
      summary: "更新用户",
      description: "更新指定ID的用户信息",
      responses: {
        200: {
          description: "更新成功",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                },
              },
            },
          },
        },
        400: {
          description: "更新失败",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  })
  /**
   * 删除用户
   */
  .delete("/:id", ({ params }) => {
    try {
      const success = deleteUser(parseInt(params.id));
      return { success };
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
      tags: ["用户接口"],
      summary: "删除用户",
      description: "删除指定ID的用户",
      responses: {
        200: {
          description: "删除成功",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                },
              },
            },
          },
        },
        400: {
          description: "删除失败",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  })
  /**
   * 用户登录
   */
  .post("/login", ({ body }) => {
    console.log("登录请求:", body);
    
    const { username, password } = body;
    
    // 查询用户是否存在
    const rawUser = getOne(`
      SELECT * FROM users WHERE username = ?
    `, [username]);
    
    console.log("数据库查询结果:", rawUser);
    
    // 尝试验证
    const user = validateUser(username, password);
    console.log("验证结果:", user ? "验证成功" : "验证失败");
    
    if (!user) {
      return new Response(JSON.stringify({ error: "用户名或密码错误" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // 这里应该生成JWT令牌，但为了简单，我们只返回用户信息
    return {
      user,
      token: "mock-jwt-token",
    };
  }, {
    body: t.Object({
      username: t.String(),
      password: t.String(),
    }),
    detail: {
      tags: ["用户接口"],
      summary: "用户登录",
      description: "验证用户登录并返回令牌",
      responses: {
        200: {
          description: "登录成功",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  user: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      username: { type: "string" },
                      name: { type: "string" },
                      role: { type: "string" },
                    },
                  },
                  token: { type: "string" },
                },
              },
            },
          },
        },
        401: {
          description: "登录失败",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  });

export default users; 