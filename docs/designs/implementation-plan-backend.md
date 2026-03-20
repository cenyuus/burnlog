# 实现计划：后端 + CLI + 基础设施（不含前端 UI）

## Context

AI 使用数据看板项目。设计文档、CEO 审查、工程审查均已完成。
本计划仅覆盖不依赖设计审查的部分：项目脚手架、数据库、API、CLI 包、邮件服务。
前端页面的具体 UI 样式等 /plan-design-review 完成后再做。

关键设计文档：`docs/designs/ai-usage-dashboard.md`

## 技术栈

- Next.js 15 (App Router)
- Supabase (Auth + Postgres + Storage)
- Vercel (部署 + Cron)
- Resend (邮件)
- ccusage + @ccusage/codex (数据采集)

---

## Step 1: 项目脚手架

**目标**：创建 Next.js 项目 + monorepo 结构

```
random-thoughts/
├── apps/
│   └── web/                    # Next.js web app
│       ├── app/
│       │   ├── api/
│       │   │   ├── upload/route.ts
│       │   │   ├── dashboard/route.ts
│       │   │   ├── profile/[username]/route.ts
│       │   │   ├── og/[cardId]/route.ts
│       │   │   └── cron/weekly-email/route.ts
│       │   ├── layout.tsx
│       │   └── page.tsx        # 着陆页（占位）
│       ├── lib/
│       │   ├── supabase/
│       │   │   ├── client.ts   # 浏览器端 Supabase client
│       │   │   ├── server.ts   # 服务端 Supabase client
│       │   │   └── types.ts    # 数据库类型定义
│       │   ├── badges.ts       # 徽章计算逻辑
│       │   └── pricing.ts      # ROI 计算（订阅价 vs API 等价费用）
│       ├── next.config.ts
│       ├── package.json
│       └── vercel.json         # Cron 配置
├── packages/
│   └── cli/                    # CLI npm 包
│       ├── src/
│       │   ├── index.ts        # 入口
│       │   ├── auth.ts         # Device Flow 登录
│       │   ├── collect.ts      # 调用 ccusage/codex
│       │   ├── upload.ts       # POST 到 API
│       │   └── config.ts       # 本地配置管理
│       ├── package.json
│       └── tsconfig.json
├── supabase/
│   └── migrations/
│       └── 001_initial.sql     # 建表 + RLS
├── docs/designs/               # 已有
├── package.json                # workspace root
├── turbo.json                  # Turborepo 配置
└── .env.example
```

**操作**：
1. `npx create-next-app@latest apps/web --ts --app --tailwind --eslint`
2. 初始化 monorepo (pnpm workspace / turborepo)
3. 创建 `packages/cli/` 结构
4. 安装核心依赖：`@supabase/supabase-js`, `resend`, `@vercel/og`

## Step 2: Supabase Schema

**文件**：`supabase/migrations/001_initial.sql`

```sql
-- profiles 表：用户公开信息
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  subscription_plan TEXT DEFAULT 'pro',  -- 'pro' | 'max_5x' | 'max_20x'
  subscription_price NUMERIC(10,2),       -- 月费，用于 ROI 计算
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- daily_usage 表：每日使用聚合
CREATE TABLE daily_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  platform TEXT NOT NULL DEFAULT 'claude',  -- 'claude' | 'codex'
  model TEXT NOT NULL,                       -- 'claude-opus-4-6', 'gpt-5', etc.
  input_tokens BIGINT DEFAULT 0,
  output_tokens BIGINT DEFAULT 0,
  cache_creation_tokens BIGINT DEFAULT 0,
  cache_read_tokens BIGINT DEFAULT 0,
  total_tokens BIGINT DEFAULT 0,
  total_cost NUMERIC(10,6) DEFAULT 0,        -- ccusage 计算的 API 等价费用
  active_hours JSONB DEFAULT '{}',           -- {"0":0,"1":0,...,"23":500} 每小时 token 分布
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date, platform, model)     -- 去重约束
);

-- 索引
CREATE INDEX idx_daily_usage_user_date ON daily_usage(user_id, date DESC);
CREATE INDEX idx_daily_usage_platform ON daily_usage(user_id, platform);

-- RLS 策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

-- profiles: 自己可读写，其他人可读
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- daily_usage: 只有自己可读写
CREATE POLICY "Users can view own usage"
  ON daily_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage"
  ON daily_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用于公开主页的函数（绕过 RLS，只返回聚合数据）
CREATE OR REPLACE FUNCTION get_public_profile_stats(target_username TEXT)
RETURNS JSON AS $$
  SELECT json_build_object(
    'username', p.username,
    'display_name', p.display_name,
    'avatar_url', p.avatar_url,
    'total_tokens', COALESCE(SUM(d.total_tokens), 0),
    'total_cost', COALESCE(SUM(d.total_cost), 0),
    'days_active', COUNT(DISTINCT d.date),
    'platforms_used', array_agg(DISTINCT d.platform),
    'models_used', array_agg(DISTINCT d.model),
    'first_date', MIN(d.date),
    'last_date', MAX(d.date)
  )
  FROM profiles p
  LEFT JOIN daily_usage d ON d.user_id = p.id
  WHERE p.username = target_username
  GROUP BY p.id;
$$ LANGUAGE SQL SECURITY DEFINER;
```

