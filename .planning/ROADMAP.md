# Roadmap: AI Key Vault

**Project:** `.planning/PROJECT.md`  
**Requirements:** `.planning/REQUIREMENTS.md`  
**Created:** 2026-04-08

## Strategy

这次路线图只解决当前明确要做的三件事：部署到 Cloudflare、数据改存 D1、加访问密码。  
不顺手扩展用户系统，不提前引入多租户，不做与目标无关的大重构。先把能上线、能保存、能拦住未授权访问的版本做出来，再考虑下一轮安全加固。

## Phase 1: Cloudflare Foundation

**Goal:** 让现有 Next.js 项目可以在 Cloudflare Workers 运行，并拿到 D1 与密码配置入口。

**Covers:** AUTH-02, DATA-01, DATA-02, CF-01, CF-02

### Plan 1.1: 接入 Cloudflare Next.js 运行基础

- 引入 Cloudflare 当前推荐的 Next.js 适配方案
- 补齐 `wrangler`、OpenNext、预览与部署脚本
- 生成或补齐 Worker 环境类型

### Plan 1.2: 建立 D1 数据模型与迁移方式

- 定义配置主表与必要索引
- 明确哪些原本只在本地的数据需要落库，哪些可以继续作为临时前端状态
- 建立本地开发与线上一致的建库/迁移方式

### Plan 1.3: 接入访问密码配置

- 定义密码 Secret 名称与读取方式
- 明确本地开发、预览、生产三种环境的配置方式
- 约定未配置密码时的失败行为，避免误开放

**Exit Criteria**

- `npm run preview` 能在接近 Cloudflare 运行环境下跑起来
- Worker 可读取 D1 绑定与密码配置
- D1 表结构和初始化命令已明确

## Phase 2: Access Gate

**Goal:** 让整站和现有 API 在未验证密码时不可用。

**Covers:** AUTH-01, AUTH-03, AUTH-04

### Plan 2.1: 实现密码入口与会话保持

- 增加最小化密码进入页
- 校验环境密码并建立会话
- 刷新后维持已进入状态

### Plan 2.2: 统一保护页面与 API

- 页面入口和现有 `/api/openai/*` 统一走同一套校验
- 明确未授权时的返回形式
- 避免仅前端拦截、后端仍可裸调

**Exit Criteria**

- 未输入密码时不能进入主页面
- 直接请求 API 会被拦住
- 已验证后能继续正常使用原功能

## Phase 3: D1 Data Migration

**Goal:** 把现有配置管理从浏览器本地主存储迁移为 D1 主存储，并尽量保留当前体验。

**Covers:** DATA-03, DATA-04, DATA-05, FEAT-01, FEAT-02, FEAT-03, FEAT-04, FEAT-05, FEAT-06

### Plan 3.1: 服务端数据接口

- 提供配置的读取、创建、更新、删除接口
- 复用必要的数据清洗逻辑，减少前后端重复
- 让现有测试、识别、测速结果能按需要写回或读取

### Plan 3.2: 前端存储切换

- 把页面启动加载从 `localStorage` 改为服务端数据
- 保留旧数据导入能力，作为升级迁移入口
- 明确哪些仅是界面临时状态，避免无意义入库

### Plan 3.3: 功能回归与整理

- 确认新增、编辑、导出、测试、识别、测速、深链功能在新存储下仍成立
- 借这次迁移抽掉最明显的重复逻辑，但不做超范围重构

**Exit Criteria**

- 新增或修改后的配置刷新后仍存在
- 旧本地数据能迁入 D1
- 核心功能全部可回归通过

## Phase 4: Documentation And Launch Readiness

**Goal:** 让别人按文档就能本地跑、建库、设密码、预览并上线。

**Covers:** CF-03, DOC-01, DOC-02, DOC-03

### Plan 4.1: 同步项目文档

- 更新 README 中的数据存储描述
- 补齐 Cloudflare、D1、密码配置步骤
- 写清本地开发与生产的差异

### Plan 4.2: 上线前验证

- 用 Cloudflare 预览链路验证页面与 API
- 检查数据库初始化、密码保护、核心功能路径
- 输出已验证项与剩余风险

**Exit Criteria**

- 新人按文档可完成本地预览与部署
- 功能验证结果清楚，剩余风险有记录

## Dependencies

- Phase 2 depends on Phase 1
- Phase 3 depends on Phase 1 and Phase 2
- Phase 4 depends on Phase 3

## Risks To Watch

- 现有 `app/page.tsx` 和 `lib/openai-proxy.ts` 体积较大，迁移时容易把改动揉在一起
- 当前 API 接口无应用级保护，若先上线再加密码会暴露滥用风险
- 本地旧数据迁移策略如果定义不清，容易造成“刷新后数据丢失”的体验问题
- 把所有检测结果都落库可能会扩大范围，需要优先识别真正需要持久化的字段

## Done Definition

- Cloudflare 可预览、可部署
- D1 成为主存储
- 整站访问受密码保护
- 现有核心能力可用
- 文档与实现一致

---
*Last updated: 2026-04-08 after initial roadmap generation*
