import { NextRequest, NextResponse } from "next/server";

import {
  createAccessSessionValue,
  getAccessPasswordFromRuntimeSync,
  getSessionCookieName,
  getSessionMaxAgeSeconds,
  verifyAccessPassword,
} from "@/lib/server/access-auth";
import { readLocalDevAccessPassword } from "@/lib/server/local-dev-password";

export const runtime = "nodejs";

type SessionRequestBody = {
  password?: string;
};

function buildCookieOptions(request: NextRequest) {
  const isHttps = request.nextUrl.protocol === "https:";

  return {
    httpOnly: true,
    maxAge: getSessionMaxAgeSeconds(),
    path: "/",
    sameSite: "lax" as const,
    secure: isHttps,
  };
}

export async function POST(request: NextRequest) {
  let body: SessionRequestBody;

  try {
    body = (await request.json()) as SessionRequestBody;
  } catch {
    return NextResponse.json({ message: "请求体不是合法 JSON" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  const accessPassword = getAccessPasswordFromRuntimeSync() || readLocalDevAccessPassword();

  if (!accessPassword) {
    return NextResponse.json({ message: "当前还没有配置访问密码" }, { status: 503 });
  }

  const isValid = await verifyAccessPassword(password.trim(), accessPassword);

  if (!isValid) {
    return NextResponse.json({ message: "访问密码不正确" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(getSessionCookieName(), await createAccessSessionValue(accessPassword), buildCookieOptions(request));
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(getSessionCookieName(), "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: true,
  });
  return response;
}
