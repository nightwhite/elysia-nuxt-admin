import { config } from "./config"
import { app } from "./server"

const signals = ["SIGINT", "SIGTERM"]

for (const signal of signals) {
  process.on(signal, async () => {
    console.log(`Received ${signal}. Initiating graceful shutdown...`)
    await app.stop()
    process.exit(0)
  })
}

process.on("uncaughtException", (error) => {
  console.error(error)
})

process.on("unhandledRejection", (error) => {
  console.error(error)
})

// 仅在非 Nuxt 环境下直接运行此文件时启动服务器
// 在 Nuxt 环境中，会通过 api.ts 导出
// 使用 ES 模块方式判断是否为主模块
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(config.PORT, () => console.log(`🦊 Server started at ${app.server?.url.origin}`))
}

export default app 