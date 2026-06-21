import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const supplierId = req.nextUrl.searchParams.get("supplierId")
  const from = req.nextUrl.searchParams.get("from")
  const to = req.nextUrl.searchParams.get("to")

  if (!supplierId) return NextResponse.json({ error: "supplierId obrigatório" }, { status: 400 })

  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } })
  if (!supplier) return NextResponse.json({ error: "Fornecedor não encontrado" }, { status: 404 })

  const dateFilter: Record<string, unknown> = {}
  if (from) dateFilter.gte = new Date(from)
  if (to) dateFilter.lte = new Date(to + "T23:59:59")

  const transactions = await prisma.transaction.findMany({
    where: {
      supplierId,
      ...(from || to ? { dueDate: dateFilter } : {}),
    },
    include: { project: true },
    orderBy: { dueDate: "asc" },
  })

  const totalPago = transactions.filter(t => t.status === "pago").reduce((s, t) => s + t.amount, 0)
  const totalPendente = transactions.filter(t => t.status === "pendente").reduce((s, t) => s + t.amount, 0)
  const totalGeral = transactions.reduce((s, t) => s + t.amount, 0)

  return NextResponse.json({
    supplier,
    transactions: transactions.map(t => ({
      id: t.id, type: t.type, category: t.category, description: t.description,
      amount: t.amount, status: t.status, dueDate: t.dueDate, paidDate: t.paidDate,
      paymentMethod: t.paymentMethod, invoiceNumber: t.invoiceNumber,
      project: t.project ? { name: t.project.name } : null,
    })),
    totais: { totalPago, totalPendente, totalGeral },
  })
}
