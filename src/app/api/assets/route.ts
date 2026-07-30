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

export async function GET() {
  const assets = await prisma.asset.findMany({
    include: { project: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(assets)
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json()
    if (!raw.description?.trim()) return NextResponse.json({ error: "Descrição é obrigatória" }, { status: 400 })
    const data = sanitize(raw)
    data.description = String(raw.description).trim()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const asset = await prisma.asset.create({ data: data as any })
    return NextResponse.json(asset)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
