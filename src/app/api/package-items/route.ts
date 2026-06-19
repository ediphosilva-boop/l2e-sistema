import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const pkg = req.nextUrl.searchParams.get("package")
  const items = await prisma.packageItem.findMany({
    where: pkg ? { package: pkg } : undefined,
    orderBy: [{ package: "asc" }, { order: "asc" }, { createdAt: "asc" }],
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json()
    const item = await prisma.packageItem.create({
      data: {
        package: raw.package,
        description: raw.description,
        category: raw.category || null,
        quantity: parseFloat(raw.quantity) || 1,
        unitCost: parseFloat(raw.unitCost) || 0,
        order: parseInt(raw.order) || 0,
      },
    })
    return NextResponse.json(item)
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
