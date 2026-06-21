import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const ALLOWED = ["type", "title", "contentJson", "pdfUrl", "status", "signedAt", "projectId", "clientId"]

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const raw = await req.json()
    const data: Record<string, unknown> = {}
    for (const key of ALLOWED) if (key in raw) data[key] = raw[key]
    for (const key of ["pdfUrl", "projectId", "clientId"]) {
      if (data[key] === "") data[key] = null
    }
    if (data.signedAt && typeof data.signedAt === "string" && !/T/.test(data.signedAt as string)) {
      data.signedAt = new Date(data.signedAt as string).toISOString()
    }
    // Validate contentJson if present
    if (data.contentJson && typeof data.contentJson === "string") {
      try { JSON.parse(data.contentJson as string) } catch {
        return NextResponse.json({ error: "contentJson inválido" }, { status: 400 })
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contract = await prisma.contract.update({ where: { id }, data: data as any })
    return NextResponse.json(contract)
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.contract.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
