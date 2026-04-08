export type CcSwitchApp = "claude" | "codex" | "gemini" | "opencode" | "openclaw";

export type KeyConfigSourceMeta = {
  kind: "manual" | "cc-switch-provider" | "cc-switch-deeplink";
  ccSwitchApp?: CcSwitchApp;
};

export type KeyConfigTestResult = {
  status: "success" | "error";
  message: string;
  detail?: string;
  responseText?: string;
  responseSource?: "stream" | "chat" | "responses";
  testedAt: string;
};

export type KeyConfigProbeResult = {
  status: "success" | "error";
  supportedModels: string[];
  recommendedModel?: string;
  detail?: string;
  testedAt: string;
};

export type BenchmarkRoundDetail = {
  round: number;
  ok: boolean;
  elapsedMs?: number;
  firstTokenMs?: number;
  error?: string;
};

export type ModelBenchmarkResult = {
  status: "success" | "error";
  model: string;
  tags: string[];
  speed?: {
    rounds: number;
    medianMs: number;
    avgMs: number;
    successRate: number;
    stabilityMs: number;
    samplesMs: number[];
    firstTokenMedianMs?: number;
    firstTokenAvgMs?: number;
    firstTokenSamplesMs?: number[];
    roundDetails?: BenchmarkRoundDetail[];
  };
  detail?: string;
  testedAt: string;
};

export type KeyConfig = {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  createdAt: string;
  sourceMeta?: KeyConfigSourceMeta;
  probe?: KeyConfigProbeResult;
  lastTest?: KeyConfigTestResult;
  benchmarks?: Record<string, ModelBenchmarkResult>;
};

export type KeyConfigInput = {
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  sourceMeta?: KeyConfigSourceMeta;
};

export type KeyConfigPatch = {
  name?: string;
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  sourceMeta?: KeyConfig["sourceMeta"] | null;
  probe?: KeyConfig["probe"] | null;
  lastTest?: KeyConfig["lastTest"] | null;
  benchmarks?: KeyConfig["benchmarks"] | null;
};
