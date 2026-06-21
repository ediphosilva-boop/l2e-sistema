import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const in7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)

  const [transactions, projects] = await Promise.all([
    prisma.transaction.findMany({ include: { project: true } }),
    prisma.project.findMany({ include: { client: true } }),
  ])

  const saldo = transactions.reduce((s, t) =>
    t.status === "pago" ? s + (t.type === "entrada" ? t.amount : -t.amount) : s, 0)

  const totalAReceber = transactions.filter(t => t.type === "entrada" && t.status === "pendente").reduce((s, t) => s + t.amount, 0)
  const totalAPagar = transactions.filter(t => t.type === "saida" && t.status === "pendente").reduce((s, t) => s + t.amount, 0)
  const saldoFuturo = saldo + totalAReceber - totalAPagar

  const receitaMes = transactions.filter(t =>
    t.type === "entrada" && t.status === "pendente" && t.dueDate &&
    new Date(t.dueDate) >= startOfMonth && new Date(t.dueDate) <= endOfMonth
  ).reduce((s, t) => s + t.amount, 0)

  const despesaMes = transactions.filter(t =>
    t.type === "saida" && t.status === "pendente" && t.dueDate &&
    new Date(t.dueDate) >= startOfMonth && new Date(t.dueDate) <= endOfMonth
  ).reduce((s, t) => s + t.amount, 0)

  const boletosVencer = transactions.filter(t =>
    t.status === "pendente" && t.dueDate &&
    new Date(t.dueDate) >= now && new Date(t.dueDate) <= in7Days
  ).length

  const projetosAtivos = projects.filter(p => p.status === "execucao").length
  const projetosEntreguesMes = projects.filter(p =>
    p.status === "entregue" && p.deliveryDate &&
    new Date(p.deliveryDate) >= startOfMonth && new Date(p.deliveryDate) <= endOfMonth
  ).length

  // Fluxo mensal (últimos 6 meses)
  const fluxoMensal = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const month = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
    const entradas = transactions.filter(t =>
      t.type === "entrada" && t.paidDate &&
      new Date(t.paidDate) >= d && new Date(t.paidDate) <= end
    ).reduce((s, t) => s + t.amount, 0)
    const saidas = transactions.filter(t =>
      t.type === "saida" && t.paidDate &&
      new Date(t.paidDate) >= d && new Date(t.paidDate) <= end
    ).reduce((s, t) => s + t.amount, 0)
    return { month, entradas, saidas }
  })

  const statusCount = Object.fromEntries(
    ["orcamento", "contrato", "execucao", "entregue", "cancelado"].map(s => [
      s, projects.filter(p => p.status === s).length
    ])
  )

  const ultimasTransacoes = transactions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  return NextResponse.json({
    saldo, saldoFuturo, totalAReceber, totalAPagar, receitaMes, despesaMes, boletosVencer,
    projetosAtivos, projetosEntreguesMes,
    fluxoMensal, statusCount, ultimasTransacoes,
  })
}
