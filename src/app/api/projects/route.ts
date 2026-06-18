import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const ALLOWED = ["name","address","status","totalValue","startDate","deliveryDate","notes","clientId",
  "stepEletrica","stepPintura","stepAcabamentos","stepMoveis","stepEletrodomesticos","stepPersonalizacao",
  "stepEletricaDate","stepPinturaDate","stepAcabamentosDate","stepMoveisDate","stepEletrodomesticosDate","stepPersonalizacaoDate"]

function sanitize(raw: Record<string, unknown>) {
  const data: Record<string, unknown> = {}
  for (const key of ALLOWED) if (key in raw) data[key] = raw[key]
  for (const key of ["address","notes","clientId"]) {
    if (data[key] === "") data[key] = null
  }
  for (const key of ["startDate","deliveryDate","stepEletricaDate","stepPinturaDate","stepAcabamentosDate","stepMoveisDate","stepEletrodomesticosDate","stepPersonalizacaoDate"]) {
    if (data[key] === "" || data[key] === null) { data[key] = null; continue }
    if (data[key] && typeof data[key] === "string" && !/T/.test(data[key] as string)) {
      data[key] = new Date(data[key] as string).toISOString()
    }
  }
  if (data.totalValue !== undefined) data.totalValue = parseFloat(String(data.totalValue)) || 0
  return data
}

export async function GET() {
  const projects = await prisma.project.findMany({
    include: { client: true, _count: { select: { items: true, transactions: true } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json()
    const data = sanitize(raw)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const project = await prisma.project.create({ data: data as any })
    return NextResponse.json(project)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
