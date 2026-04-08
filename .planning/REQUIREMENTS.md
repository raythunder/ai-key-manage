# Requirements: AI Key Vault

**Defined:** 2026-04-08  
**Core Value:** 无论部署到哪里，用户都能用一个轻量、可自托管、可持续保存的方式管理自己的 AI Key 配置，并继续完成测试、识别和测速。

## v1 Requirements

### Access Control

- [ ] **AUTH-01**: 未输入正确访问密码前，用户不能进入主应用界面
- [ ] **AUTH-02**: 访问密码来自 Cloudflare Secret 或环境配置，仓库中不保存明文密码
- [ ] **AUTH-03**: 通过密码验证后，用户刷新页面仍能保持已进入状态，直到会话失效或主动退出
- [ ] **AUTH-04**: 所有现有 API 路径都受同一套访问保护约束，不能绕过页面直接调用

### Data Persistence

- [ ] **DATA-01**: 配置数据存入 D1，而不是只存在浏览器本地
- [ ] **DATA-02**: 每条配置至少保存名称、地址、Key、默认模型、创建时间，以及当前需要保留的检测结果字段
- [ ] **DATA-03**: 首次升级时，现有浏览器本地数据可以被导入到 D1
- [ ] **DATA-04**: 应用重新打开后，用户能从 D1 看到之前保存的数据
- [ ] **DATA-05**: 删除和编辑配置后，D1 中的数据与页面展示保持一致

### Existing Feature Continuity

- [ ] **FEAT-01**: 用户仍可新增、编辑、复制、删除、导出配置
- [ ] **FEAT-02**: 用户仍可使用现有粘贴解析和批量新增能力
- [ ] **FEAT-03**: 连通性测试在迁移后仍可正常工作
- [ ] **FEAT-04**: 模型识别在迁移后仍可正常工作
- [ ] **FEAT-05**: 性能评测在迁移后仍可正常工作
- [ ] **FEAT-06**: CC Switch 导入导出能力在迁移后仍可正常工作

### Cloudflare Deployment

- [ ] **CF-01**: 项目可以按 Cloudflare 当前 Next.js 方案在 Workers 上本地预览
- [ ] **CF-02**: 项目具备 D1 绑定配置，部署后服务端能访问数据库
- [ ] **CF-03**: 生产部署流程明确且可复现，包括建库、迁移、设密码、上线

### Documentation

- [ ] **DOC-01**: README 说明当前架构不再只是浏览器本地存储
- [ ] **DOC-02**: 仓库内有清晰的 D1 初始化和部署说明
- [ ] **DOC-03**: 文档明确访问密码如何本地开发配置、如何线上配置

## v2 Requirements

### Security Hardening

- **SAFE-01**: 增加请求频率保护，降低公开部署后被滥用的风险
- **SAFE-02**: 增加更细的服务端输入校验，收紧任意上游地址访问边界
- **SAFE-03**: 为导出、深链等敏感操作增加更强提醒或更安全默认值

### Product Expansion

- **PROD-01**: 支持多用户隔离数据
- **PROD-02**: 支持多密码或更细粒度权限控制
- **PROD-03**: 支持云端同步与本地缓存并存

## Out of Scope

| Feature | Reason |
|---------|--------|
| 邮箱登录、验证码、OAuth | 当前只需要一个访问密码，完整账号体系超出范围 |
| 管理后台 | 当前只有单工具部署目标，没有后台管理诉求 |
| 多租户数据隔离 | 用户未提出，多加只会增加复杂度 |
| 更换前端框架或重写全部页面 | 当前重点是存储与部署，不是重做产品 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 3 | Pending |
| DATA-04 | Phase 3 | Pending |
| DATA-05 | Phase 3 | Pending |
| FEAT-01 | Phase 3 | Pending |
| FEAT-02 | Phase 3 | Pending |
| FEAT-03 | Phase 3 | Pending |
| FEAT-04 | Phase 3 | Pending |
| FEAT-05 | Phase 3 | Pending |
| FEAT-06 | Phase 3 | Pending |
| CF-01 | Phase 1 | Pending |
| CF-02 | Phase 1 | Pending |
| CF-03 | Phase 4 | Pending |
| DOC-01 | Phase 4 | Pending |
| DOC-02 | Phase 4 | Pending |
| DOC-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-08*  
*Last updated: 2026-04-08 after brownfield initialization*
