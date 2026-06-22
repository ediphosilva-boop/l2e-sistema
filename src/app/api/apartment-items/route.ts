import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { DEFAULT_PACKAGE_ITEMS } from "@/lib/packageItems"

export async function GET(req: NextRequest) {
  const aptId = req.nextUrl.searchParams.get("apartmentId")
  const items = await prisma.apartmentItem.findMany({
    where: aptId ? { apartmentId: aptId } : undefined,
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json()

    // Bulk init from package: { initFromPlan, apartmentId, plan, selectedItemIds? }
    if (raw.initFromPlan) {
      const apt = await prisma.apartment.findUnique({ where: { id: raw.apartmentId } })
      if (!apt) return NextResponse.json({ error: "Apartment not found" }, { status: 404 })
      const plan = raw.plan || apt.plan || "Pacote Essencial"
      const bedrooms = raw.bedrooms ?? apt.bedrooms ?? 2

      // Prefer live DB items; fall back to hardcoded defaults
      let dbItems = await prisma.packageItem.findMany({
        where: { package: plan },
        orderBy: [{ order: "asc" }],
      })

      // For Personalizado with selectedItemIds, filter to only those items
      if (raw.selectedItemIds?.length && plan === "Pacote Personalizado") {
        dbItems = dbItems.filter(i => (raw.selectedItemIds as string[]).includes(i.id))
      }

      // 1 dormitório: excluir itens de quarto solteiro
      if (Number(bedrooms) === 1) {
        dbItems = dbItems.filter(i => !i.description.toLowerCase().includes("solteiro"))
      }

      const items = dbItems.length > 0
        ? dbItems.map(d => ({
            apartmentId: raw.apartmentId as string,
            category: d.category ?? "Geral",
            description: d.description,
            order: d.order,
            status: "pendente" as const,
          }))
        : (DEFAULT_PACKAGE_ITEMS[plan] ?? DEFAULT_PACKAGE_ITEMS["Pacote Essencial"])
            .filter(d => Number(bedrooms) !== 1 || !d.description.toLowerCase().includes("solteiro"))
            .map(d => ({
              apartmentId: raw.apartmentId as string,
              category: d.category,
              description: d.description,
              order: d.order,
              status: "pendente" as const,
            }))

      await prisma.apartmentItem.deleteMany({ where: { apartmentId: raw.apartmentId } })
      const created = await prisma.apartmentItem.createMany({ data: items })
      return NextResponse.json({ created: created.count })
    }

    // Sync: add missing items to all initialized apartments without deleting existing
    if (raw.syncItems && Array.isArray(raw.syncItems)) {
      const newItems: Array<{ description: string; category: string; order: number }> = raw.syncItems
      const apartments = await prisma.apartment.findMany({
        include: { items: { select: { description: true } } },
      })
      let added = 0
      for (const apt of apartments) {
        if (apt.items.length === 0) continue
        const existing = new Set(apt.items.map(i => i.description.toLowerCase()))
        const bedrooms = apt.bedrooms ?? 2
        for (const item of newItems) {
          if (bedrooms === 1 && item.description.toLowerCase().includes("solteiro")) continue
          if (existing.has(item.description.toLowerCase())) continue
          await prisma.apartmentItem.create({
            data: { apartmentId: apt.id, category: item.category, description: item.description, order: item.order, status: "pendente" },
          })
          added++
        }
      }
      return NextResponse.json({ ok: true, added })
    }

    // Bulk create: { items: [{apartmentId, category, description, order}] }
    if (raw.items && Array.isArray(raw.items)) {
      const created = await prisma.apartmentItem.createMany({
        data: raw.items.map((it: { apartmentId: string; category: string; description: string; order?: number }) => ({
          apartmentId: it.apartmentId,
          category: it.category,
          description: it.description,
          order: it.order ?? 0,
          status: "pendente",
        })),
      })
      return NextResponse.json({ created: created.count })
    }

    // Single create
    const item = await prisma.apartmentItem.create({
      data: {
        apartmentId: raw.apartmentId,
        category: raw.category,
        description: raw.description,
        order: raw.order ?? 0,
        status: raw.status ?? "pendente",
      },
    })
    return NextResponse.json(item)
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
