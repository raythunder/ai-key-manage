import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function parseDevVarsFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};

  const content = fs.readFileSync(filePath, "utf8");
  const entries: Record<string, string> = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    if (!key) continue;

    entries[key] = rawValue.replace(/^(['"])(.*)\1$/, "$2");
  }

  return entries;
}

function loadLocalDevVars() {
  const candidateFiles = [".dev.vars", ".dev.vars.local"].map((name) => path.join(projectRoot, name));

  for (const filePath of candidateFiles) {
    const values = parseDevVarsFile(filePath);

    for (const [key, value] of Object.entries(values)) {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

loadLocalDevVars();

void initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
