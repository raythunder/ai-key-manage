# Concerns Map

## Scope

- Reviewed `README.md`, `app/**`, `lib/**`, `proxy.ts`, `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`.
- Signal scan completed for `TODO`, `FIXME`, `unsafe`, `any`, `console`, `error`, `throw`, `env`.
- Semantic search used first to locate security boundary, large-file debt, duplicated logic, and performance-sensitive paths.

## High-Risk Concerns

### 1. Server-side proxy trusts user-supplied upstream address

- `app/api/openai/test/route.ts`, `app/api/openai/probe/route.ts`, and `app/api/openai/benchmark/route.ts` all accept `baseUrl` and `apiKey` from request JSON and pass them straight into `runOpenAITest`, `runOpenAIProbe`, and `runOpenAIBenchmarkRound`.
- In `lib/openai-proxy.ts:108-127`, `normalizeBaseUrl` and `toOpenAIBaseUrl` only trim the string and append protocol or `/v1`. They do not restrict hostnames, block private IP ranges, or validate against an allowlist.
- In `lib/openai-proxy.ts:240-245`, `lib/openai-proxy.ts:281-295`, `lib/openai-proxy.ts:352-365`, `lib/openai-proxy.ts:570-585`, and `lib/openai-proxy.ts:787-796`, the server directly fetches the user-provided upstream.
- Concern: this creates an SSRF-style boundary. Any caller who can hit these routes can make the server attempt outbound requests to arbitrary endpoints.

### 2. No visible auth, rate limiting, or abuse control on expensive routes

- `app/api/openai/test/route.ts:8-21`, `app/api/openai/probe/route.ts:8-21`, and `app/api/openai/benchmark/route.ts:8-21` only parse JSON and call the proxy helpers.
- `proxy.ts:36-56` only rewrites a few static paths and does not add request protection for `/api/**`.
- `next.config.ts:7-11` has no route hardening or runtime policy related to these endpoints.
- 未发现认证、来源校验、限流、配额控制、审计日志。
- Concern: probe and benchmark routes can trigger multiple upstream requests per click, so unauthenticated abuse would scale quickly.

### 3. Secrets are intentionally stored and exported in plain text

- `README.md:57-67` explicitly states keys are stored in browser `localStorage` and sent through same-origin backend forwarding when testing.
- `app/page.tsx:1472-1484` loads and writes the full config list to `localStorage`.
- `app/page.tsx:689-709` exports `apiKey` into `.md` and `.txt` output verbatim.
- `app/page.tsx:1261-1274` builds `ccswitch://` deep links with `apiKey` in query parameters.
- Concern: this is aligned with the product intent, but it is still the main security risk surface. Local device compromise, clipboard leakage, exported files, screenshots, or deep-link handling can expose keys.

## Medium-Risk Concerns

### 4. Probe fallback can become slow and costly when `/models` fails

- `README.md:30-42` positions model discovery and benchmark as core flows.
- `lib/openai-proxy.ts:767-849` first calls `/models`, then falls back to trial requests across `MODEL_CANDIDATES`.
- `lib/openai-proxy.ts:12` defines 6 candidate models.
- `lib/openai-proxy.ts:818-825` tries those candidates sequentially.
- Each candidate can itself cascade into multiple request styles via `lib/openai-proxy.ts:415-510`.
- Concern: one model probe can fan out into many upstream calls and noticeably increase latency and provider-side usage when `/models` is unavailable.

### 5. Benchmark flow is serial and can be expensive for long model lists

- `README.md:36-42` promises 1 to 3 rounds of benchmarking with summary metrics.
- `app/page.tsx:2276-2347` runs benchmark rounds in a `for` loop, one request at a time.
- `lib/openai-proxy.ts:851-910` may do stream first, then fall back to additional request attempts.
- Concern: latency scales linearly with `models x rounds`, and each failed round can still consume multiple upstream requests.

### 6. Service-worker cleanup proxy is operationally fragile

