import fs from "node:fs";
import path from "node:path";

function normalizeSecret(secret: string | null | undefined): string | null {
  if (typeof secret !== "string") return null;
  const trimmed = secret.trim().replace(/^(['"])(.*)\1$/, "$2");
  return trimmed ? trimmed : null;
}

function parseDevVarsValue(line: string): [string, string] | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const separatorIndex = trimmed.indexOf("=");
  if (separatorIndex <= 0) return null;

  const key = trimmed.slice(0, separatorIndex).trim();
  const value = trimmed.slice(separatorIndex + 1).trim().replace(/^(['"])(.*)\1$/, "$2");
  if (!key) return null;

  return [key, value];
}

export function readLocalDevAccessPassword(): string | null {
  const envPassword = normalizeSecret(process.env.ACCESS_PASSWORD);
  if (envPassword) return envPassword;

  const candidateFiles = [".dev.vars.local", ".dev.vars"];
  for (const fileName of candidateFiles) {
    const filePath = path.join(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const parsed = parseDevVarsValue(line);
      if (!parsed) continue;

      const [key, value] = parsed;
      if (key === "ACCESS_PASSWORD") {
        return normalizeSecret(value);
      }
    }
  }

  return null;
}
