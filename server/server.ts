import { bearer } from "@elysiajs/bearer"
import { cors } from "@elysiajs/cors"
import { swagger } from "@elysiajs/swagger"
import { Elysia } from "elysia"

// 导入数据库初始化函数
import { initDB } from "./db"

// 导入路由文件
import { admin } from "./routes/admin"
import { users } from "./routes/users"
import { menus } from "./routes/menus"
import { s3 } from "./routes/s3"
import { s3Files } from "./routes/s3-files"

// 初始化数据库
initDB()

// 创建主应用实例
export const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: "Admin Template API",
        description: "基于 Nuxt + Elysia + shadcn-vue 的管理系统模板 API",
        version: "1.0.0",
        contact: {
          name: "Admin Template Team",
        },
      },
      servers: [
        {
          url: "/",  // 使用相对路径，更灵活
          description: "开发环境",
        }
      ],
      tags: [
        {
          name: "基础接口",
          description: "基础服务接口",
        },
        {
          name: "管理接口",
          description: "管理相关接口",
        },
        {
          name: "用户接口",
          description: "用户管理接口",
        },
        {
          name: "菜单接口",
          description: "菜单管理接口",
        },
        {
          name: "S3配置",
          description: "S3存储配置接口",
        },
        {
          name: "S3文件管理",
          description: "S3文件管理接口",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ]
    }
  }))
  .use(bearer())
  .use(cors())
  .get("/", "Hello Admin", {
    detail: {
      tags: ["基础接口"],
      summary: "服务健康检查",
      description: "检查服务是否正常运行",
      responses: {
        200: {
          description: "服务正常",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                example: "Hello Admin",
              },
            },
          },
        },
      },
    },
  })
  .get("/hello", () => ({ message: "Hello world!" }), {
    detail: {
      tags: ["基础接口"],
      summary: "Hello World 接口",
      description: "返回 Hello World 消息",
      responses: {
        200: {
          description: "成功响应",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Hello world!",
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  // 使用各种路由模块
  .use(admin)
  .use(users)
  .use(menus)
  .use(s3)
  .use(s3Files)

console.log("Elysia server routes loaded")

export type ElysiaApp = typeof app 