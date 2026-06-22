import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const items: Array<{ description: string; category: string; order: number }> = body.items ?? []

    if (!items.length) return NextResponse.json({ error: "Envie ao menos um item" }, { status: 400 })

    const apartments = await prisma.apartment.findMany({
      include: { items: { select: { description: true } } },
    })

    let added = 0
    for (const apt of apartments) {
      if (apt.items.length === 0) continue

      const existingDescs = new Set(apt.items.map(i => i.description.toLowerCase()))
      const bedrooms = apt.bedrooms ?? 2

      for (const item of items) {
        if (bedrooms === 1 && item.description.toLowerCase().includes("solteiro")) continue
        if (existingDescs.has(item.description.toLowerCase())) continue

        await prisma.apartmentItem.create({
          data: {
            apartmentId: apt.id,
            category: item.category,
            description: item.description,
            order: item.order,
            status: "pendente",
          },
        })
        added++
      }
    }

    return NextResponse.json({ ok: true, apartments: apartments.filter(a => a.items.length > 0).length, added })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
