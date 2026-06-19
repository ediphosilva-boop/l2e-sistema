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

    // Bulk init from package: { apartmentId, plan }
    if (raw.initFromPlan) {
      const apt = await prisma.apartment.findUnique({ where: { id: raw.apartmentId } })
      if (!apt) return NextResponse.json({ error: "Apartment not found" }, { status: 404 })
      const plan = raw.plan || apt.plan || "Pacote Essencial"
      const defaults = DEFAULT_PACKAGE_ITEMS[plan] ?? DEFAULT_PACKAGE_ITEMS["Pacote Essencial"]

      // Delete existing items first
      await prisma.apartmentItem.deleteMany({ where: { apartmentId: raw.apartmentId } })

      const created = await prisma.apartmentItem.createMany({
        data: defaults.map(d => ({
          apartmentId: raw.apartmentId,
          category: d.category,
          description: d.description,
          order: d.order,
          status: "pendente",
        })),
      })
      return NextResponse.json({ created: created.count })
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
