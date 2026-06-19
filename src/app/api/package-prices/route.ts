import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const prices = await prisma.packagePrice.findMany({
    orderBy: [{ package: "asc" }, { bedroom: "asc" }, { startDate: "desc" }],
  })
  return NextResponse.json(prices)
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json()
    const data = {
      package: raw.package,
      bedroom: raw.bedroom,
      price: parseFloat(raw.price) || 0,
      startDate: new Date(raw.startDate).toISOString(),
      endDate: raw.endDate ? new Date(raw.endDate).toISOString() : null,
      notes: raw.notes || null,
    }
    const record = await prisma.packagePrice.create({ data })
    return NextResponse.json(record)
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
