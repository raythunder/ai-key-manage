---
phase: 01
slug: cloudflare-foundation
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-08
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | existing npm script checks |
| **Config file** | `package.json` |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run lint && npm run build && npm run cf-typegen` |
| **Estimated runtime** | ~60-180 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint`
- **After every plan wave:** Run `npm run lint && npm run build && npm run cf-typegen`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 180 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | CF-01 | — | Workers build path configured without hardcoded secrets | script/build | `npm run lint && npm run build` | ✅ | ⬜ pending |
| 01-02-01 | 02 | 2 | CF-02 / AUTH-02 | T-01-01 | Worker reads D1 binding and Secret through runtime config surface | type/build | `npm run cf-typegen && npm run lint` | ✅ / ❌ W1 | ⬜ pending |
| 01-03-01 | 03 | 2 | DATA-01 / DATA-02 | T-01-02 | D1 bootstrap SQL and local secret conventions exist and can initialize foundation data model | file/cli | `test -f db/d1/001_initial.sql && npm run lint` | ✅ / ❌ W1 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Existing lint/build script baseline available
- [x] No separate test harness required for this phase

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Preview worker starts successfully | CF-01 | Requires local Cloudflare preview runtime and generated worker output | Run `npm run preview` after dependencies/config are in place and confirm app boots without runtime crash |
| Worker can see configured password and D1 binding | AUTH-02 / CF-02 | Requires local or bound Cloudflare runtime resources | After adding local `.dev.vars` and D1 binding values, hit the bootstrap status route and confirm it reports binding/password availability without leaking the password |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or existing script coverage
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing references
- [x] No watch-mode flags
- [x] Feedback latency < 180s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
