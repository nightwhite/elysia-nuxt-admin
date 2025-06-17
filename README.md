# Admin System Template

一个现代化的后台管理系统模板，基于 Nuxt 3 + Elysia + shadcn-vue 构建。

## 技术栈

- **前端框架**: [Nuxt 3](https://nuxt.com/) - Vue.js 的全栈框架
- **后端框架**: [Elysia](https://elysiajs.com/) - 基于 Bun 的高性能 Web 框架
- **UI 框架**: [shadcn-vue](https://www.shadcn-vue.com/) - 高质量的 Vue 组件库
- **样式方案**: [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- **数据库**: SQLite (通过 Bun:SQLite) - 轻量级关系型数据库
- **图标**: [Lucide Icons](https://lucide.dev/) - 美观的开源图标库

## 特性

- ✨ 现代化的用户界面
- 🔐 内置用户认证系统
- 📊 动态菜单管理
- 👥 用户角色管理
- 📱 响应式设计
- 🚀 快速开发启动模板
- 📝 Swagger API 文档

## 快速开始

### 前置要求

- [Bun](https://bun.sh/) >= 1.0.0

### 安装

```bash
# 克隆项目
git clone <your-repo-url>

# 进入项目目录
cd admin-system-template

# 安装依赖
bun install
```

### 开发

```bash
# 启动开发服务器
bun dev
```

访问 http://localhost:3000 查看应用。

### 构建

```bash
# 构建生产版本
bun run build

# 预览生产构建
bun run preview
```

## 项目结构

```
admin-system-template/
├── api.ts                 # API 类型定义
├── app.vue               # 应用入口
├── components/           # Vue 组件
│   ├── layout/          # 布局组件
│   └── ui/              # UI 组件
├── composables/         # Vue 组合式函数
├── pages/               # 页面组件
├── server/              # 后端服务
│   ├── db/             # 数据库配置
│   ├── routes/         # API 路由
│   └── services/       # 业务服务
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

### API 文档

访问 http://localhost:3000/api/swagger 查看完整的 API 文档。

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

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

[MIT](LICENSE)
