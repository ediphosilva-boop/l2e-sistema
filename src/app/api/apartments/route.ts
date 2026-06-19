import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const ALLOWED = ["projectId","number","area","bedrooms","plan","totalValue","notes",
  "stepEletrica","stepPintura","stepAcabamentos","stepMoveis","stepEletrodomesticos","stepPersonalizacao",
  "stepEletricaDate","stepPinturaDate","stepAcabamentosDate","stepMoveisDate","stepEletrodomesticosDate","stepPersonalizacaoDate"]

function sanitize(raw: Record<string, unknown>) {
  const data: Record<string, unknown> = {}
  for (const key of ALLOWED) if (key in raw) data[key] = raw[key]
  if (data.notes === "") data.notes = null
  if (data.plan === "") data.plan = null
  if (data.area !== undefined && data.area !== null) data.area = parseFloat(String(data.area)) || null
  if (data.bedrooms !== undefined && data.bedrooms !== null) data.bedrooms = parseInt(String(data.bedrooms)) || null
  if (data.totalValue !== undefined) data.totalValue = parseFloat(String(data.totalValue)) || 0
  for (const key of ["stepEletricaDate","stepPinturaDate","stepAcabamentosDate","stepMoveisDate","stepEletrodomesticosDate","stepPersonalizacaoDate"]) {
    if (data[key] === "" || data[key] === null) { data[key] = null; continue }
    if (data[key] && typeof data[key] === "string" && !/T/.test(data[key] as string)) {
      data[key] = new Date(data[key] as string).toISOString()
    }
  }
  return data
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get("projectId")
  const where = projectId ? { projectId } : {}
  const apartments = await prisma.apartment.findMany({
    where,
    include: { project: { include: { client: true, contracts: { where: { status: "assinado" }, orderBy: { signedAt: "desc" }, take: 1 } } }, items: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] } },
    orderBy: [{ projectId: "asc" }, { number: "asc" }],
  })
  return NextResponse.json(apartments)
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json()
    const data = sanitize(raw)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apt = await prisma.apartment.create({ data: data as any })
    return NextResponse.json(apt)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
