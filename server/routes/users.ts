import { Elysia, t } from "elysia";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  validateUser,
  getFilteredUsers,
  getUsersPaginated
} from "../services/userService";
import type {
  UserFilterParams,
  UserListParams,
  PaginatedResponse
} from "../services/userService";
import { logger } from "../utils/logger";
import { generateToken, refreshToken } from "../utils/jwt";
import { requireAuth, requireAdmin, requireSelfOrAdmin } from "../utils/auth";

/**
 * 用户路由模块
 */
export const users = new Elysia()
  // 公开接口 - 不需要身份验证
  /**
   * 用户登录
   */
  .post("/users/login", async ({ body }) => {
    const { username, password } = body;

    // 尝试验证
    const user = await validateUser(username, password);
    logger.debug('用户验证结果', { success: !!user });

    if (!user) {
      return new Response(JSON.stringify({ error: "用户名或密码错误" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 生成JWT令牌
    const token = await generateToken(user);
    logger.debug('生成令牌成功');

    return {
      user,
      token
    };
  }, {
    body: t.Object({
      username: t.String(),
      password: t.String(),
    }),
    detail: {
      tags: ["用户接口"],
      summary: "用户登录",
      description: "用户登录验证",
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
                      email: { type: "string" },
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
  })
  /**
   * 刷新令牌
   */
  .post("/users/refresh-token", async ({ headers }) => {
    const authHeader = headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return new Response(JSON.stringify({ error: "未提供令牌" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const newToken = await refreshToken(token);
      logger.debug('令牌刷新成功');
      return { token: newToken };
    } catch (error) {
      return new Response(JSON.stringify({ error: "刷新令牌失败" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }, {
    detail: {
      tags: ["用户接口"],
      summary: "刷新令牌",
      description: "刷新用户访问令牌",
      responses: {
        200: {
          description: "刷新成功",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  token: { type: "string" },
                },
              },
            },
          },
        },
        401: {
          description: "刷新失败",
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

  // 需要管理员权限的接口
  .group("/users", (app) =>
    app
      .use(requireAdmin)
      /**
       * 分页获取用户列表 - 需要管理员权限
       */
      .get("/list", ({ query }) => {
        const params: UserListParams = {
          page: query.page ? parseInt(query.page as string) : 1,
          pageSize: query.pageSize ? parseInt(query.pageSize as string) : 10,
          search: query.search as string,
          role: query.role as string
        };

        return getUsersPaginated(params);
      }, {
        query: t.Object({
          page: t.Optional(t.String()),
          pageSize: t.Optional(t.String()),
          search: t.Optional(t.String()),
          role: t.Optional(t.String()),
        }),
        detail: {
          tags: ["用户接口"],
          summary: "分页获取用户列表",
          description: "分页返回用户列表，支持搜索和角色筛选（需要管理员权限）",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "成功响应",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "number" },
                            username: { type: "string" },
                            name: { type: "string" },
                            email: { type: "string" },
                            role: { type: "string" },
                            created_at: { type: "string" },
                            updated_at: { type: "string" },
                          },
                        },
                      },
                      total: { type: "number" },
                      page: { type: "number" },
                      pageSize: { type: "number" },
                      totalPages: { type: "number" },
                    },
                  },
                },
              },
            },
            401: {
              description: "未授权",
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
            403: {
              description: "权限不足",
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
       * 筛选用户 - 需要管理员权限
       */
      .get("/filter", ({ query }) => {
        const filters: UserFilterParams = {
          search: query.search as string,
          role: query.role as string
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
                    email: { type: "string" },
                    role: { type: "string" },
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
       * 创建用户 - 需要管理员权限
       */
      .post("/", ({ body }) => {
        try {
          // 设置默认角色
          const userParams = {
            ...body,
            role: body.role || 'user'
          };

          const id = createUser(userParams);
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
          email: t.Optional(t.String()),
          role: t.Optional(t.String()),
        }),
        detail: {
          tags: ["用户接口"],
          summary: "创建用户",
          description: "创建新的用户（需要管理员权限）",
          security: [{ bearerAuth: [] }],
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
       * 删除用户 - 需要管理员权限
       */
      .delete("/:id", ({ params }) => {
        try {
          const id = parseInt(params.id);
          const success = deleteUser(id);
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
          description: "删除指定ID的用户（需要管理员权限）",
          security: [{ bearerAuth: [] }],
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
  )

  // 需要认证的接口（用户可以访问自己的数据）
  .group("/users", (app) =>
    app
      .use(requireSelfOrAdmin)
      /**
       * 根据ID获取用户 - 需要认证
       */
      .get("/:id", ({ params }) => {
        const id = parseInt(params.id);
        const userInfo = getUserById(id);

        if (!userInfo) {
          return new Response(JSON.stringify({ error: "用户不存在" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        return userInfo;
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
                  email: { type: "string" },
                  role: { type: "string" },
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
       * 更新用户 - 需要认证（用户可以更新自己的信息，管理员可以更新任何用户）
       */
      .put("/:id", ({ params, body }) => {
        try {
          const id = parseInt(params.id);

          // requireSelfOrAdmin 中间件已经处理了权限检查
          // 这里直接更新用户信息
          const success = updateUser(id, body);

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
    body: t.Object({
      username: t.Optional(t.String()),
      password: t.Optional(t.String()),
      name: t.Optional(t.String()),
      email: t.Optional(t.String()),
      role: t.Optional(t.String()),
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
  );

export default users;