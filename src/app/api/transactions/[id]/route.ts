import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  const t = await prisma.transaction.update({ where: { id }, data })
  return NextResponse.json(t)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.transaction.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
