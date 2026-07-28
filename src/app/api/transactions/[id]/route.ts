import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const ALLOWED = ["type","category","description","amount","dueDate","paidDate","status","invoiceNumber","notes","recipient","paymentMethod","projectId","supplierId","clientId",
  "bankAccount","counterpartyDoc","subcategory","operationId","reconciled","reconciledDate","confirmedBy","receiptUrl","receivedAssetJson"]

function validateBusinessRules(data: Record<string, unknown>): string | null {
  if ("bankAccount" in data && !data.bankAccount) return "Conta bancária é obrigatória"
  if (data.status === "confirmacao" && !data.confirmedBy) return "Responsável pela confirmação é obrigatório para status Pendente de Confirmação"
  if (data.category === "Recebimento em Bens (Dação em Pagamento)" && data.receivedAssetJson !== undefined) {
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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const raw = await req.json()
    const data: Record<string, unknown> = {}
    for (const key of ALLOWED) if (key in raw) data[key] = raw[key]
    for (const key of ["category","dueDate","paidDate","invoiceNumber","notes","recipient","paymentMethod","projectId","supplierId","clientId",
      "bankAccount","counterpartyDoc","subcategory","operationId","reconciledDate","confirmedBy","receiptUrl"]) {
      if (data[key] === "") data[key] = null
    }
    for (const key of ["dueDate","paidDate","reconciledDate"]) {
      if (data[key] && typeof data[key] === "string" && !/T/.test(data[key] as string)) {
        data[key] = new Date(data[key] as string).toISOString()
      }
    }
    if (data.amount !== undefined) data.amount = parseFloat(String(data.amount)) || 0

    // Auto-set status when paidDate is provided
    if (data.paidDate && !data.status) data.status = "pago"

    const bizError = validateBusinessRules(data)
    if (bizError) return NextResponse.json({ error: bizError }, { status: 400 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = await prisma.transaction.update({ where: { id }, data: data as any })
    return NextResponse.json(t)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.transaction.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
