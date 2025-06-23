import { Elysia, t } from "elysia"
import { requireAdmin } from "../utils/auth"
import { SystemConfigService } from "../services/systemConfigService"

/**
 * 系统配置路由模块
 */
export const systemConfig = new Elysia()
  .group("/system-config", (app) =>
    app
      /**
       * 测试路由（无需认证）
       */
      .get("/test", () => {
        return { success: true, message: "系统配置路由正常工作" }
      })

      /**
       * 获取系统基本信息（无需认证，供前端布局使用）
       */
      .get("/info", () => {
        const result = SystemConfigService.getSystemInfo()

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
          tags: ["系统配置"],
          summary: "获取系统基本信息",
          description: "获取系统名称、Logo、版本等基本信息（无需认证）",
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
                          name: { type: "string" },
                          logo: { type: "string" },
                          logoUrl: { type: "string" },
                          description: { type: "string" },
                          version: { type: "string" },
                          copyright: { type: "string" }
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

      .use(requireAdmin)
      
      /**
       * 获取所有系统配置
       */
      .get("/", () => {
        const result = SystemConfigService.getAllConfigs()
        
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
          tags: ["系统配置"],
          summary: "获取所有系统配置",
          description: "获取系统中的所有配置项",
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
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "number" },
                            config_key: { type: "string" },
                            config_value: { type: "string" },
                            config_type: { type: "string" },
                            description: { type: "string" },
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
        }
      })
      

      
      /**
       * 获取单个系统配置
       */
      .get("/:key", ({ params }) => {
        const result = SystemConfigService.getConfig(params.key)
        
        if (!result.success) {
          return new Response(JSON.stringify({
            success: false,
            error: result.message
          }), {
            status: 404,
            headers: { "Content-Type": "application/json" }
          })
        }
        
        return result
      }, {
        params: t.Object({
          key: t.String()
        }),
        detail: {
          tags: ["系统配置"],
          summary: "获取单个系统配置",
          description: "根据配置键获取单个配置项",
          parameters: [
            {
              name: "key",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "配置项的键名"
            }
          ]
        }
      })
      
      /**
       * 批量更新系统配置
       */
      .put("/", ({ body }) => {
        const result = SystemConfigService.updateConfigs(body)
        
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
          configs: t.Array(t.Object({
            key: t.String(),
            value: t.Union([t.String(), t.Null()]),
            type: t.Optional(t.Union([
              t.Literal('string'),
              t.Literal('number'),
              t.Literal('boolean'),
              t.Literal('json')
            ])),
            description: t.Optional(t.String())
          }))
        }),
        detail: {
          tags: ["系统配置"],
          summary: "批量更新系统配置",
          description: "批量更新多个系统配置项",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    configs: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          key: { type: "string" },
                          value: { type: "string", nullable: true },
                          type: { type: "string", enum: ["string", "number", "boolean", "json"] },
                          description: { type: "string" }
                        },
                        required: ["key", "value"]
                      }
                    }
                  },
                  required: ["configs"]
                }
              }
            }
          }
        }
      })
      
      /**
       * 更新单个系统配置
       */
      .put("/:key", ({ params, body }) => {
        const result = SystemConfigService.updateConfig(
          params.key,
          body.value,
          body.type || 'string',
          body.description
        )
        
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
        params: t.Object({
          key: t.String()
        }),
        body: t.Object({
          value: t.Union([t.String(), t.Null()]),
          type: t.Optional(t.Union([
            t.Literal('string'),
            t.Literal('number'),
            t.Literal('boolean'),
            t.Literal('json')
          ])),
          description: t.Optional(t.String())
        }),
        detail: {
          tags: ["系统配置"],
          summary: "更新单个系统配置",
          description: "更新指定的系统配置项"
        }
      })
      
      /**
       * 删除系统配置
       */
      .delete("/:key", ({ params }) => {
        const result = SystemConfigService.deleteConfig(params.key)
        
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
        params: t.Object({
          key: t.String()
        }),
        detail: {
          tags: ["系统配置"],
          summary: "删除系统配置",
          description: "删除指定的系统配置项（系统关键配置不能删除）"
        }
      })
      
      /**
       * 重置系统配置为默认值
       */
      .post("/reset", () => {
        const result = SystemConfigService.resetToDefaults()
        
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
          tags: ["系统配置"],
          summary: "重置系统配置",
          description: "将系统配置重置为默认值"
        }
      })
  )
