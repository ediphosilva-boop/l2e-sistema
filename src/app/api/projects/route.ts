import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const projects = await prisma.project.findMany({
    include: { client: true, _count: { select: { items: true, transactions: true } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const project = await prisma.project.create({ data })
  return NextResponse.json(project)
}
