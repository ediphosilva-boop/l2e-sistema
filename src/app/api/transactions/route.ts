import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const ALLOWED = ["type","category","description","amount","dueDate","paidDate","status","invoiceNumber","notes","recipient","paymentMethod","projectId","supplierId","clientId",
  "bankAccount","counterpartyDoc","subcategory","operationId","reconciled","reconciledDate","confirmedBy","receiptUrl","receivedAssetJson"]

function validateBusinessRules(data: Record<string, unknown>): string | null {
  if (!data.bankAccount) return "Conta bancária é obrigatória"
  if (data.status === "confirmacao" && !data.confirmedBy) return "Responsável pela confirmação é obrigatório para status Pendente de Confirmação"
  if (data.category === "Recebimento em Bens (Dação em Pagamento)") {
    try {
      const bem = JSON.parse(String(data.receivedAssetJson ?? "{}"))
      if (!bem.assetType || !bem.assignedValue || !bem.transferDoc) {
        return "Bem recebido: tipo, valor atribuído e documento de transferência são obrigatórios"
      }
    } catch {
      return "Dados do bem recebido inválidos"
    }
  }
  return null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const status = searchParams.get("status")
  const category = searchParams.get("category")

  const where: Record<string, unknown> = {}
  if (type) where.type = type
  if (status) where.status = status
  if (category) where.category = category

  const transactions = await prisma.transaction.findMany({
    where,
    include: { project: true, supplier: true, client: true },
    orderBy: { dueDate: "asc" },
  })
  return NextResponse.json(transactions)
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json()
    const data: Record<string, unknown> = {}
    for (const key of ALLOWED) if (key in raw) data[key] = raw[key]

    // Validação obrigatória
    if (!data.description) return NextResponse.json({ error: "Descrição é obrigatória" }, { status: 400 })
    if (!data.type || !["entrada", "saida"].includes(String(data.type))) return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
    if (!data.amount || parseFloat(String(data.amount)) <= 0) return NextResponse.json({ error: "Valor deve ser maior que zero" }, { status: 400 })

    for (const key of ["category","dueDate","paidDate","invoiceNumber","notes","recipient","paymentMethod","projectId","supplierId","clientId",
      "bankAccount","counterpartyDoc","subcategory","operationId","reconciledDate","confirmedBy","receiptUrl"]) {
      if (data[key] === "") data[key] = null
    }
    for (const key of ["dueDate","paidDate","reconciledDate"]) {
      if (data[key] && typeof data[key] === "string" && !/T/.test(data[key] as string)) {
        data[key] = new Date(data[key] as string).toISOString()
      }
    }
    data.amount = parseFloat(String(data.amount)) || 0

    // Auto-set status when paidDate is provided
    if (data.paidDate && data.status === "pendente") data.status = "pago"

    const bizError = validateBusinessRules(data)
    if (bizError) return NextResponse.json({ error: bizError }, { status: 400 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = await prisma.transaction.create({ data: data as any })
    return NextResponse.json(t)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
