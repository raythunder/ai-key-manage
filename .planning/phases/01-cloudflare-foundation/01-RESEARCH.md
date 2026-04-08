# Phase 01 Research: Cloudflare Foundation

**Phase:** 01 - Cloudflare Foundation  
**Date:** 2026-04-08  
**Status:** Complete

## Goal

回答这个阶段真正需要搞清楚的三件事：

1. 现有 Next.js 项目怎样以 Cloudflare 当前官方方式运行起来
2. D1 基础要怎样接，才能为后续数据迁移留出最小但稳定的落点
3. 访问密码应该怎样通过 Secret 落地，且不把完整拦截逻辑提前做到本阶段

## Current Codebase Reality

- 当前项目是 Next.js 16 + React 19 单页应用
- 现有生产脚本仍是传统 `next build` / `next start`
- 仓库里还没有 `wrangler.jsonc`、`open-next.config.ts`、D1 schema、Cloudflare env 类型文件
- 当前配置数据仍在浏览器 `localStorage`
- 服务端已有三个 Node runtime route handlers:
  - `app/api/openai/test/route.ts`
  - `app/api/openai/probe/route.ts`
  - `app/api/openai/benchmark/route.ts`
- `proxy.ts` 目前只处理 service worker 清理与少量兼容转发，不承担认证或平台绑定职责

## Official Cloudflare Guidance Confirmed

基于 Cloudflare 2026-04-08 仍可读到的官方文档，当前推荐方式如下：

### 1. Next.js on Workers

- 现有 Next.js 项目部署到 Workers 的官方方向是 `@opennextjs/cloudflare`
- Cloudflare 文档明确给出现有项目的手动配置方式：
  - 安装 `@opennextjs/cloudflare`
  - 安装 `wrangler`
  - 新增 `wrangler.jsonc`
  - 新增 `open-next.config.ts`
  - 增加 `preview` / `deploy` / `cf-typegen` 脚本
- `wrangler.jsonc` 关键项：
  - `main: ".open-next/worker.js"`
  - `assets.directory: ".open-next/assets"`
  - `compatibility_flags: ["nodejs_compat"]`
  - `compatibility_date` 需在 `2024-09-23` 之后，建议直接用当前日期

### 2. D1

- D1 通过 `wrangler.jsonc` 的 `d1_databases` 绑定接入
- 本地初始化可用 `wrangler d1 execute <db> --local --file=...`
- 远程初始化可用 `wrangler d1 execute <db> --remote --file=...`
- Worker 侧推荐通过绑定对象查询，而不是走 Cloudflare REST API
- D1 是 SQLite 语义，适合本项目这种单用户、小体量、结构清晰的数据模型

### 3. Secret / Local Development

- 敏感值不应放在 `vars`
- 访问密码应使用 Secret
- 本地开发用 `.dev.vars` 或 `.env`，且不应提交进 Git
- 开启 `nodejs_compat` 后，环境变量也可通过 `process.env` 访问，但在 Cloudflare 语境下，明确的运行时 helper 会更稳妥

## Planning Implications

## Deployment Foundation

- 不需要改框架，也不需要重做目录结构
- 需要的最小平台接入文件只有：
  - `package.json`
  - `open-next.config.ts`
  - `wrangler.jsonc`
  - `cloudflare-env.d.ts`（由命令生成）
- `next.config.ts` 只应做最小修正，不能顺手变成平台实验场

## D1 Modeling Recommendation

当前 `app/page.tsx` 的 `KeyConfig` 结构里包含：

- 基础字段：`id`、`name`、`baseUrl`、`apiKey`、`model`、`createdAt`
- 扩展结果：`sourceMeta`、`probe`、`lastTest`、`benchmarks`

为了避免在 Phase 1 过度设计，D1 首版建议：

- 基础列单独存：
  - `id`
  - `name`
  - `base_url`
  - `api_key`
  - `model`
  - `created_at`
