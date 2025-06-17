# 构建阶段使用 Node.js
FROM node:20 AS builder

# 安装 bun
RUN curl -fsSL https://bun.sh/install | bash && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 bun.lock
COPY package.json bun.lock ./

# 安装依赖
RUN bun install

# 复制源代码
COPY . .

# 构建应用
RUN bun run build

# 生产环境
FROM oven/bun:1.0-slim

WORKDIR /app

# 复制构建产物和必要文件
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock

# 创建数据目录
RUN mkdir -p /app/data

# 设置环境变量
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["bun", ".output/server/index.mjs"] 