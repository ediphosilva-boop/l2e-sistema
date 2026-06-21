import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const log = await prisma.backupLog.findUnique({ where: { id } })
  if (!log) return NextResponse.json({ error: "Backup não encontrado" }, { status: 404 })
  if (!log.data) return NextResponse.json({ error: "Este backup não possui dados salvos" }, { status: 404 })

  const date = log.createdAt.toISOString().split("T")[0]
  return new NextResponse(log.data, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="l2e-backup-${date}.json"`,
    },
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.backupLog.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
