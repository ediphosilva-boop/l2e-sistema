import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const raw = await req.json()
    const data: Record<string, unknown> = {}
    if (raw.package !== undefined) data.package = raw.package
    if (raw.bedroom !== undefined) data.bedroom = raw.bedroom
    if (raw.price !== undefined) data.price = parseFloat(raw.price) || 0
    if (raw.startDate !== undefined) data.startDate = new Date(raw.startDate).toISOString()
    if (raw.endDate !== undefined) data.endDate = raw.endDate ? new Date(raw.endDate).toISOString() : null
    if (raw.notes !== undefined) data.notes = raw.notes || null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const record = await prisma.packagePrice.update({ where: { id }, data: data as any })
    return NextResponse.json(record)
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.packagePrice.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
