# Integration Map

## Scope

本文件仅记录在仓库中能直接证实的外部集成与技术边界，依据文件包括：`/var/folders/mh/720lmkqj2vv1jxlvyxzw3c3h0000gn/T/vibe-kanban/worktrees/cc21-gsd-map-codebase/ai-key-manage/README.md`、`/var/folders/mh/720lmkqj2vv1jxlvyxzw3c3h0000gn/T/vibe-kanban/worktrees/cc21-gsd-map-codebase/ai-key-manage/app/api/openai/probe/route.ts`、`/var/folders/mh/720lmkqj2vv1jxlvyxzw3c3h0000gn/T/vibe-kanban/worktrees/cc21-gsd-map-codebase/ai-key-manage/app/api/openai/test/route.ts`、`/var/folders/mh/720lmkqj2vv1jxlvyxzw3c3h0000gn/T/vibe-kanban/worktrees/cc21-gsd-map-codebase/ai-key-manage/app/api/openai/benchmark/route.ts`、`/var/folders/mh/720lmkqj2vv1jxlvyxzw3c3h0000gn/T/vibe-kanban/worktrees/cc21-gsd-map-codebase/ai-key-manage/lib/openai-proxy.ts`、`/var/folders/mh/720lmkqj2vv1jxlvyxzw3c3h0000gn/T/vibe-kanban/worktrees/cc21-gsd-map-codebase/ai-key-manage/lib/openai-proxy-types.ts`，并补充核对 `app/page.tsx` 中的相关调用点。

## 外部 API

### OpenAI 兼容上游

- 集成类型：用户提供 `baseUrl` + `apiKey` 的 OpenAI 兼容接口。
- 代理实现：`/var/folders/mh/720lmkqj2vv1jxlvyxzw3c3h0000gn/T/vibe-kanban/worktrees/cc21-gsd-map-codebase/ai-key-manage/lib/openai-proxy.ts`
- 同源入口：
  - `POST /api/openai/test` -> `app/api/openai/test/route.ts`
  - `POST /api/openai/probe` -> `app/api/openai/probe/route.ts`
  - `POST /api/openai/benchmark` -> `app/api/openai/benchmark/route.ts`
- 实际调用的上游端点：
  - ``${baseUrl}/chat/completions``
  - ``${baseUrl}/responses``
  - ``${baseUrl}/models``
- 请求认证：
  - `Authorization: Bearer ${apiKey}`，见 `lib/openai-proxy.ts`
- 地址处理：
  - 自动补协议
  - 去掉末尾斜杠
  - 若不是 `/vN` 结尾则补 `/v1`
  - 会剥离误传的 `/chat/completions`、`/responses`、`/completions` 后缀

## 前后端调用关系

- 页面通过同源接口访问代理层，调用点在 `app/page.tsx`：
  - `"/api/openai/test"`
  - `"/api/openai/probe"`
  - `"/api/openai/benchmark"`
- README 说明这样做是为了解决浏览器直连上游常见的 CORS 问题，见 `README.md`。

## 本地存储

- 存储介质：浏览器 `localStorage`
- 已确认用途：
  - 保存配置列表，见 `app/page.tsx`
  - 记录介绍区是否已看过，见 `app/page.tsx`
- README 说明：
  - 默认不接数据库
  - 不帮用户托管 Key

## 深链与第三方应用联动

### CC Switch

- 集成类型：通过 `ccswitch://v1/import?...` 深链导入配置
- 深链生成：`app/page.tsx` 中的 `buildCcSwitchDeepLink`
- 深链解析：`app/page.tsx` 中的 `parseCcSwitchDeepLink`
- 已在 README 声明适配的目标 App：
  - `Claude`
  - `Codex`
  - `Gemini`
  - `OpenCode`
  - `OpenClaw`
- 深链参数中已确认使用：
  - `resource=provider`
  - `app`
  - `name`
  - `endpoint`
  - `apiKey`
  - `model`
  - `homepage`
  - `enabled=false`

## 认证

- 上游接口认证：Bearer API Key，见 `lib/openai-proxy.ts`
- 应用自身账号登录：未发现
- OAuth / SSO：未发现
- Cookie 会话认证：未发现

## 环境变量

- `process.env`：未发现
- `.env` / `.env.local`：未发现
- 运行时必填环境变量：未发现

## 数据库与持久层

- 数据库：未发现
- ORM：未发现
- 外部 KV / Cache：未发现
- 文件存储 / 对象存储：未发现

## Webhook 与异步系统

- webhook 接收端：未发现
- webhook 出站调用：未发现
- 消息队列：未发现
- 定时任务：未发现

## 第三方服务

- 图表渲染：`echarts` / `echarts-for-react` 属于前端依赖，不是独立在线服务，见 `package.json`
- OpenAI SDK：`openai` 已在 `package.json` 声明，但在本次核对范围内未发现实际接线代码
- 平台服务专用 SDK（如 Supabase、Firebase、Auth0、Stripe、Sentry）：未发现

## 风险与边界说明

- API Key 会通过应用自己的同源后端接口转发到用户填写的上游地址，见 `README.md` 与 `lib/openai-proxy.ts`
- 当前未发现服务端数据库或环境变量托管，因此配置主要保存在浏览器本地，见 `README.md` 与 `app/page.tsx`
