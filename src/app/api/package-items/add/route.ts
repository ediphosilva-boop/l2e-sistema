import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { description, category, packages, quantity, unitCost, order } = await req.json()
    if (!description) return NextResponse.json({ error: "Descrição obrigatória" }, { status: 400 })

    const pkgs = packages ?? ["Pacote Essencial", "Pacote Premium", "Pacote Personalizado"]
    const results = []

    for (const pkg of pkgs as string[]) {
      const existing = await prisma.packageItem.findFirst({
        where: { package: pkg, description },
      })
      if (existing) continue

      const item = await prisma.packageItem.create({
        data: {
          package: pkg,
          description,
          category: category ?? "Outros",
          quantity: quantity ?? 1,
          unitCost: unitCost ?? 0,
          order: order ?? 5090,
        },
      })
      results.push(item)
    }

    return NextResponse.json({ ok: true, created: results.length, items: results })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
