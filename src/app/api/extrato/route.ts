import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const STEP_PCT: Record<string, number> = { pendente: 0, comprado: 20, entregue: 50, instalado: 100 }
const STEP_LABELS = [
  { key: "stepEletrica",         label: "Elétrica" },
  { key: "stepPintura",          label: "Pintura" },
  { key: "stepAcabamentos",      label: "Acabamentos" },
  { key: "stepMoveis",           label: "Móveis" },
  { key: "stepEletrodomesticos", label: "Eletrodomésticos" },
  { key: "stepPersonalizacao",   label: "Personalização" },
]

function calcCompletion(statuses: string[]): number {
  const applicable = statuses.filter(s => s !== "naoaplica")
  if (!applicable.length) return 0
  return Math.round(applicable.reduce((s, st) => s + (STEP_PCT[st] ?? 0), 0) / applicable.length)
}

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
      apartments: {
        orderBy: { number: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  const result = projects.map(p => {
    const entradas = p.transactions
    const totalContrato = p.totalValue
    const totalPago = entradas.filter(t => t.status === "pago").reduce((s, t) => s + t.amount, 0)
    const totalPendente = Math.max(0, totalContrato - totalPago)

    // Steps e completion por apartamento
    const apartments = p.apartments.map(a => {
      const statuses = STEP_LABELS.map(s => (a as unknown as Record<string, string>)[s.key] ?? "pendente")
      return {
        id: a.id,
        number: a.number ?? "",
        area: a.area ?? "",
        bedrooms: a.bedrooms ?? "",
        plan: a.plan ?? "",
        totalValue: a.totalValue ?? 0,
        completion: calcCompletion(statuses),
        steps: STEP_LABELS.map((s, i) => ({ label: s.label, status: statuses[i] })),
      }
    })

    // % projeto = média dos apartamentos (ou fallback campo de projeto)
    const completion = apartments.length > 0
      ? Math.round(apartments.reduce((s, a) => s + a.completion, 0) / apartments.length)
      : calcCompletion(STEP_LABELS.map(s => (p as unknown as Record<string, string>)[s.key] ?? "pendente"))

    const steps = STEP_LABELS.map(s => ({
      label: s.label,
      status: (p as unknown as Record<string, string>)[s.key] ?? "pendente",
    }))

    return {
      id: p.id, name: p.name, address: p.address, status: p.status,
      startDate: p.startDate, deliveryDate: p.deliveryDate,
      totalContrato, totalPago, totalPendente, completion, steps, apartments,
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