## Step 3: API Routes

### POST /api/upload
接收 CLI 上传的数据，upsert 到 daily_usage。

```
输入 payload:
{
  "platform": "claude",
  "daily": [
    {
      "date": "2026-03-20",
      "modelBreakdowns": [
        {
          "modelName": "claude-opus-4-6",
          "inputTokens": 158,
          "outputTokens": 20336,
          "cacheCreationTokens": 306979,
          "cacheReadTokens": 8104308,
          "cost": 6.48
        }
      ]
    }
  ],
  "activeHours": {
    "2026-03-20": {"7": 5000, "8": 3000, "9": 2000}
  }
}

逻辑:
1. 验证 Bearer token (Supabase auth)
2. 遍历 daily 数组
3. 对每天每模型做 UPSERT (ON CONFLICT 更新)
4. 合并 activeHours
5. 返回 {success: true, inserted: N, updated: M}
```

### GET /api/dashboard
返回当前用户的看板数据。

```
逻辑:
1. 验证 auth
2. 查询 daily_usage WHERE user_id = auth.uid()
3. 聚合:
   - 总 token / 总花费 / 总天数
   - 按模型分布
   - 按平台分布
   - 最近 30 天趋势
   - 热力图数据 (最近 365 天每天总 token)
   - 活跃时间分布 (聚合所有 activeHours)
4. 计算徽章 (调用 badges.ts)
5. 返回聚合数据
```

### GET /api/profile/[username]
返回公开主页数据（不需要登录）。

```
逻辑:
1. 调用 get_public_profile_stats(username) 函数
2. 查询该用户的热力图数据 (每天总 token, 最近 365 天)
3. 计算公开可见的徽章
4. 返回聚合数据 (不返回具体花费金额，只返回 token 数)
```

### GET /api/og/[cardId]
生成 OG 卡片图片。

```
逻辑:
1. cardId 格式: {username}-{period}-{hash}
2. 检查 Supabase Storage 是否有缓存
3. 如果有 → 重定向到缓存 URL
4. 如果没有 → 用 @vercel/og (Satori) 生成图片
5. 上传到 Supabase Storage
6. 返回图片 (Content-Type: image/png)

注意: 这里的图片布局需要等设计审查完成后确定，
     但 API 骨架和缓存逻辑现在就可以写。
```

### POST /api/cron/weekly-email
Vercel Cron 每周触发。

```
vercel.json:
{
  "crons": [{
    "path": "/api/cron/weekly-email",
    "schedule": "0 9 * * 1"   // 每周一 9:00 UTC
  }]
}

逻辑:
1. 验证 CRON_SECRET header
2. 查询所有在过去 7 天有数据的用户
3. 对每个用户:
   a. 聚合上周数据 (总 token, 总花费, 模型分布)
   b. 生成卡片 (调用 /api/og 或直接内部调用)
   c. 用 Resend 发送邮件 (HTML 模板)
4. 返回 {sent: N}
```

