# Elysia Nuxt Admin Template

> 🚀 一个现代化的后台管理系统模板，基于 Nuxt 3 + Elysia + shadcn-vue 构建

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Nuxt](https://img.shields.io/badge/Nuxt-3.x-00DC82.svg)](https://nuxt.com/)
[![Elysia](https://img.shields.io/badge/Elysia-1.x-8B5CF6.svg)](https://elysiajs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)

## 🎯 使用此模板

点击右上角的 **"Use this template"** 按钮，创建你的新项目！

## 技术栈

- **前端框架**: [Nuxt 3](https://nuxt.com/) - Vue.js 的全栈框架
- **后端框架**: [Elysia](https://elysiajs.com/) - 基于 Bun 的高性能 Web 框架
- **UI 框架**: [shadcn-vue](https://www.shadcn-vue.com/) - 高质量的 Vue 组件库
- **样式方案**: [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- **数据库**: SQLite (通过 Bun:SQLite) - 轻量级关系型数据库
- **图标**: [Lucide Icons](https://lucide.dev/) - 美观的开源图标库

## 特性

- ✨ 现代化的用户界面
- 🔐 内置用户认证系统 (JWT)
- 📊 动态菜单管理
- 👥 用户角色管理
- 📱 响应式设计
- 🚀 快速开发启动模板
- 📝 Swagger API 文档
- 📋 完整的表格功能 (排序、筛选、分页、批量操作)
- ⚙️ 系统配置管理
- 🌙 主题切换支持
- 📁 文件上传 (S3 集成)
- 🔧 TypeScript 全栈类型安全

## 数据库

项目使用 SQLite 作为数据库，通过 Bun 内置的 SQLite 支持实现。

### 数据库文件

- 数据库文件位置: `data/admin.db`
- 自动创建: 首次运行时自动创建数据库文件和表结构
- 默认数据: 包含基础的管理员账户和菜单配置

### 表结构

- **users**: 用户表
- **menus**: 菜单表
- **roles**: 角色表
- **role_menu**: 角色-菜单关联表

### 数据迁移

数据库文件会在 `data` 目录下自动创建，可以通过以下方式备份：

```bash
# 备份数据库
cp data/admin.db data/admin.db.backup
```

## Docker 部署

Docker 环境下运行集成模式（前后端在同一服务中）：

```bash
# 构建镜像
docker build -t elysia-nuxt-admin .

# 运行容器
docker run -d -p 3000:3000 -v $(pwd)/data:/app/data --name admin-system elysia-nuxt-admin
```

访问地址：

- 应用：<http://localhost:3000>
- API：<http://localhost:3000/api>

### Docker Compose

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 数据持久化

Docker 环境下的数据持久化配置：

```yaml
volumes:
  - ./data:/app/data  # 数据库文件持久化
```

**注意**：Docker 容器只暴露 3000 端口，前后端集成运行，无需额外端口。

## 🚀 快速开始

### 🎯 使用模板创建新项目

1. 点击仓库页面的 **"Use this template"** 按钮
2. 创建你的新仓库
3. 克隆并启动：

```bash
# 克隆你的新仓库
git clone https://github.com/your-username/your-project-name.git
cd your-project-name

# 安装依赖
bun install

# 设置环境变量
bun run setup

# 启动开发服务器
bun run dev
```

### 前置要求

- [Bun](https://bun.sh/) >= 1.0.0

### 安装

```bash
# 克隆项目
git clone https://github.com/nightwhite/elysia-nuxt-admin
cd elysia-nuxt-admin

# 安装依赖
bun install

# 设置环境变量
bun run setup
```

### 开发

```bash
# 启动开发服务器
bun dev
```

访问地址：

- 应用：<http://localhost:3000>
- API：<http://localhost:3000/api>

### 访问 Swagger 文档（开发模式）

如果需要查看 API 文档，可以单独启动后端服务器：

```bash
# 启动独立后端（仅用于访问 Swagger）
bun run server
```

- Swagger 文档：<http://localhost:3001/swagger>

> **说明**：
>
> - Swagger 文档只在开发模式下可用
> - 由于 Nuxt 路由可能会拦截 `/swagger` 路径，建议通过独立后端服务访问 API 文档
> - 生产环境不会加载 Swagger，以提高性能和安全性

### 构建

```bash
# 构建生产版本
bun run build

# 预览生产构建
bun run preview
```

生产模式下，前后端集成在一个服务中：

- 应用：<http://localhost:3000>
- API：<http://localhost:3000/api>

## 项目结构

```txt
elysia-nuxt-admin/
├── api.ts                 # API 类型定义
├── app.vue               # 应用入口
├── components/           # Vue 组件
│   ├── layout/          # 布局组件
│   └── ui/              # UI 组件
├── composables/         # Vue 组合式函数
├── layouts/             # 页面布局
├── pages/               # 页面组件
├── server/              # 后端服务
│   ├── db/             # 数据库配置
│   ├── routes/         # API 路由
│   ├── services/       # 业务服务
│   └── utils/          # 工具函数
├── scripts/            # 脚本文件
└── types/              # TypeScript 类型定义
```

## 功能模块

### 用户认证

- 登录/登出功能
- Token 基于的身份验证
- 用户会话持久化

### 用户管理

- 用户 CRUD 操作
- 角色分配
- 用户信息编辑

### 菜单管理

- 动态菜单配置
- 菜单权限控制
- 菜单排序

## 开发指南

### 添加新页面

1. 在 `pages` 目录下创建新的 `.vue` 文件
2. 添加相应的路由配置
3. 在菜单管理中添加新页面入口

### 添加新 API

1. 在 `server/routes` 下创建新的路由文件
2. 在 `server/server.ts` 中注册路由
3. 添加 Swagger 文档注释

### 自定义主题

项目使用 Tailwind CSS 进行样式管理，可以通过修改 `tailwind.config.ts` 自定义主题。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

## 🙏 致谢

- [Nuxt.js](https://nuxt.com/) - 优秀的 Vue.js 框架
- [Elysia.js](https://elysiajs.com/) - 快速的 Web 框架
- [shadcn-vue](https://www.shadcn-vue.com/) - 精美的组件库
- [Tailwind CSS](https://tailwindcss.com/) - 实用的 CSS 框架

---

如果这个项目对您有帮助，请给个 ⭐️ 支持一下！
