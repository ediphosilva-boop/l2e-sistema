import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const raw = await req.json()
    const data: Record<string, unknown> = {}
    if (raw.description !== undefined) data.description = raw.description
    if (raw.category !== undefined) data.category = raw.category || null
    if (raw.quantity !== undefined) data.quantity = parseFloat(raw.quantity) || 1
    if (raw.unitCost !== undefined) data.unitCost = parseFloat(raw.unitCost) || 0
    if (raw.order !== undefined) data.order = parseInt(raw.order) || 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item = await prisma.packageItem.update({ where: { id }, data: data as any })
    return NextResponse.json(item)
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.packageItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
