# AI Key Vault

## What This Is

这是一个给自己长期使用的 AI API Key 管理工具。当前版本已经能在浏览器里整理多组渠道配置、做连通性测试、识别模型、跑简单测速，并通过同源后端转发请求来兼容 CORS。  
本次迭代的目标不是重做产品，而是在保留现有使用方式的前提下，把“只保存在浏览器本地”的状态升级成可部署到 Cloudflare、数据落到 D1、并通过环境变量控制访问密码的可持续版本。

## Core Value

无论部署到哪里，用户都能用一个轻量、可自托管、可持续保存的方式管理自己的 AI Key 配置，并继续完成测试、识别和测速。

## Requirements

### Validated

- ✓ 本地保存多组配置，并兼容旧版本地数据
- ✓ 支持导入解析、批量新增、复制、导出
- ✓ 支持连通性测试、模型识别、性能评测
- ✓ 通过同源后端代理访问 OpenAI 兼容接口，绕开常见 CORS 问题
- ✓ 支持 CC Switch 深链导入导出

### Active

- [ ] 把配置数据从浏览器本地迁移为以 D1 为主的持久化存储
- [ ] 部署到 Cloudflare Workers，并保留现有 Next.js 交互体验
- [ ] 为整站增加访问密码，密码通过 Cloudflare 环境变量或 Secret 配置
- [ ] 保留现有核心功能，不因迁移而退化
- [ ] 补齐部署、初始化数据库、配置环境变量的文档

### Out of Scope

- 多用户系统或注册登录体系 — 当前需求只提到“访问密码”，没有要求用户账户
- 角色权限、团队协作、分享链接 — 不是当前最小可交付范围
- 加密托管用户上游 API Key 之外的复杂密钥体系 — 当前先完成可用部署和受控访问
- 离线优先与本地优先双写架构 — 现阶段先收敛到服务端主存储，避免复杂度失控

## Context

- 当前代码是 Next.js 16 + React 19 单页应用，主界面集中在 `app/page.tsx`
- 配置数据现在保存在浏览器 `localStorage`
- 后端已有 `/api/openai/test`、`/api/openai/probe`、`/api/openai/benchmark` 三个接口，核心代理逻辑集中在 `lib/openai-proxy.ts`
- 当前没有数据库、没有环境变量、没有应用级访问控制
- 现有代码图谱已存在，关键风险包括：本地明文存储、服务端无访问保护、页面与代理文件过大、前后端工具函数重复
- 根据 Cloudflare 官方文档，现有 Next.js 项目可以通过 OpenNext adapter 部署到 Workers，D1 可作为 Worker 绑定使用，敏感访问密码应通过 Secret 而不是普通明文变量配置

## Constraints

- **Tech stack**: 保持现有 Next.js 项目为基础继续演进 — 避免无必要重写，符合 KISS / YAGNI
- **Hosting**: 目标平台固定为 Cloudflare Workers + D1 — 这是本次改造的明确目标
- **Security**: 访问密码必须来自环境配置，不得写死在仓库 — 避免泄露
- **Scope**: 本次只做单密码访问保护，不默认扩展到完整账号系统 — 控制范围
- **Continuity**: 连通性测试、模型识别、测速、导入导出不能因存储迁移而消失 — 保持现有价值
- **Docs**: 代码改造必须同步 README / 部署说明 / 初始化说明 — 文档不能落后于实现

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 继续沿用现有 Next.js 应用，而不是迁移到新框架 | 当前产品已可用，主要问题在持久化和部署，不在框架本身 | ✓ Good |
| 以 D1 作为配置主存储 | 用户明确要求 Cloudflare + D1，且 D1 适合这类轻量结构化数据 | — Pending |
| 访问控制采用单个全局访问密码 | 符合当前需求，复杂度最低，能先保护公开部署入口 | — Pending |
| 优先把本地存储改为“首次导入/迁移来源”，不继续作为唯一真相源 | 避免双向同步复杂度，降低出错面 | — Pending |
| 先做最小权限入口保护，再评估是否需要细粒度限流或审计 | 当前目标是尽快把公开可滥用状态收口 | — Pending |

## Completion Checklist

- [ ] Cloudflare 部署链路明确，仓库具备本地预览与部署配置
- [ ] D1 表结构、初始化方式、数据读写路径明确
- [ ] 整站访问密码路径明确，包括未登录时的拦截行为
- [ ] 现有核心功能都映射到新架构，没有遗漏
- [ ] README 和部署说明覆盖本地开发、建库、设密码、上线步骤

## Evolution

每完成一个阶段后都要回看本文件：

1. 已验证的新能力移入 `Validated`
2. 已放弃或延期的项移入 `Out of Scope`
3. 新出现的约束或关键决定追加到对应章节
4. 如果产品定位发生变化，更新 `What This Is`

---
*Last updated: 2026-04-08 after brownfield initialization for Cloudflare + D1 migration*
