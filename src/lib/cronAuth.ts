import { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

/**
 * Autoriza rotas que precisam ficar alcançáveis por um serviço de cron externo (sem login)
 * e também por um usuário logado usando a própria tela do sistema (sessão NextAuth).
 *
 * Aceita: Authorization: Bearer <CRON_SECRET> · ?secret=<CRON_SECRET> · sessão válida.
 * Se CRON_SECRET não estiver configurado, a chamada por segredo nunca é aceita — cai para
 * exigir sessão, então a rota falha fechada (exige login) em vez de ficar aberta.
 */
export async function isAuthorizedCronOrSession(req: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const authHeader = req.headers.get("authorization")
    const querySecret = new URL(req.url).searchParams.get("secret")
    if (authHeader === `Bearer ${secret}` || querySecret === secret) return true
  }
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  return !!token
}
