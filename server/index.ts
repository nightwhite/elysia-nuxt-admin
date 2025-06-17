import { config } from "./config"
import { app } from "./server"

// 独立运行的后端服务器
app.listen(config.PORT, () => console.log(`🦊 Standalone server started at http://localhost:${config.PORT}`))

// 处理进程信号
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