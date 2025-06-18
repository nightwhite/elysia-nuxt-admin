import { Elysia, t } from "elysia"
import { getDB } from "../db"

/**
 * 管理接口路由模块
 */
export const admin = new Elysia()
  /**
   * 获取管理系统信息
   */
  .get("/admin/info", () => ({
    name: "Admin Template",
    version: "1.0.0",
    env: process.env.NODE_ENV || "development"
  }), {
    detail: {
      tags: ["管理接口"],
      summary: "获取管理系统信息",
      description: "返回管理系统的基本信息",
      responses: {
        200: {
          description: "成功响应",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  version: { type: "string" },
                  env: { type: "string" }
                }
              }
            }
          }
        }
      }
    }
  })
  /**
   * 获取所有用户（调试接口）
   */
  .get("/admin/debug/users", () => {
    // 调试接口，获取所有用户（包含密码，仅用于调试）
    const db = getDB();
    const users = db.query("SELECT * FROM users").all();
    return users;
  }, {
    detail: {
      tags: ["管理接口"],
      summary: "调试: 获取所有用户",
      description: "返回数据库中的所有用户信息（包括密码，仅用于调试）",
    }
  })
  /**
   * 获取仪表盘数据
   */
  .get("/admin/dashboard", () => {
    // 获取各种统计数据
    const db = getDB();
    const userCount = db.query("SELECT COUNT(*) as count FROM users").get().count;
    const menuCount = db.query("SELECT COUNT(*) as count FROM menus").get().count;
    const roleCount = db.query("SELECT COUNT(*) as count FROM roles").get().count;
    
    // 获取最近添加的用户
    const recentUsers = db.query(`
      SELECT id, username, name, role, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `).all();
    
    return {
      stats: {
        userCount,
        menuCount,
        roleCount
      },
      recentUsers
    };
  }, {
    detail: {
      tags: ["管理接口"],
      summary: "获取仪表盘数据",
      description: "返回管理系统仪表盘的统计数据",
      responses: {
        200: {
          description: "成功响应",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  stats: {
                    type: "object",
                    properties: {
                      userCount: { type: "number" },
                      menuCount: { type: "number" },
                      roleCount: { type: "number" }
                    }
                  },
                  recentUsers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        username: { type: "string" },
                        name: { type: "string" },
                        role: { type: "string" },
                        created_at: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  /**
   * 获取数据库表
   */
  .get("/admin/db/tables", () => {
    // 获取数据库中的所有表
    const db = getDB();
    const tables = db.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    return tables;
  }, {
    detail: {
      tags: ["管理接口"],
      summary: "获取数据库表",
      description: "返回数据库中的所有表",
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
                    name: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  /**
   * 获取表详情
   */
  .get("/admin/db/table/:name", ({ params }) => {
    // 获取表结构
    const db = getDB();
    const schema = db.query(`PRAGMA table_info(${params.name})`).all();
    
    // 获取表数据（限制返回条数）
    const data = db.query(`SELECT * FROM ${params.name} LIMIT 100`).all();
    
    return {
      schema,
      data
    };
  }, {
    params: t.Object({
      name: t.String()
    }),
    detail: {
      tags: ["管理接口"],
      summary: "获取表详情",
      description: "返回指定表的结构和数据",
      responses: {
        200: {
          description: "成功响应",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        cid: { type: "number" },
                        name: { type: "string" },
                        type: { type: "string" },
                        notnull: { type: "number" },
                        dflt_value: { type: "string" },
                        pk: { type: "number" }
                      }
                    }
                  },
                  data: {
                    type: "array",
                    items: {
                      type: "object"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  /**
   * 执行SQL查询
   */
  .post("/admin/db/query", ({ body }) => {
    try {
      const db = getDB();
      const result = db.query(body.sql).all();
      return { success: true, data: result };
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }, {
    body: t.Object({
      sql: t.String()
    }),
    detail: {
      tags: ["管理接口"],
      summary: "执行SQL查询",
      description: "执行自定义SQL查询（仅限SELECT语句）",
      responses: {
        200: {
          description: "查询成功",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  data: {
                    type: "array",
                    items: {
                      type: "object"
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: "查询失败",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: { type: "string" }
                }
              }
            }
          }
        }
      }
    }
  });

export default admin; 