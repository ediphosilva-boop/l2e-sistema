import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().slice(0, 10)

  const todayStart = new Date(todayStr + "T00:00:00.000Z")
  const todayEnd = new Date(todayStr + "T23:59:59.999Z")
  const tomorrowStart = new Date(tomorrowStr + "T00:00:00.000Z")
  const tomorrowEnd = new Date(tomorrowStr + "T23:59:59.999Z")

  const [vencidos, hoje, amanha] = await Promise.all([
    prisma.transaction.findMany({
      where: { status: "pendente", dueDate: { lt: todayStart } },
      select: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { status: "pendente", dueDate: { gte: todayStart, lte: todayEnd } },
      select: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { status: "pendente", dueDate: { gte: tomorrowStart, lte: tomorrowEnd } },
      select: { amount: true },
    }),
  ])

  return NextResponse.json({
    vencidos: vencidos.length,
    venceHoje: hoje.length,
    venceAmanha: amanha.length,
    totalVencido: vencidos.reduce((s, t) => s + t.amount, 0),
    totalHoje: hoje.reduce((s, t) => s + t.amount, 0),
    totalAmanha: amanha.reduce((s, t) => s + t.amount, 0),
  })
}
