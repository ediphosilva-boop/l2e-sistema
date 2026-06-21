import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const ALLOWED = ["name","cnpj","contactName","phone","email","category","paymentTerms","notes",
  "bankName","bankAgency","bankAccount","bankAccountType","pixKey"]

export async function GET() {
  const suppliers = await prisma.supplier.findMany({
    include: { _count: { select: { transactions: true } } },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(suppliers)
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json()
    if (!raw.name?.trim()) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    const data: Record<string, unknown> = {}
    for (const key of ALLOWED) if (key in raw) data[key] = raw[key] || null
    data.name = raw.name.trim()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supplier = await prisma.supplier.create({ data: data as any })
    return NextResponse.json(supplier)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
