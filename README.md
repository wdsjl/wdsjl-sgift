<<<<<<< HEAD
# wdsjl-sgift
=======
# WDSJL's Gifts

一个极简、温暖的互动礼物空间应用。在背景图上布置可点击的物品，生成唯一链接分享给 TA，让 TA 慢慢发现每一份心意。

## 技术栈

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **Supabase** (Database + Storage)

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

## 快速开始

### 1. 创建 Supabase 项目

在 [Supabase](https://supabase.com) 创建新项目。

### 2. 运行数据库迁移

在 Supabase SQL Editor 中执行 `supabase/migrations/001_initial.sql`。

这会创建 `spaces`、`items` 表，以及 `images` 存储桶。

### 3. 配置环境变量

```bash
cp .env.local.example .env.local
```

填写以下变量：

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_APP_URL` | 应用地址，如 `http://localhost:3000` |

### 4. 启动开发服务器

```bash
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。

## 项目结构

```
src/
├── app/
│   ├── page.tsx          # 首页
│   ├── create/           # 创建空间
│   ├── edit/[id]/        # 编辑空间
│   └── s/[slug]/         # 浏览空间
├── components/           # UI 组件
└── lib/
    ├── actions/          # Server Actions
    ├── supabase/         # Supabase 客户端
    └── types.ts          # 类型定义
supabase/
└── migrations/           # 数据库迁移
```

## 部署

推荐部署到 [Vercel](https://vercel.com)，配置相同的环境变量即可。

## 许可证

MIT
>>>>>>> 78915c9 (feat: 实现 WDSJL's Gifts 互动礼物空间应用)