- 嵌套检测结果用 JSON TEXT 列暂存：
  - `source_meta_json`
  - `probe_json`
  - `last_test_json`
  - `benchmarks_json`

这样做的好处：

- 符合 KISS：先保留现有对象结构，不把 Phase 1 变成数据建模大重构
- 符合 YAGNI：当前没有复杂查询需求，不需要现在就拆成多张关联表
- 符合 DRY：后续 Phase 3 做迁移时，不必为嵌套结构额外造一层映射系统

## Password Integration Recommendation

本阶段不做完整访问控制，只做“密码配置入口可读取”：

- 建议新增统一的运行时配置 helper
- helper 暴露：
  - `getAccessPassword()`
  - `getDatabaseBinding()`
  - `getBootstrapStatus()`
- 再增加一个轻量内部路由用于预览阶段确认：
  - Worker 能读到 D1 绑定
  - Worker 能读到访问密码 Secret

这样可以在不改动现有业务主流的情况下，完成 Phase 1 的退出条件验证。

## File-Level Impact Forecast

最可能需要修改或新增的文件：

### Platform config
- `package.json`
- `next.config.ts`
- `open-next.config.ts` 新增
- `wrangler.jsonc` 新增
- `cloudflare-env.d.ts` 生成文件

### Runtime config surface
- `lib/server/runtime-config.ts` 新增
- `app/api/system/bootstrap/route.ts` 新增

### D1 bootstrap
- `db/d1/001_initial.sql` 新增
- `.dev.vars.example` 新增
- `.gitignore` 可能补充 `.dev.vars*`

## Risks And Guardrails

### Risk 1: 平台接入和业务改造混在一起

如果同时改平台、认证、数据迁移，很容易失控。  
**Guardrail:** Phase 1 只补平台基础，不动主业务流。

### Risk 2: 把 D1 设计成“未来完美模型”

这会把本阶段拖进无止境的表设计。  
**Guardrail:** 先用基础列 + JSON TEXT 承接现有结构。

### Risk 3: Secret 读取路径提前跟完整认证耦合

如果现在就把访问控制写死到每条业务路径，会和 Phase 2 重叠。  
**Guardrail:** 本阶段只建立统一读取入口和可验证状态面。

### Risk 4: 本地验证只跑 `next dev`

这不足以证明 Cloudflare 运行时真的可用。  
**Guardrail:** 后续执行必须引入 `preview` 流程，并至少验证一次接近 Workers 运行环境的启动。

## Recommended Phase Split

### Plan 01
先补 Next.js → Workers 的构建与命令基础。

### Plan 02
再补 `wrangler` 绑定、运行时读取 helper、基础状态面。

### Plan 03
最后补 D1 首版 schema 与本地 Secret 约定，让后续 Phase 3 能直接接上。

## Validation Architecture

### Existing Checks

- 当前仓库已有：
  - `npm run lint`
  - `npm run build`
- 当前没有测试框架与自动化用例

### Recommended Phase Validation

- Quick check:
  - `npm run lint`
- Full check:
  - `npm run lint`
  - `npm run build`
  - `npm run cf-typegen`
  - 在必要用户配置完成后执行 `npm run preview`

### Manual Verification Needed

- Cloudflare preview 启动成功
- D1 绑定存在
- 访问密码 Secret 可被 Worker 读取

## Sources Used

- Cloudflare Next.js docs: `https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/index.md`
- Cloudflare environment variables docs: `https://developers.cloudflare.com/workers/configuration/environment-variables/index.md`
- Cloudflare D1 getting started docs: `https://developers.cloudflare.com/d1/get-started/index.md`

## Research Outcome

Phase 1 可以收敛成一个非常明确的最小交付：

- 不重写应用
- 接入 OpenNext + Wrangler
- 建立 D1 binding 和首版 schema
- 建立 Secret 读取入口
- 提供一个可验证的平台就绪状态面

这足以支撑后续两件事：

1. Phase 2 真正做访问密码拦截
2. Phase 3 把浏览器本地数据迁到 D1

---
*Research complete: 2026-04-08*
