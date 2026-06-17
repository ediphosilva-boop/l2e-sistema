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
  const data = await req.json()
  const client = await prisma.client.create({ data })
  return NextResponse.json(client)
}