## Step 4: CLI 包 (packages/cli)

### 核心文件

**src/index.ts** — 入口 + 命令解析
```
命令:
  npx ai-usage-cli                  # 默认: 上传 Claude 数据
  npx ai-usage-cli --platform codex # 上传 Codex 数据
  npx ai-usage-cli login            # 手动登录
  npx ai-usage-cli status           # 查看当前登录状态
```

**src/auth.ts** — Device Flow 登录
```
流程:
1. POST /api/auth/device-code → 获取 device_code + user_code + verification_url
2. 打印: "请在浏览器中打开 {url} 并输入代码 {code}"
3. 自动 open(url)
4. 轮询 POST /api/auth/token → 直到获取 access_token
5. 存储 token 到 ~/.config/ai-usage/auth.json
```

**src/collect.ts** — 数据采集
```
流程:
1. 检查 ccusage / @ccusage/codex 是否可用
2. 运行: npx ccusage daily --json --since {上次上传日期}
3. 运行: npx ccusage blocks --json --since {上次上传日期}
4. 从 blocks 提取 activeHours (每小时 token 分布)
5. 合并成上传 payload
6. 返回 {daily, activeHours, platform}
```

**src/upload.ts** — 上传数据
```
流程:
1. 读取 auth token
2. POST /api/upload (Bearer token + JSON payload)
3. 处理响应: 成功 / 401 重新登录 / 网络错误
4. 记录上次上传日期到本地配置
```

**src/config.ts** — 本地配置
```
配置文件: ~/.config/ai-usage/config.json
{
  "auth_token": "...",
  "last_upload_date": "2026-03-20",
  "server_url": "https://your-app.vercel.app",
  "default_platform": "claude"
}
```

## Step 5: 徽章计算逻辑

**文件**：`apps/web/lib/badges.ts`

```
输入: daily_usage 记录数组
输出: Badge[] — 已解锁的徽章列表

徽章类型:
- First Blood: daily_usage 记录数 >= 1
- Token Whale: 累计 total_tokens >= 1,000,000
- Penny Wise: 任意单周 ROI >= 5x
- Night Owl: 凌晨 0-5 点 activeHours 累计 >= 10 个活跃小时
- Polyglot: 使用过 >= 3 种不同模型
- Streak Master: 连续 7 天有记录
- Sharing is Caring: (需要 cards 表或标记，暂不实现)

每个徽章: { type, name, description, earnedAt, icon }
```

## Step 6: 邮件服务

**依赖**：`resend`
**文件**：`apps/web/lib/email.ts`

```
功能:
- sendWeeklyDigest(user, stats) → 用 Resend 发送 HTML 邮件
- 邮件内容: 上周统计摘要 + 卡片预览链接

注意: 邮件 HTML 模板的具体样式等设计审查后确定，
     但发送逻辑和 Resend 集成现在就可以写。
```

## Step 7: 环境变量

```env
# .env.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=
```

---

## 可并行执行的任务

```
  ┌─ Agent 1: 项目脚手架 + Supabase Schema (Step 1 + 2)
  │           输出: 可运行的 Next.js 项目 + 数据库表
  │
  ├─ Agent 2: API Routes (Step 3)
  │           依赖 Step 2 的类型定义
  │           输出: 5 个 API 端点
  │
  ├─ Agent 3: CLI 包 (Step 4)
  │           独立于 web app
  │           输出: 可 npx 运行的 CLI 工具
  │
  └─ Agent 4: 徽章逻辑 + 邮件服务 (Step 5 + 6)
              纯逻辑，无 UI 依赖
              输出: badges.ts + email.ts
```

**依赖关系**：Step 1 + 2 先做（地基），Step 3/4/5+6 可并行。

## 验证方式

1. **Schema**: 在 Supabase Dashboard 确认表结构和 RLS
2. **API /upload**: 用 curl 手动 POST 测试数据
3. **API /dashboard**: 登录后访问，确认返回聚合数据
4. **CLI**: `npx ai-usage-cli` 实际运行，确认数据出现在看板
5. **徽章**: 上传足够数据后确认徽章正确计算
6. **邮件**: 手动触发 cron 端点，确认收到邮件
