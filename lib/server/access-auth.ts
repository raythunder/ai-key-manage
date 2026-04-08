import { getCloudflareContext } from "@opennextjs/cloudflare";

const textEncoder = new TextEncoder();
const SESSION_COOKIE_NAME = "ai-key-vault-session";
const SESSION_MARKER = "ai-key-vault-session-v1";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function encodeText(value: string): Uint8Array {
  return textEncoder.encode(value);
}

function encodeBuffer(value: string): ArrayBuffer {
  return encodeText(value).buffer as ArrayBuffer;
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array): boolean {
  const maxLength = Math.max(left.length, right.length);
  let mismatch = left.length === right.length ? 0 : 1;

  for (let index = 0; index < maxLength; index += 1) {
    mismatch |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }

  return mismatch === 0;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

async function signSessionMarker(secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encodeBuffer(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encodeBuffer(SESSION_MARKER));
  return toHex(new Uint8Array(signature));
}

function normalizeSecret(secret: string | null | undefined): string | null {
  if (typeof secret !== "string") return null;
  const trimmed = secret.trim().replace(/^(['"])(.*)\1$/, "$2");
  return trimmed ? trimmed : null;
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}

export function getSessionMaxAgeSeconds(): number {
  return SESSION_MAX_AGE_SECONDS;
}

export function getAccessPasswordFromRuntimeSync(): string | null {
  try {
    const { env } = getCloudflareContext();
    return normalizeSecret((env as CloudflareEnv & { ACCESS_PASSWORD?: string }).ACCESS_PASSWORD);
  } catch {
    return normalizeSecret(process.env.ACCESS_PASSWORD);
  }
}

export async function verifyAccessPassword(input: string, accessPassword: string): Promise<boolean> {
  return timingSafeEqual(encodeText(input), encodeText(accessPassword));
}

export async function createAccessSessionValue(accessPassword: string): Promise<string> {
  return signSessionMarker(accessPassword);
}

export async function verifyAccessSessionValue(sessionValue: string | undefined, accessPassword: string): Promise<boolean> {
  if (!sessionValue) return false;

  const expected = await createAccessSessionValue(accessPassword);
  return timingSafeEqual(encodeText(sessionValue), encodeText(expected));
}
