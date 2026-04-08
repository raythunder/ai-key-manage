# Tech Stack Map

## Scope

本文件基于以下实际文件整理：`/var/folders/mh/720lmkqj2vv1jxlvyxzw3c3h0000gn/T/vibe-kanban/worktrees/cc21-gsd-map-codebase/ai-key-manage/package.json`、`/var/folders/mh/720lmkqj2vv1jxlvyxzw3c3h0000gn/T/vibe-kanban/worktrees/cc21-gsd-map-codebase/ai-key-manage/README.md`、`/var/folders/mh/720lmkqj2vv1jxlvyxzw3c3h0000gn/T/vibe-kanban/worktrees/cc21-gsd-map-codebase/ai-key-manage/next.config.ts`、`/var/folders/mh/720lmkqj2vv1jxlvyxzw3c3h0000gn/T/vibe-kanban/worktrees/cc21-gsd-map-codebase/ai-key-manage/tsconfig.json`、`/var/folders/mh/720lmkqj2vv1jxlvyxzw3c3h0000gn/T/vibe-kanban/worktrees/cc21-gsd-map-codebase/ai-key-manage/eslint.config.mjs`、`/var/folders/mh/720lmkqj2vv1jxlvyxzw3c3h0000gn/T/vibe-kanban/worktrees/cc21-gsd-map-codebase/ai-key-manage/app/api/openai/probe/route.ts`、`/var/folders/mh/720lmkqj2vv1jxlvyxzw3c3h0000gn/T/vibe-kanban/worktrees/cc21-gsd-map-codebase/ai-key-manage/app/api/openai/test/route.ts`、`/var/folders/mh/720lmkqj2vv1jxlvyxzw3c3h0000gn/T/vibe-kanban/worktrees/cc21-gsd-map-codebase/ai-key-manage/app/api/openai/benchmark/route.ts`、`/var/folders/mh/720lmkqj2vv1jxlvyxzw3c3h0000gn/T/vibe-kanban/worktrees/cc21-gsd-map-codebase/ai-key-manage/lib/openai-proxy.ts`、`/var/folders/mh/720lmkqj2vv1jxlvyxzw3c3h0000gn/T/vibe-kanban/worktrees/cc21-gsd-map-codebase/ai-key-manage/lib/openai-proxy-types.ts`，并补充核对了 `app/page.tsx` 中与本地存储、同源接口、深链相关的片段。

## 语言与运行时

- 语言：TypeScript，见 `package.json`、`tsconfig.json`。
- 前端运行时：React 19，见 `package.json`。
- 全栈框架：Next.js 16 App Router，见 `package.json`、`app/api/openai/*/route.ts`。
- 后端接口运行时：Node.js，三个 API 路由都声明 `export const runtime = "nodejs"`，见 `app/api/openai/probe/route.ts`、`app/api/openai/test/route.ts`、`app/api/openai/benchmark/route.ts`。
- 网络调用基础：当前读到的服务端代理逻辑使用原生 `fetch`、`AbortController`、`ReadableStream` 读取 SSE；未在已读代码中使用 `openai` SDK 发请求，见 `lib/openai-proxy.ts`。

## 框架与 UI

- UI 框架：React 19 + Next.js 16，见 `package.json`。
- 样式方案：Tailwind CSS 4 + `@tailwindcss/postcss`，见 `package.json`。
- 图表库：`echarts` 与 `echarts-for-react`，见 `package.json`；README 也说明性能评测图表能力。
- 图标库：`react-icons`，见 `package.json`。

## 关键依赖

- `next@16.1.6`：应用框架，见 `package.json`。
- `react@19.2.3`、`react-dom@19.2.3`：前端渲染层，见 `package.json`。
- `typescript@^5`：类型系统与构建校验，见 `package.json`、`tsconfig.json`。
- `eslint@^9`、`eslint-config-next@16.1.6`：代码检查，见 `package.json`、`eslint.config.mjs`。
- `tailwindcss@^4.1.16`、`@tailwindcss/postcss@^4.1.16`：样式基础设施，见 `package.json`。
- `echarts@^6.0.0`、`echarts-for-react@^3.0.6`：评测可视化，见 `package.json`。
- `openai@^6.31.0`：已声明依赖，见 `package.json`；在本次要求阅读的 `app/api/**` 与 `lib/**` 中未发现直接 import 或实例化。

