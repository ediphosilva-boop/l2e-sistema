import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PROJECT_STATUSES, NON_CASH_CATEGORIES } from "@/lib/constants"

export async function GET() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const in7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)

  const [transactions, projects] = await Promise.all([
    prisma.transaction.findMany({ include: { project: true } }),
    prisma.project.findMany({ include: { client: true } }),
  ])

  // Saldo = regime de caixa (dinheiro real). Categorias non-cash (ex: bem recebido em vez de dinheiro) ficam de fora até virarem venda.
  const saldo = transactions.reduce((s, t) =>
    t.status === "pago" && !(NON_CASH_CATEGORIES as readonly string[]).includes(t.category ?? "")
      ? s + (t.type === "entrada" ? t.amount : -t.amount) : s, 0)

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

  // Vencidos: pendentes com dueDate no passado
  const vencidos = transactions.filter(t =>
    t.status === "pendente" && t.dueDate && new Date(t.dueDate) < now
  ).length

  const boletosVencer = transactions.filter(t =>
    t.status === "pendente" && t.dueDate &&
    new Date(t.dueDate) >= now && new Date(t.dueDate) <= in7Days
  ).length

  const projetosAtivos = projects.filter(p => p.status === "execucao").length
  const projetosEntreguesMes = projects.filter(p =>
    p.status === "entregue" && p.deliveryDate &&
    new Date(p.deliveryDate) >= startOfMonth && new Date(p.deliveryDate) <= endOfMonth
  ).length

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
    PROJECT_STATUSES.map(s => [s, projects.filter(p => p.status === s).length])
  )

  const ultimasTransacoes = transactions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  // Saldo financeiro por projeto — visão segregada de quanto cada projeto deve, já recebeu, tem em caixa
  // (dinheiro real) e ainda vai receber/pagar.
  const porProjeto = projects
    .map(p => {
      const pt = transactions.filter(t => t.projectId === p.id)
      const isCash = (t: (typeof pt)[number]) => !(NON_CASH_CATEGORIES as readonly string[]).includes(t.category ?? "")

      const valorDevido = p.totalValue
      const valorRecebido = pt.filter(t => t.type === "entrada" && t.status === "pago").reduce((s, t) => s + t.amount, 0)
      const saldoAReceber = valorDevido - valorRecebido
      const saldoAPagar = pt.filter(t => t.type === "saida" && t.status === "pendente").reduce((s, t) => s + t.amount, 0)

      // Dinheiro real já movimentado neste projeto (mesmo critério do Saldo em Caixa geral: exclui
      // categorias não-monetárias como dação em pagamento, que não representam dinheiro no banco).
      const saldoCaixa = pt.reduce((s, t) =>
        t.status === "pago" && isCash(t) ? s + (t.type === "entrada" ? t.amount : -t.amount) : s, 0)

      // Projeção: o que já está em caixa, mais o que ainda falta receber, menos o que ainda falta pagar.
      const projetadoFinal = saldoCaixa + saldoAReceber - saldoAPagar

      return {
        id: p.id, name: p.name, status: p.status,
        valorDevido, valorRecebido, saldoAReceber, saldoCaixa, saldoAPagar, projetadoFinal,
      }
    })
    .filter(p => p.status !== "cancelado" && (p.valorDevido > 0 || p.valorRecebido > 0 || p.saldoAPagar > 0))
    .sort((a, b) => b.valorDevido - a.valorDevido)

  return NextResponse.json({
    saldo, saldoFuturo, totalAReceber, totalAPagar, receitaMes, despesaMes,
    vencidos, boletosVencer, projetosAtivos, projetosEntreguesMes,
    fluxoMensal, statusCount, ultimasTransacoes, porProjeto,
  })
}
