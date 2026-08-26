import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    // /api/alerts e /api/backup precisam ficar alcançáveis sem login pro cron externo —
    // cada uma faz sua própria verificação (secret de cron OU sessão), veja src/lib/cronAuth.ts.
    // /api/seed NÃO está aqui: exige login (e checagem extra de admin dentro da rota), já que
    // apaga e recria o banco inteiro.
    pathname.startsWith("/api/alerts") ||
    pathname.startsWith("/api/backup") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"

  if (isPublic) return NextResponse.next()

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
