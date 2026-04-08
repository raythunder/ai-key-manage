import type { KeyConfig, KeyConfigInput, KeyConfigPatch } from "@/lib/key-config-types";

import { getRuntimeConfig } from "@/lib/server/runtime-config";

type KeyConfigRow = {
  id: string;
  name: string;
  base_url: string;
  api_key: string;
  model: string;
  created_at: string;
  source_meta_json: string | null;
  probe_json: string | null;
  last_test_json: string | null;
  benchmarks_json: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseOptionalJson<T>(value: string | null): T | undefined {
  if (!value) return undefined;

  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

function stringifyOptionalJson(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  return JSON.stringify(value);
}

function toKeyConfig(row: KeyConfigRow): KeyConfig {
  return {
    id: row.id,
    name: row.name,
    baseUrl: row.base_url,
    apiKey: row.api_key,
    model: row.model,
    createdAt: row.created_at,
    sourceMeta: parseOptionalJson<KeyConfig["sourceMeta"]>(row.source_meta_json),
    probe: parseOptionalJson<KeyConfig["probe"]>(row.probe_json),
    lastTest: parseOptionalJson<KeyConfig["lastTest"]>(row.last_test_json),
    benchmarks: parseOptionalJson<KeyConfig["benchmarks"]>(row.benchmarks_json),
  };
}

async function getDatabase(): Promise<D1Database> {
  const runtimeConfig = await getRuntimeConfig();
  if (!runtimeConfig.database) {
    throw new Error("D1 database is not configured");
  }
  return runtimeConfig.database;
}

async function getKeyConfigRow(id: string): Promise<KeyConfigRow | null> {
  const database = await getDatabase();
  const row = await database
    .prepare(
      `SELECT id, name, base_url, api_key, model, created_at, source_meta_json, probe_json, last_test_json, benchmarks_json
       FROM key_configs
       WHERE id = ?`
    )
    .bind(id)
    .first<KeyConfigRow>();

  return row ?? null;
}

function ensureStringValue(value: string | undefined, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

export async function listKeyConfigs(): Promise<KeyConfig[]> {
  const database = await getDatabase();
  const result = await database
    .prepare(
      `SELECT id, name, base_url, api_key, model, created_at, source_meta_json, probe_json, last_test_json, benchmarks_json
       FROM key_configs
       ORDER BY created_at DESC, id DESC`
    )
    .all<KeyConfigRow>();

  return (result.results || []).map(toKeyConfig);
}

export async function createKeyConfigs(inputs: KeyConfigInput[]): Promise<KeyConfig[]> {
  if (inputs.length === 0) return [];

  const database = await getDatabase();
  const rows = inputs.map((input) => ({
    id: crypto.randomUUID(),
    name: input.name,
    base_url: input.baseUrl,
    api_key: input.apiKey,
    model: input.model,
    created_at: new Date().toISOString(),
    source_meta_json: stringifyOptionalJson(input.sourceMeta),
    probe_json: null,
    last_test_json: null,
    benchmarks_json: null,
  }));

  await database.batch(
    rows.map((row) =>
      database
        .prepare(
          `INSERT INTO key_configs (
            id, name, base_url, api_key, model, created_at, source_meta_json, probe_json, last_test_json, benchmarks_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          row.id,
          row.name,
          row.base_url,
          row.api_key,
          row.model,
          row.created_at,
          row.source_meta_json,
          row.probe_json,
          row.last_test_json,
          row.benchmarks_json
        )
    )
  );

  return rows.map(toKeyConfig);
}

export async function updateKeyConfig(id: string, patch: KeyConfigPatch): Promise<KeyConfig | null> {
  const current = await getKeyConfigRow(id);
  if (!current) return null;

  const nextRow: KeyConfigRow = {
    ...current,
    name: ensureStringValue(patch.name, current.name),
    base_url: ensureStringValue(patch.baseUrl, current.base_url),
    api_key: ensureStringValue(patch.apiKey, current.api_key),
    model: ensureStringValue(patch.model, current.model),
    source_meta_json:
      patch.sourceMeta === undefined ? current.source_meta_json : stringifyOptionalJson(patch.sourceMeta),
    probe_json: patch.probe === undefined ? current.probe_json : stringifyOptionalJson(patch.probe),
    last_test_json: patch.lastTest === undefined ? current.last_test_json : stringifyOptionalJson(patch.lastTest),
    benchmarks_json:
      patch.benchmarks === undefined ? current.benchmarks_json : stringifyOptionalJson(patch.benchmarks),
  };

  const database = await getDatabase();
  await database
    .prepare(
      `UPDATE key_configs
       SET name = ?, base_url = ?, api_key = ?, model = ?, source_meta_json = ?, probe_json = ?, last_test_json = ?, benchmarks_json = ?
       WHERE id = ?`
    )
    .bind(
      nextRow.name,
      nextRow.base_url,
      nextRow.api_key,
      nextRow.model,
      nextRow.source_meta_json,
      nextRow.probe_json,
      nextRow.last_test_json,
      nextRow.benchmarks_json,
      id
    )
    .run();

  return toKeyConfig(nextRow);
}

export async function deleteKeyConfig(id: string): Promise<boolean> {
  const existing = await getKeyConfigRow(id);
  if (!existing) return false;

  const database = await getDatabase();
  await database.prepare("DELETE FROM key_configs WHERE id = ?").bind(id).run();
  return true;
}

export async function deleteAllKeyConfigs(): Promise<void> {
  const database = await getDatabase();
  await database.prepare("DELETE FROM key_configs").run();
}

export function hasConfigPatchValues(patch: KeyConfigPatch): boolean {
  return Object.values(patch).some((value) => value !== undefined);
}

export function isRecordLike(value: unknown): value is Record<string, unknown> {
  return isRecord(value);
}
