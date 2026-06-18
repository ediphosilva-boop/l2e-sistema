import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get("clientId")
  const projectId = searchParams.get("projectId")

  if (!clientId) return NextResponse.json({ error: "clientId obrigatório" }, { status: 400 })

  const client = await prisma.client.findUnique({ where: { id: clientId } })
  if (!client) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })

  const projectWhere = projectId ? { id: projectId, clientId } : { clientId }
  const projects = await prisma.project.findMany({
    where: projectWhere,
    include: {
      transactions: {
        where: { type: "entrada" },
        orderBy: { dueDate: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  const result = projects.map(p => {
    const entradas = p.transactions
    const totalContrato = p.totalValue
    const totalPago = entradas.filter(t => t.status === "pago").reduce((s, t) => s + t.amount, 0)
    const totalPendente = Math.max(0, totalContrato - totalPago)
    const steps = [
      { label: "Elétrica", status: p.stepEletrica },
      { label: "Pintura", status: p.stepPintura },
      { label: "Acabamentos", status: p.stepAcabamentos },
      { label: "Móveis", status: p.stepMoveis },
      { label: "Eletrodomésticos", status: p.stepEletrodomesticos },
      { label: "Personalização", status: p.stepPersonalizacao },
    ]
    const doneSteps = steps.filter(s => s.status === "instalado").length
    const completion = Math.round((doneSteps / steps.length) * 100)

    return {
      id: p.id, name: p.name, address: p.address, status: p.status,
      startDate: p.startDate, deliveryDate: p.deliveryDate,
      totalContrato, totalPago, totalPendente, completion, steps,
      pagamentos: entradas.map(t => ({
        id: t.id, description: t.description, amount: t.amount,
        status: t.status, dueDate: t.dueDate, paidDate: t.paidDate,
        paymentMethod: t.paymentMethod,
      })),
    }
  })

  const totalGeral = result.reduce((s, p) => s + p.totalContrato, 0)
  const totalPagoGeral = result.reduce((s, p) => s + p.totalPago, 0)
  const totalPendenteGeral = result.reduce((s, p) => s + p.totalPendente, 0)

  return NextResponse.json({
    client,
    projects: result,
    totais: { totalGeral, totalPagoGeral, totalPendenteGeral },
  })
}
