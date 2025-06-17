#!/bin/bash

# 确保脚本在错误时退出
set -e

# 显示执行的命令
set -x

# 构建 Docker 镜像
echo "🏗️  构建 Docker 镜像..."
docker compose build

# 停止旧容器（如果存在）
echo "🛑 停止旧容器..."
docker compose down || true

# 启动新容器
echo "🚀 启动新容器..."
docker compose up -d

# 显示容器日志
echo "📝 显示容器日志..."
docker compose logs -f 