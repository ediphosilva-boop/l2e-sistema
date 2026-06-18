import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()))
  const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : null

  const dateFilter = month
    ? { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) }
    : { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) }

  const transactions = await prisma.transaction.findMany({
    where: { paidDate: dateFilter, status: "pago" },
    include: { project: { select: { name: true } }, supplier: { select: { name: true } } },
  })

  // Receitas
  const entradas = transactions.filter(t => t.type === "entrada")
  const receitaBruta = entradas.reduce((s, t) => s + t.amount, 0)

  // Custos e despesas
  const saidas = transactions.filter(t => t.type === "saida")

  const cmv = saidas.filter(t => ["Pagamento Fornecedor", "Material"].includes(t.category ?? ""))
  const maoDeObra = saidas.filter(t => t.category === "Mão de Obra")
  const despesasOp = saidas.filter(t => t.category === "Despesa Operacional")
  const prolabore = saidas.filter(t => t.category === "Pro Labore")
  const reembolsos = saidas.filter(t => t.category === "Reembolso")
  const outros = saidas.filter(t => !["Pagamento Fornecedor", "Material", "Mão de Obra", "Despesa Operacional", "Pro Labore", "Reembolso"].includes(t.category ?? ""))

  const sum = (arr: typeof saidas) => arr.reduce((s, t) => s + t.amount, 0)

  const totalCmv = sum(cmv)
  const totalMo = sum(maoDeObra)
  const totalDespOp = sum(despesasOp)
  const totalProlabore = sum(prolabore)
  const totalReembolsos = sum(reembolsos)
  const totalOutros = sum(outros)

  const lucroBruto = receitaBruta - totalCmv - totalMo
  const lucroLiquido = lucroBruto - totalDespOp - totalProlabore - totalReembolsos - totalOutros
  const margemBruta = receitaBruta > 0 ? (lucroBruto / receitaBruta) * 100 : 0
  const margemLiquida = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0

  // Pendentes (receitas não recebidas)
  const pendentes = await prisma.transaction.findMany({
    where: { type: "entrada", status: "pendente", dueDate: dateFilter },
  })
  const receitaPendente = pendentes.reduce((s, t) => s + t.amount, 0)

  return NextResponse.json({
    receitaBruta, receitaPendente,
    cmv: { total: totalCmv, items: cmv },
    maoDeObra: { total: totalMo, items: maoDeObra },
    despesasOperacionais: { total: totalDespOp, items: despesasOp },
    prolabore: { total: totalProlabore, items: prolabore },
    reembolsos: { total: totalReembolsos, items: reembolsos },
    outros: { total: totalOutros, items: outros },
    lucroBruto, lucroLiquido, margemBruta, margemLiquida,
  })
}
