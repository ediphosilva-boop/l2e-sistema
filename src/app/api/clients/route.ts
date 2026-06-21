import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const clients = await prisma.client.findMany({
    include: { _count: { select: { projects: true } } },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(clients)
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    if (!data.name?.trim()) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    data.name = data.name.trim()
    const client = await prisma.client.create({ data })
    return NextResponse.json(client)
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
