import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const suppliers = await prisma.supplier.findMany({
    include: { _count: { select: { transactions: true } } },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(suppliers)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const supplier = await prisma.supplier.create({ data })
  return NextResponse.json(supplier)
}
