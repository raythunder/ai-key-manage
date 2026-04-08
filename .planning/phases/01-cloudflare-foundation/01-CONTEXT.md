# Phase 1: Cloudflare Foundation - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

这一阶段只负责把现有 Next.js 项目接到 Cloudflare Workers 的运行方式上，补齐 D1 绑定、建库方式和访问密码配置入口。  
它不实现真正的密码拦截页面，也不把前端存储正式迁移到 D1；这些分别留给后续阶段。

</domain>

<decisions>
## Implementation Decisions

### 部署方式
- **D-01:** 继续沿用现有 Next.js 项目，不更换框架，也不拆成独立前后端。
- **D-02:** Cloudflare 部署采用官方推荐的 Next.js + OpenNext adapter 方案，而不是自写 Worker 壳层。
- **D-03:** 项目配置使用 `wrangler.jsonc`，并补齐本地预览、部署和类型生成脚本。

### D1 基础
- **D-04:** D1 作为后续配置数据的主存储基础，本阶段先完成数据库绑定、初始化 SQL 和本地/远程执行方式。
- **D-05:** D1 的首版表结构以当前配置对象为中心，至少覆盖名称、地址、Key、默认模型、创建时间，以及后续迁移需要保留的检测结果字段。
- **D-06:** 本阶段只定义和验证数据库基础，不在这一阶段完成浏览器本地数据迁移。

### 访问密码配置
- **D-07:** 访问密码使用 Cloudflare Secret，而不是写进仓库或普通明文配置。
- **D-08:** 本地开发也按 Secret 思路处理，使用未提交到仓库的本地变量文件。
- **D-09:** 本阶段只打通密码读取和配置约定，不在这一阶段实现完整的访问拦截流程。

### 兼容与范围控制
- **D-10:** 现有 `/api/openai/test`、`/api/openai/probe`、`/api/openai/benchmark` 路由结构保留，不在这一阶段改业务行为。
- **D-11:** 现有 UI 主体和交互流程保留，Phase 1 不做大规模页面拆分或视觉改版。
- **D-12:** 若 Cloudflare 运行环境与现有 Node.js 用法存在冲突，优先做最小兼容修正，不顺手扩成重构项目。

### the agent's Discretion
- Secret 变量的具体命名
- D1 表名、索引名、SQL 文件拆分方式
- Worker 环境类型文件的具体命名与生成位置
- 是否在本阶段顺手抽出少量共享工具函数，只要不扩大范围

</decisions>

<specifics>
## Specific Ideas

- 目标是“现在这个工具能部署到 Cloudflare，数据以后能放进 D1，并通过环境变量设置访问密码”。
- 当前优先级是把基础打通，不是把产品重做一遍。
- 后续正式迁移数据时，要尽量延续当前配置对象结构，避免让已有能力断掉。

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 项目范围与要求
- `.planning/PROJECT.md` — 本项目的目标、边界、约束和关键决定
- `.planning/REQUIREMENTS.md` — 本阶段对应的 requirement IDs 和完成标准
- `.planning/ROADMAP.md` — Phase 1 的阶段目标、退出条件和后续依赖
- `.planning/STATE.md` — 当前阶段定位和已知未决点

### 当前实现现状
- `README.md` — 当前产品能力、现有本地存储说明和部署描述
- `app/page.tsx` — 当前配置对象结构、本地存储使用方式、主界面耦合点
- `app/api/openai/test/route.ts` — 现有测试接口入口
- `app/api/openai/probe/route.ts` — 现有模型识别接口入口
- `app/api/openai/benchmark/route.ts` — 现有测速接口入口
- `lib/openai-proxy.ts` — 现有代理逻辑和运行时依赖
- `lib/openai-proxy-types.ts` — 当前接口数据结构
- `next.config.ts` — 当前 Next.js 配置基线
- `proxy.ts` — 当前请求拦截入口和可复用入口点

### 代码图谱
- `.planning/codebase/STACK.md` — 技术栈现状
- `.planning/codebase/INTEGRATIONS.md` — 当前外部集成与边界
- `.planning/codebase/CONCERNS.md` — 已识别的风险与技术债

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/page.tsx` 里的 `KeyConfig` 及相关结果结构：可作为 D1 首版数据模型的直接参考
- `lib/openai-proxy.ts`：现有测试、识别、测速能力已经集中在这里，Phase 1 不需要重写
- `proxy.ts`：当前已有请求入口文件，后续 Phase 2 做访问拦截时可作为优先检查点

### Established Patterns
- 当前是单页客户端主控 + 同源 API 路由转发的结构
- 当前配置数据全部来自浏览器本地存储，服务端还没有持久化层
- 当前没有环境变量和数据库绑定，意味着 Cloudflare 基础设施要从零补起

### Integration Points
- Cloudflare 配置会接在项目根目录配置层，而不是改动大量业务代码
- D1 首次接入优先影响服务端配置和未来数据接口，不应该先动前端主流程
- 密码 Secret 的读取路径需要兼容后续 Phase 2 的实际访问控制实现

</code_context>

<deferred>
## Deferred Ideas

- 完整的密码验证页面和会话保持 — Phase 2
- 浏览器本地数据导入到 D1 的正式迁移流程 — Phase 3
- 多用户、分权限、团队协作 — 超出当前里程碑范围
- 服务端输入边界加固与限流 — 作为后续安全加固项处理

</deferred>

---

*Phase: 01-cloudflare-foundation*
*Context gathered: 2026-04-08*
