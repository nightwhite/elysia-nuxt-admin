import { Elysia, t } from "elysia"
import { requireAdmin } from "../utils/auth"
import { S3FileService } from "../services/s3FileService"

/**
 * S3文件管理路由模块
 */
export const s3Files = new Elysia()
  .group("/s3-files", (app) =>
    app
      .use(requireAdmin)

      /**
       * 获取文件列表
       */
      .get("/list", async ({ query }) => {
        const prefix = query.prefix || ''
        const maxKeys = parseInt(query.maxKeys as string) || 100
        const continuationToken = query.continuationToken as string

        return await S3FileService.listFiles(prefix, maxKeys, continuationToken)
      }, {
        query: t.Object({
          prefix: t.Optional(t.String()),
          maxKeys: t.Optional(t.String()),
          continuationToken: t.Optional(t.String())
        }),
        detail: {
          tags: ["S3文件管理"],
          summary: "获取文件列表",
          description: "获取指定路径下的文件和文件夹列表"
        }
      })

      /**
       * 删除文件
       */
      .delete("/delete/:key", async ({ params }) => {
        const key = decodeURIComponent(params.key)
        return await S3FileService.deleteFile(key)
      }, {
        params: t.Object({
          key: t.String()
        }),
        detail: {
          tags: ["S3文件管理"],
          summary: "删除文件",
          description: "删除指定的文件"
        }
      })

      /**
       * 上传文件
       */
      .post("/upload", async ({ body }) => {
        try {
          const { file, path } = body

          console.log('上传文件请求:', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            path: path
          })

          // 正确处理路径拼接，避免双斜杠
          let key = file.name
          if (path) {
            const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path
            key = cleanPath ? `${cleanPath}/${file.name}` : file.name
          }

          console.log('最终上传key:', key)

          const result = await S3FileService.uploadFile(key, file)
          console.log('上传结果:', result)

          return result
        } catch (error: any) {
          return {
            success: false,
            message: `上传失败: ${error.message}`
          }
        }
      }, {
        body: t.Object({
          file: t.File(),
          path: t.Optional(t.String())
        }),
        detail: {
          tags: ["S3文件管理"],
          summary: "上传文件",
          description: "上传文件到指定路径"
        }
      })

      /**
       * 获取文件预览URL
       */
      .get("/preview/:key", async ({ params, query }) => {
        const key = decodeURIComponent(params.key)
        const usePublicUrl = query.public !== 'false' // 默认使用公共URL

        return await S3FileService.getPreviewUrl(key, usePublicUrl)
      }, {
        params: t.Object({
          key: t.String()
        }),
        query: t.Object({
          public: t.Optional(t.String())
        }),
        detail: {
          tags: ["S3文件管理"],
          summary: "获取文件预览URL",
          description: "获取文件的访问URL，支持公共URL和预签名URL"
        }
      })

      /**
       * 获取文件的多种URL类型
       */
      .get("/urls/:key", async ({ params }) => {
        const key = decodeURIComponent(params.key)
        return await S3FileService.getFileUrls(key)
      }, {
        params: t.Object({
          key: t.String()
        }),
        detail: {
          tags: ["S3文件管理"],
          summary: "获取文件的多种URL",
          description: "获取文件的公共URL和预签名URL"
        }
      })
  )