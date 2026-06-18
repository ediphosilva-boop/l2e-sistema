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

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      items: { include: { product: true, service: true } },
      transactions: { orderBy: { dueDate: "asc" } },
      contracts: true,
    },
  })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(project)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const raw = await req.json()
    const data = sanitize(raw)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const project = await prisma.project.update({ where: { id }, data: data as any })
    return NextResponse.json(project)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
