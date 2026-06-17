import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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
  const data = await req.json()
  const t = await prisma.transaction.create({ data })
  return NextResponse.json(t)
}
