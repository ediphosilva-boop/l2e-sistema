import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const ALLOWED = ["type","category","description","amount","dueDate","paidDate","status","invoiceNumber","notes","projectId","supplierId","clientId"]

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const raw = await req.json()
  const data: Record<string, unknown> = {}
  for (const key of ALLOWED) if (key in raw) data[key] = raw[key]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = await prisma.transaction.update({ where: { id }, data: data as any })
  return NextResponse.json(t)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.transaction.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
