import type { Metadata } from "next";
import { Suspense } from "react";

import { getBootstrapStatus } from "@/lib/server/runtime-config";

import { UnlockForm } from "./unlock-form";

export const metadata: Metadata = {
  title: "输入访问密码",
  description: "先输入访问密码，再进入 AI Key Vault",
};

export default async function UnlockPage() {
  const bootstrapStatus = await getBootstrapStatus();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_42%),linear-gradient(180deg,#fafaf9_0%,#f4f4f5_100%)] px-4 py-10 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,420px)]">
          <section className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-emerald-700">
              AI KEY VAULT
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">先输入访问密码</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-600 sm:text-base">
              这个站点现在已经加上入口保护了 没有验证前 主页面和接口请求都会被拦住
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">页面访问</p>
                <p className="mt-2 text-sm leading-6 text-zinc-700">未验证前会自动跳到这个页面 不再直接进入主界面</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">接口请求</p>
                <p className="mt-2 text-sm leading-6 text-zinc-700">未验证前 所有数据接口和测试接口都会直接拒绝</p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="mb-5">
              <p className="text-sm font-semibold text-zinc-900">验证后进入应用</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {bootstrapStatus.hasAccessPassword ? "密码已经配置好了 通过后会直接进入主页面" : "当前环境还没有找到访问密码配置"}
              </p>
            </div>
            <Suspense fallback={<div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">正在准备验证入口...</div>}>
              <UnlockForm hasAccessPassword={bootstrapStatus.hasAccessPassword} />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}
