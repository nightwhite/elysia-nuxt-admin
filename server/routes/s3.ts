import { Elysia, t } from "elysia"
import { requireAdmin } from "../utils/auth"
import { S3ConfigService } from "../services/s3ConfigService"

/**
 * S3配置路由模块
 */
export const s3 = new Elysia()
  .group("/s3", (app) =>
    app
      .use(requireAdmin)
      /**
       * 获取S3配置
       */
      .get("/config", () => {
        const result = S3ConfigService.getConfig()

        if (!result.success) {
          return new Response(JSON.stringify({
            success: false,
            error: result.message
          }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          })
        }

        return result
      }, {
        detail: {
          tags: ["S3配置"],
          summary: "获取S3配置",
          description: "获取当前的S3配置信息（不包含敏感信息）",
          responses: {
            200: {
              description: "成功响应",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "number" },
                          access_key: { type: "string" },
                          secret_key: { type: "string" },
                          bucket: { type: "string" },
                          region: { type: "string" },
                          endpoint: { type: "string" },
                          created_at: { type: "string" },
                          updated_at: { type: "string" }
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
       * 保存S3配置
       */
      .post("/config", ({ body }) => {
        // 标准化数据类型，确保enabled是布尔值
        const normalizedBody = {
          ...body,
          enabled: Boolean(body.enabled)
        }

        const result = S3ConfigService.saveConfig(normalizedBody)

        if (!result.success) {
          return new Response(JSON.stringify({
            success: false,
            error: result.message
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          })
        }

        return result
      }, {
        body: t.Object({
          enabled: t.Union([t.Boolean(), t.Number()]),
          endpoint_url: t.Optional(t.String()),
          aws_access_key_id: t.String(),
          aws_secret_access_key: t.String(),
          region_name: t.String(),
          bucket_name: t.String(),
          folder: t.Optional(t.String()),
          bucket_url: t.Optional(t.String())
        }),
        detail: {
          tags: ["S3配置"],
          summary: "保存S3配置",
          description: "保存或更新S3配置信息",
          responses: {
            200: {
              description: "成功响应",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { type: "object" },
                      message: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      })
      
      /**
       * 测试S3连接
       */
      .post("/test", async ({ body }) => {
        // 标准化数据类型，确保enabled是布尔值
        const normalizedBody = {
          ...body,
          enabled: Boolean(body.enabled)
        }

        return await S3ConfigService.testConnection(normalizedBody)
      }, {
        body: t.Object({
          enabled: t.Union([t.Boolean(), t.Number()]),
          endpoint_url: t.Optional(t.String()),
          aws_access_key_id: t.String(),
          aws_secret_access_key: t.String(),
          region_name: t.String(),
          bucket_name: t.String(),
          folder: t.Optional(t.String()),
          bucket_url: t.Optional(t.String())
        }),
        detail: {
          tags: ["S3配置"],
          summary: "测试S3连接",
          description: "测试S3配置的连接性",
          responses: {
            200: {
              description: "测试结果",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      details: { type: "object" }
                    }
                  }
                }
              }
            }
          }
        }
      })
  )
