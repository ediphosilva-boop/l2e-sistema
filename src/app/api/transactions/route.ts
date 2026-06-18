import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const ALLOWED = ["type","category","description","amount","dueDate","paidDate","status","invoiceNumber","notes","projectId","supplierId","clientId"]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const status = searchParams.get("status")

  const where: Record<string, unknown> = {}
  if (type) where.type = type
  if (status) where.status = status

  const transactions = await prisma.transaction.findMany({
    where,
    include: { project: true, supplier: true, client: true },
    orderBy: { dueDate: "asc" },
  })
  return NextResponse.json(transactions)
}

export async function POST(req: NextRequest) {
  const raw = await req.json()
  const data: Record<string, unknown> = {}
  for (const key of ALLOWED) if (key in raw) data[key] = raw[key]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = await prisma.transaction.create({ data: data as any })
  return NextResponse.json(t)
}
