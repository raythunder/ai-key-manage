import { NextRequest, NextResponse } from "next/server";

import type { KeyConfigPatch } from "@/lib/key-config-types";
import { deleteKeyConfig, hasConfigPatchValues, isRecordLike, updateKeyConfig } from "@/lib/server/key-config-store";

export const runtime = "nodejs";

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function hasD1ConfigError(error: unknown): boolean {
  return error instanceof Error && error.message === "D1 database is not configured";
}

function parsePatch(value: unknown): KeyConfigPatch {
  if (!isRecordLike(value)) return {};

  return {
    name: asString(value.name),
    baseUrl: asString(value.baseUrl),
    apiKey: asString(value.apiKey),
    model: asString(value.model),
    sourceMeta: value.sourceMeta as KeyConfigPatch["sourceMeta"],
    probe: value.probe as KeyConfigPatch["probe"],
    lastTest: value.lastTest as KeyConfigPatch["lastTest"],
    benchmarks: value.benchmarks as KeyConfigPatch["benchmarks"],
  };
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "请求体不是合法 JSON" }, { status: 400 });
  }

  const patch = parsePatch(body);
  if (!hasConfigPatchValues(patch)) {
    return NextResponse.json({ message: "没有可更新的内容" }, { status: 400 });
  }

  const { id } = await context.params;

  try {
    const config = await updateKeyConfig(id, patch);
    if (!config) {
      return NextResponse.json({ message: "配置不存在" }, { status: 404 });
    }

    return NextResponse.json({ config });
  } catch (error: unknown) {
    if (hasD1ConfigError(error)) {
      return NextResponse.json({ message: "当前环境还没有可用的 D1 数据库" }, { status: 503 });
    }
    return NextResponse.json({ message: "更新配置失败" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const deleted = await deleteKeyConfig(id);
    if (!deleted) {
      return NextResponse.json({ message: "配置不存在" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (hasD1ConfigError(error)) {
      return NextResponse.json({ message: "当前环境还没有可用的 D1 数据库" }, { status: 503 });
    }
    return NextResponse.json({ message: "删除配置失败" }, { status: 500 });
  }
}
