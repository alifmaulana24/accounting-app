import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromCookieHeader } from "@/lib/session-core";

// ---------------------------------------------------------------------------
// Route classification
// ---------------------------------------------------------------------------

/** Routes that require an authenticated session. */
const PROTECTED_ROUTES = [
  "/dashboard",
  "/produk",
  "/pelanggan",
  "/pemasok",
  "/pembelian",
  "/penjualan",
  "/pembayaran-pemasok",
  "/penerimaan-pelanggan",
  "/daftar-akun",
  "/jurnal-umum",
  "/buku-besar",
];

/** Routes that redirect authenticated users away (login, etc.). */
const AUTH_ROUTES = ["/login"];

// ---------------------------------------------------------------------------
// Proxy function
// ---------------------------------------------------------------------------

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );

  // SESSION_SECRET is available in the Node.js runtime used by proxy.
  const secret = process.env.SESSION_SECRET ?? "";

  const cookieHeader = request.headers.get("cookie");
  const session = getSessionFromCookieHeader(cookieHeader, secret);
  const isAuthenticated = session !== null;

  // 1. Unauthenticated user → protected route: redirect to /login
  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Authenticated user → auth route (e.g. /login): redirect to /dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. Root "/" → always redirect to /login (rule 2 handles authenticated users)
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// ---------------------------------------------------------------------------
// Matcher — skip static assets and Next.js internals
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
