import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ITEM_STATUSES } from "@/lib/constants"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const raw = await req.json()
    const data: Record<string, unknown> = {}

    if (raw.status !== undefined) {
      if (!ITEM_STATUSES.includes(raw.status)) {
        return NextResponse.json({ error: `Status inválido. Use: ${ITEM_STATUSES.join(", ")}` }, { status: 400 })
      }
      data.status = raw.status
    }
    if (raw.completedAt !== undefined) data.completedAt = raw.completedAt ? new Date(raw.completedAt) : null
    if (raw.description !== undefined) data.description = raw.description
    if (raw.category !== undefined) data.category = raw.category
    if (raw.order !== undefined) data.order = raw.order

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item = await prisma.apartmentItem.update({ where: { id }, data: data as any })
    return NextResponse.json(item)
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.apartmentItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
