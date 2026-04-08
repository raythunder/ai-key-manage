"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type UnlockFormProps = {
  hasAccessPassword: boolean;
};

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string };

export function UnlockForm({ hasAccessPassword }: UnlockFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasAccessPassword) {
      setSubmitState({ status: "error", message: "当前环境还没有配置访问密码" });
      return;
    }

    setSubmitState({ status: "submitting" });

    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message || "访问密码校验失败");
      }

      const nextPath = searchParams.get("next");
      const destination = nextPath && nextPath.startsWith("/") ? nextPath : "/";
      router.replace(destination);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "访问密码校验失败";
      setSubmitState({ status: "error", message });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="access-password" className="block text-sm font-medium text-zinc-700">
          访问密码
        </label>
        <input
          id="access-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          placeholder="请输入访问密码"
          autoComplete="current-password"
          disabled={!hasAccessPassword || submitState.status === "submitting"}
          required
        />
      </div>

      <button
        type="submit"
        disabled={!hasAccessPassword || submitState.status === "submitting"}
        className="inline-flex w-full items-center justify-center rounded-2xl border border-emerald-700 bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitState.status === "submitting" ? "验证中..." : "进入应用"}
      </button>

      {!hasAccessPassword ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          当前环境还没有配置访问密码 需要先在 Cloudflare Secret 或本地开发环境里设置 ACCESS_PASSWORD
        </p>
      ) : null}

      {submitState.status === "error" ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{submitState.message}</p>
      ) : null}
    </form>
  );
}