## 配置方式

- 启动脚本：`dev`、`build`、`start`、`lint`，见 `package.json`。
- Next 配置：在 `next.config.ts` 里仅配置 `turbopack.root` 指向项目根目录；未发现自定义 `env`、`headers`、`rewrites`、`images`、`experimental` 等额外平台配置。
- TypeScript 配置：`strict: true`、`moduleResolution: "bundler"`、路径别名 `@/* -> ./*`、`noEmit: true`，见 `tsconfig.json`。
- ESLint 配置：启用 `eslint-config-next/core-web-vitals` 与 `eslint-config-next/typescript`，并显式忽略 `.next/**`、`out/**`、`build/**`、`next-env.d.ts`，见 `eslint.config.mjs`。

## 数据与状态存储

- 持久化方式：浏览器 `localStorage`，见 `README.md` 与 `app/page.tsx`。
- 服务端数据库：未发现。
- ORM / 查询层：未发现。
- 缓存系统：未发现独立缓存服务。

## 服务端接口概览

- `POST /api/openai/test` -> `app/api/openai/test/route.ts`
  - 入参：`baseUrl`、`apiKey`、`model`
  - 调用：`runOpenAITest`
- `POST /api/openai/probe` -> `app/api/openai/probe/route.ts`
  - 入参：`baseUrl`、`apiKey`、`currentModel`
  - 调用：`runOpenAIProbe`
- `POST /api/openai/benchmark` -> `app/api/openai/benchmark/route.ts`
  - 入参：`baseUrl`、`apiKey`、`model`
  - 调用：`runOpenAIBenchmarkRound`

## OpenAI 兼容代理实现

- 统一实现文件：`/var/folders/mh/720lmkqj2vv1jxlvyxzw3c3h0000gn/T/vibe-kanban/worktrees/cc21-gsd-map-codebase/ai-key-manage/lib/openai-proxy.ts`
- 类型定义文件：`/var/folders/mh/720lmkqj2vv1jxlvyxzw3c3h0000gn/T/vibe-kanban/worktrees/cc21-gsd-map-codebase/ai-key-manage/lib/openai-proxy-types.ts`
- 关键行为：
  - 规范化上游地址，自动补全协议并收敛到 `/v1`，见 `lib/openai-proxy.ts`
  - 清洗 `Bearer ` 前缀，见 `lib/openai-proxy.ts`
  - 通过 `/chat/completions`、`/responses`、`/models` 与流式 SSE 做兼容探测，见 `lib/openai-proxy.ts`
  - 通过超时控制与错误整理返回中文结果，见 `lib/openai-proxy.ts`

## 认证与安全边界

- 上游认证方式：Bearer API Key，请求头 `Authorization: Bearer ${apiKey}`，见 `lib/openai-proxy.ts`。
- 应用自身登录认证：未发现。
- 会话管理：未发现。
- 服务端密钥托管：未发现；README 明确说明配置默认保存在浏览器本地，不接数据库。

## 环境变量

- 在已读配置文件、`app/api/**`、`lib/**` 与全仓关键词扫描中，未发现 `process.env` 使用。
- `.env` 文件：未发现。

## 部署与平台

- 本地开发：`npm install` + `npm run dev`，见 `README.md`。
- 生产启动：`npm run build` + `npm run start`，见 `README.md`。
- 部署目标：README 提到可部署到支持 Next.js 的平台，如 Vercel、Netlify；仓库内未发现平台专用配置文件。

## 未发现项

- 数据库
- webhook
- 队列
- 定时任务
- 对象存储
- 第三方认证 SDK
- 支付集成
