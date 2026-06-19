# WDSJL's Gifts

一个极简、温暖的互动礼物空间应用。在背景图上布置可点击的物品，生成唯一链接分享给 TA，让 TA 慢慢发现每一份心意。

**完全自建部署**：PostgreSQL 数据库 + 本地磁盘图片存储，不依赖任何云服务。

## 技术栈

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **PostgreSQL**（直连 `pg`）
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

| 接口 | 限制 | 说明 |
|------|------|------|
| `POST /api/upload/background` | 最大 10MB | 返回 `{ "url": "/uploads/backgrounds/xxx.webp" }` |
| `POST /api/upload/item` | 最大 5MB | 返回 `{ "url": "/uploads/items/xxx.webp" }` |

## 快速开始

### 1. 安装并配置 PostgreSQL

在服务器上安装 PostgreSQL，创建数据库：

```sql
CREATE DATABASE wdsjl_gifts;
```

执行迁移脚本 `db/migrations/001_initial.sql`。

### 2. 配置环境变量

```bash
cp .env.local.example .env.local
```

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 连接串，如 `postgresql://postgres:密码@localhost:5432/wdsjl_gifts` |
| `NEXT_PUBLIC_APP_URL` | 应用地址，如 `http://服务器IP:8080` |

### 3. 启动

```bash
npm install
npm run dev
```

## Windows Server 部署

```bash
npm install
npm run build
npm run start
```

配合 Nginx 反向代理 + PM2 进程管理。确保运行用户对 `uploads/` 目录有读写权限。

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
│   ├── db.ts             # PostgreSQL 连接
│   ├── upload.ts         # 图片处理与文件操作
│   └── actions/          # Server Actions
db/
└── migrations/           # 数据库迁移
uploads/                  # 本地图片存储
```

## 许可证

MIT
