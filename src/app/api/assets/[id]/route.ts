import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const ALLOWED = ["description","assetType","assignedValue","purpose","status",
  "acquisitionDate","disposalDate","disposalValue","transferDoc","projectId","notes"]

function sanitize(raw: Record<string, unknown>) {
  const data: Record<string, unknown> = {}
  for (const key of ALLOWED) if (key in raw) data[key] = raw[key]
  for (const key of ["assetType","transferDoc","projectId","notes"]) {
    if (data[key] === "") data[key] = null
  }
  for (const key of ["acquisitionDate","disposalDate"]) {
    if (data[key] === "" || data[key] === null) { data[key] = null; continue }
    if (data[key] && typeof data[key] === "string" && !/T/.test(data[key] as string)) {
      data[key] = new Date(data[key] as string).toISOString()
    }
  }
  if (data.assignedValue !== undefined) data.assignedValue = parseFloat(String(data.assignedValue)) || 0
  if (data.disposalValue !== undefined) {
    data.disposalValue = data.disposalValue === "" || data.disposalValue === null ? null : parseFloat(String(data.disposalValue)) || 0
  }
  return data
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const raw = await req.json()
    const data = sanitize(raw)
    if (raw.description) data.description = String(raw.description).trim()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const asset = await prisma.asset.update({ where: { id }, data: data as any })
    return NextResponse.json(asset)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.asset.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
