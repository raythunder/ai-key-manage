import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAccessPasswordFromRuntimeSync } from "@/lib/server/access-auth";
import { readLocalDevAccessPassword } from "@/lib/server/local-dev-password";

type RuntimeEnv = CloudflareEnv & {
  ACCESS_PASSWORD?: string;
  DB?: D1Database;
};

export type RuntimeConfig = {
  isCloudflareRuntime: boolean;
  env: RuntimeEnv | null;
  accessPassword: string | null;
  database: D1Database | null;
};

export type BootstrapStatus = {
  isCloudflareRuntime: boolean;
  hasAccessPassword: boolean;
  hasDatabase: boolean;
};

async function readCloudflareEnv(): Promise<RuntimeEnv | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env as RuntimeEnv;
  } catch {
    return null;
  }
}

export async function getRuntimeConfig(): Promise<RuntimeConfig> {
  const env = await readCloudflareEnv();
  const accessPassword = env?.ACCESS_PASSWORD?.trim() || getAccessPasswordFromRuntimeSync() || readLocalDevAccessPassword();
  const database = env?.DB ?? null;

  return {
    isCloudflareRuntime: env !== null,
    env,
    accessPassword: accessPassword || null,
    database,
  };
}

export async function getBootstrapStatus(): Promise<BootstrapStatus> {
  const runtimeConfig = await getRuntimeConfig();

  return {
    isCloudflareRuntime: runtimeConfig.isCloudflareRuntime,
    hasAccessPassword: Boolean(runtimeConfig.accessPassword),
    hasDatabase: runtimeConfig.database !== null,
  };
}
