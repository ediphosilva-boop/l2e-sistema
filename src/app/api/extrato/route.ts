import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const STEP_PCT: Record<string, number> = { pendente: 0, comprado: 33, entregue: 66, instalado: 100 }

function calcCompletionFromItems(items: Array<{ status: string }>): number {
  const applicable = items.filter(i => i.status !== "naoaplica")
  if (!applicable.length) return 0
  return Math.round(applicable.filter(i => i.status === "instalado").length / applicable.length * 100)
}

function categoryStatus(items: Array<{ status: string }>): string {
  const applicable = items.filter(i => i.status !== "naoaplica")
  if (!applicable.length) return "naoaplica"
  if (applicable.every(i => i.status === "instalado")) return "instalado"
  if (applicable.some(i => i.status === "instalado" || i.status === "entregue")) return "entregue"
  if (applicable.some(i => i.status === "comprado")) return "comprado"
  return "pendente"
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
        include: {
          items: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  const result = projects.map(p => {
    const entradas = p.transactions
    const totalContrato = p.totalValue
    const totalPago = entradas.filter(t => t.status === "pago").reduce((s, t) => s + t.amount, 0)
    const totalPendente = Math.max(0, totalContrato - totalPago)

    const apartments = p.apartments.map(a => {
      const allItems = a.items

      // Derive steps from item categories
      const categories = [...new Set(allItems.map(i => i.category))].sort()
      const steps = categories.map(cat => {
        const catItems = allItems.filter(i => i.category === cat)
        return { label: cat, status: categoryStatus(catItems) }
      })

      const completion = allItems.length > 0
        ? calcCompletionFromItems(allItems)
        : 0

      return {
        id: a.id,
        number: a.number ?? "",
        area: a.area ?? "",
        bedrooms: a.bedrooms ?? "",
        plan: a.plan ?? "",
        totalValue: a.totalValue ?? 0,
        completion,
        steps,
        itemCount: allItems.length,
      }
    })

    const completion = apartments.length > 0
      ? Math.round(apartments.reduce((s, a) => s + a.completion, 0) / apartments.length)
      : 0

    // Project-level steps = union of all category steps across apartments
    const allSteps = apartments.flatMap(a => a.steps)
    const projectCategories = [...new Set(allSteps.map(s => s.label))].sort()
    const steps = projectCategories.map(cat => {
      const catStatuses = allSteps.filter(s => s.label === cat).map(s => s.status)
      const worstIdx = ["instalado", "entregue", "comprado", "pendente", "naoaplica"]
      const worst = worstIdx.find(st => catStatuses.includes(st)) ?? "pendente"
      return { label: cat, status: worst }
    })

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
