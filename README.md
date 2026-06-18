# WDSJL's Gifts

一个极简、温暖的互动礼物空间应用。在背景图上布置可点击的物品，生成唯一链接分享给 TA，让 TA 慢慢发现每一份心意。

## 技术栈

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **PostgreSQL**（通过 Supabase 客户端连接）
- **本地文件存储**（`uploads/` 目录，sharp + multer 处理）

## 功能

### 创建端 (`/create` → `/edit/[id]`)

- 创建空间并上传背景图
- 添加可交互物品（缩略图、标题、描述）
- 拖拽物品到背景图任意位置
- 发布空间并生成唯一访问链接

### 浏览端 (`/s/[slug]`)

- 展示背景图与所有物品
- 点击物品查看详情弹窗
- 首次查看计入收集进度（localStorage）
- 左上角显示已发现数量
- 全部发现后显示完成提示

## 图片存储

所有图片保存在项目根目录 `uploads/`：

```
uploads/
├── backgrounds/   # 场景背景图（最长边 1920px，webp 80%）
├── items/         # 物品图片（最长边 800px，webp 80%）
└── temp/          # 处理过程中的临时文件
```

上传接口：

| 接口 | 限制 | 说明 |
|------|------|------|
| `POST /api/upload/background` | 最大 10MB | 返回 `{ "url": "/uploads/backgrounds/xxx.webp" }` |
| `POST /api/upload/item` | 最大 5MB | 返回 `{ "url": "/uploads/items/xxx.webp" }` |

静态访问：`https://domain.com/uploads/backgrounds/xxx.webp`

## 快速开始

### 1. 配置数据库

在 PostgreSQL（或 Supabase）中执行 `supabase/migrations/001_initial.sql`。

### 2. 配置环境变量

```bash
cp .env.local.example .env.local
```

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 数据库 API 地址 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key（仅服务端） |
| `NEXT_PUBLIC_APP_URL` | 应用地址，如 `http://localhost:3000` |

### 3. 启动

```bash
npm install
npm run dev
```

应用启动时会自动创建 `uploads/` 目录结构。

## Windows Server 部署

```bash
npm install
npm run build
npm run start
```

确保运行用户对 `uploads/` 目录有读写权限。推荐使用 PM2 或 IIS + iisnode 保持进程运行。

## 项目结构

```
src/
├── app/
│   ├── api/upload/       # 图片上传接口
│   ├── uploads/          # 静态图片访问路由
│   ├── create/           # 创建空间
│   ├── edit/[id]/        # 编辑空间
│   └── s/[slug]/         # 浏览空间
├── lib/
│   ├── upload.ts         # 图片处理与文件操作
│   ├── multer.ts         # 上传解析
│   └── actions/          # Server Actions
uploads/                  # 本地图片存储（运行时自动创建）
```

## 许可证

MIT
