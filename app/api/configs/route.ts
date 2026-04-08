import { NextRequest, NextResponse } from "next/server";

import type { KeyConfigInput } from "@/lib/key-config-types";
import {
  createKeyConfigs,
  deleteAllKeyConfigs,
  isRecordLike,
  listKeyConfigs,
} from "@/lib/server/key-config-store";

export const runtime = "nodejs";

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parseSourceMeta(value: unknown): KeyConfigInput["sourceMeta"] | undefined {
  if (!isRecordLike(value)) return undefined;
  const kind = asString(value.kind);
  if (kind !== "manual" && kind !== "cc-switch-provider" && kind !== "cc-switch-deeplink") return undefined;

  const ccSwitchApp = asString(value.ccSwitchApp);
  const app =
    ccSwitchApp === "claude" ||
    ccSwitchApp === "codex" ||
    ccSwitchApp === "gemini" ||
    ccSwitchApp === "opencode" ||
    ccSwitchApp === "openclaw"
      ? ccSwitchApp
      : undefined;

  return {
    kind,
    ccSwitchApp: app,
  };
}

function parseConfigInput(value: unknown): KeyConfigInput | null {
  if (!isRecordLike(value)) return null;

  const name = asString(value.name)?.trim() || "";
  const baseUrl = asString(value.baseUrl)?.trim() || "";
  const apiKey = asString(value.apiKey)?.trim() || "";
  const model = asString(value.model)?.trim() || "";

  if (!name || !baseUrl || !apiKey) return null;

  return {
    name,
    baseUrl,
    apiKey,
    model,
    sourceMeta: parseSourceMeta(value.sourceMeta),
  };
}

function hasD1ConfigError(error: unknown): boolean {
  return error instanceof Error && error.message === "D1 database is not configured";
}

export async function GET() {
  try {
    return NextResponse.json({ configs: await listKeyConfigs() });
  } catch (error: unknown) {
    if (hasD1ConfigError(error)) {
      return NextResponse.json({ message: "当前环境还没有可用的 D1 数据库" }, { status: 503 });
    }
    return NextResponse.json({ message: "读取配置失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "请求体不是合法 JSON" }, { status: 400 });
  }

  const configs = Array.isArray((body as { configs?: unknown[] })?.configs)
    ? ((body as { configs: unknown[] }).configs.map(parseConfigInput).filter(Boolean) as KeyConfigInput[])
    : [parseConfigInput(body)].filter(Boolean) as KeyConfigInput[];

  if (configs.length === 0) {
    return NextResponse.json({ message: "至少需要一条完整配置" }, { status: 400 });
  }

  try {
    return NextResponse.json({ configs: await createKeyConfigs(configs) }, { status: 201 });
  } catch (error: unknown) {
    if (hasD1ConfigError(error)) {
      return NextResponse.json({ message: "当前环境还没有可用的 D1 数据库" }, { status: 503 });
    }
    return NextResponse.json({ message: "写入配置失败" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await deleteAllKeyConfigs();
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (hasD1ConfigError(error)) {
      return NextResponse.json({ message: "当前环境还没有可用的 D1 数据库" }, { status: 503 });
    }
    return NextResponse.json({ message: "删除配置失败" }, { status: 500 });
  }
}
