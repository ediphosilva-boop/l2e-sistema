import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const services = await prisma.service.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] })
  return NextResponse.json(services)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const service = await prisma.service.create({ data })
  return NextResponse.json(service)
}
