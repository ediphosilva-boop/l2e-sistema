import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    if (!data.name?.trim()) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    if (!data.category?.trim()) return NextResponse.json({ error: "Categoria é obrigatória" }, { status: 400 })
    data.name = data.name.trim()
    const product = await prisma.product.create({ data })
    return NextResponse.json(product)
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
