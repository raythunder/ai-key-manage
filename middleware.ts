import { NextRequest, NextResponse } from "next/server";

import {
  getAccessPasswordFromRuntimeSync,
  getSessionCookieName,
  verifyAccessSessionValue,
} from "@/lib/server/access-auth";

const EMPTY_JS = "export {};\n";
const CLEANUP_SW = `
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
    await self.registration.unregister();

    const clients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });

    for (const client of clients) {
      client.navigate(client.url);
    }
  })());
});
`.trim();

const AUTH_ROUTE = "/api/auth/session";
const UNLOCK_ROUTE = "/unlock";
const PUBLIC_FILE_PATTERN = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$/i;

function jsResponse(body: string): NextResponse {
  return new NextResponse(body, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function buildUnlockRedirect(request: NextRequest): NextResponse {
  const unlockUrl = new URL(UNLOCK_ROUTE, request.url);
  const nextValue = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (nextValue && nextValue !== UNLOCK_ROUTE) {
    unlockUrl.searchParams.set("next", nextValue);
  }

  return NextResponse.redirect(unlockUrl);
}

function buildUnauthorizedApiResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ message }, { status });
}

function isPublicPath(pathname: string): boolean {
  return (
    pathname === AUTH_ROUTE ||
    pathname === UNLOCK_ROUTE ||
    pathname === "/favicon.ico" ||
    pathname === "/logo.png" ||
    pathname.startsWith("/_next/") ||
    PUBLIC_FILE_PATTERN.test(pathname)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/service-worker.js") {
    return jsResponse(CLEANUP_SW);
  }

  if (pathname === "/@vite/client" || pathname === "/@react-refresh" || pathname === "/src/main.tsx") {
    return jsResponse(EMPTY_JS);
  }

  if (pathname === "/icons/icon-192x192.png") {
    return NextResponse.redirect(new URL("/logo.png", request.url));
  }

  if (isPublicPath(pathname)) {
    if (pathname !== UNLOCK_ROUTE) return NextResponse.next();

    const accessPassword = getAccessPasswordFromRuntimeSync();
    if (!accessPassword) return NextResponse.next();

    const sessionValue = request.cookies.get(getSessionCookieName())?.value;
    const isAuthorized = await verifyAccessSessionValue(sessionValue, accessPassword);

    if (!isAuthorized) return NextResponse.next();

    const nextPath = request.nextUrl.searchParams.get("next");
    const redirectPath = nextPath && nextPath.startsWith("/") ? nextPath : "/";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  const accessPassword = getAccessPasswordFromRuntimeSync();

  if (!accessPassword) {
    if (pathname.startsWith("/api/")) {
      return buildUnauthorizedApiResponse("当前环境还没有配置访问密码", 503);
    }

    return buildUnlockRedirect(request);
  }

  const sessionValue = request.cookies.get(getSessionCookieName())?.value;
  const isAuthorized = await verifyAccessSessionValue(sessionValue, accessPassword);

  if (isAuthorized) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return buildUnauthorizedApiResponse("请先输入访问密码", 401);
  }

  return buildUnlockRedirect(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image).*)",
    "/service-worker.js",
    "/@vite/client",
    "/@react-refresh",
    "/src/main.tsx",
  ],
  runtime: "experimental-edge",
};
