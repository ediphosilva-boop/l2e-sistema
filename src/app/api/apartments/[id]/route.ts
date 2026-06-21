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

async function syncProjectTotal(projectId: string) {
  const apts = await prisma.apartment.findMany({ where: { projectId }, select: { totalValue: true } })
  const total = apts.reduce((s, a) => s + (a.totalValue ?? 0), 0)
  await prisma.project.update({ where: { id: projectId }, data: { totalValue: total } })
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const apt = await prisma.apartment.findUnique({ where: { id }, include: { project: true } })
  if (!apt) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(apt)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const raw = await req.json()
    const data = sanitize(raw)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apt = await prisma.apartment.update({ where: { id }, data: data as any })
    if (data.totalValue !== undefined) await syncProjectTotal(apt.projectId)
    return NextResponse.json(apt)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const apt = await prisma.apartment.findUnique({ where: { id }, select: { projectId: true } })
    await prisma.apartment.delete({ where: { id } })
    if (apt) await syncProjectTotal(apt.projectId)
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