- `proxy.ts:39-55` intercepts `/service-worker.js`, `@vite`-style dev paths, and one icon path.
- `proxy.ts:4-25` returns a cleanup service worker that unregisters itself, deletes all caches, and reloads clients.
- Concern: this is a sharp operational workaround. If the app later introduces a real service worker or matching asset paths, this proxy becomes an easy regression point.

## Technical Debt

### 7. Frontend page is oversized and carries too many responsibilities

- `app/page.tsx` is 4163 lines.
- `README.md:11-47` shows the page currently owns config management, parsing, testing, probing, benchmarking, exporting, and CC Switch integration.
- `app/page.tsx:1442-1500` alone initializes a large state surface.
- Concern: UI rendering, storage migration, import parsing, network orchestration, export formatting, and benchmark presentation all live in one client file. This is the main maintainability hotspot.

### 8. Proxy library is also large and mixes multiple concerns

- `lib/openai-proxy.ts` is 911 lines.
- The file contains URL normalization, response scoring, error extraction, fallback orchestration, stream parsing, model recommendation, test flow, probe flow, and benchmark flow.
- Concern: one file currently owns most server-side protocol behavior, making future changes risky and harder to verify.

### 9. Repeated helper logic exists on both client and server

- `lib/openai-proxy.ts:108-130` and `app/page.tsx:199-214` both normalize base URLs and clean keys.
- `lib/openai-proxy.ts:186-237` and `app/page.tsx:1277-1328` both implement error extraction and human-readable error formatting.
- `lib/openai-proxy.ts:240-268` and `app/page.tsx:1202-1241` both implement timeout-wrapped JSON fetch helpers.
- `lib/openai-proxy.ts:34-60` and `app/page.tsx:728-755` both define `isRecord`, `cleanOneLineText`, `cleanMultilineText`, and `uniqueStrings`.
- Concern: duplicated behavior increases drift risk. A bug fix in one side can easily be missed on the other.

### 10. Dependency drift: `openai` package is installed but not used

- `package.json:11-20` includes `openai`.
- Search did not find any imports or runtime usage of `openai` under the reviewed source files.
- Concern: unused dependencies increase upgrade surface and maintenance noise.

## Signals Scan

### Explicit findings

- `TODO`: 未发现
- `FIXME`: 未发现
- `unsafe`: 未发现
- `console`: 未发现
- `process.env`: 未发现
- runtime `env` handling in reviewed application code: 未发现
- `any`: 未发现显式 `any` 类型
- `error` / `throw`: 大量存在，主要集中在 `lib/openai-proxy.ts` 和 `app/page.tsx` 的错误整理与网络失败分支

### Other notable absences

- Database access: 未发现
- User account system: 未发现
- Third-party auth flow: 未发现
- Server-side secret storage: 未发现
- Automated tests: 未发现

## Evidence Paths

- Product and storage intent: `README.md`
- Client state, storage, export, deep link, and request orchestration: `app/page.tsx`
- API route boundary: `app/api/openai/test/route.ts`
- API route boundary: `app/api/openai/probe/route.ts`
- API route boundary: `app/api/openai/benchmark/route.ts`
- Server-side upstream request logic: `lib/openai-proxy.ts`
- Shared route payload types: `lib/openai-proxy-types.ts`
- Request path interception: `proxy.ts`
- Runtime and package configuration: `next.config.ts`
- Runtime and package configuration: `package.json`
- TypeScript and lint baseline: `tsconfig.json`
- TypeScript and lint baseline: `eslint.config.mjs`
- CSS build baseline: `postcss.config.mjs`

## Recommended Follow-up Order

1. Tighten the server request boundary around user-provided `baseUrl`.
2. Add basic auth or rate limiting for `/api/openai/*`.
3. Split duplicated request/error helpers into a shared utility layer.
4. Break `app/page.tsx` into smaller feature modules.
5. Break `lib/openai-proxy.ts` into request, parsing, and orchestration units.
6. Reassess whether plain-text export and deep-link key transport need extra warning or safer defaults.
