import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const TABLES = [
  { name: "users",         fn: () => prisma.user.findMany() },
  { name: "clients",       fn: () => prisma.client.findMany() },
  { name: "suppliers",     fn: () => prisma.supplier.findMany() },
  { name: "products",      fn: () => prisma.product.findMany() },
  { name: "services",      fn: () => prisma.service.findMany() },
  { name: "projects",      fn: () => prisma.project.findMany() },
  { name: "apartments",    fn: () => prisma.apartment.findMany() },
  { name: "apartmentItems",fn: () => prisma.apartmentItem.findMany() },
  { name: "projectItems",  fn: () => prisma.projectItem.findMany() },
  { name: "transactions",  fn: () => prisma.transaction.findMany() },
  { name: "contracts",     fn: () => prisma.contract.findMany() },
  { name: "packagePrices", fn: () => prisma.packagePrice.findMany() },
  { name: "packageItems",  fn: () => prisma.packageItem.findMany() },
] as const

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") ?? "manual"
  const save = searchParams.get("save") === "true"
  const cronSecret = searchParams.get("secret")

  // Vercel Cron sends Authorization header — only block if it's a cron call without valid secret
  const authHeader = req.headers.get("authorization")
  const isCronCall = !!authHeader
  if (isCronCall) {
    const expected = process.env.CRON_SECRET
    if (expected && authHeader !== `Bearer ${expected}` && cronSecret !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    const backup: Record<string, unknown[]> = {}
    let totalRecords = 0

    for (const table of TABLES) {
      const data = await table.fn()
      backup[table.name] = data
      totalRecords += data.length
    }

    const payload = {
      version: "1.0",
      system: "L2E Prime Solutions",
      exportedAt: new Date().toISOString(),
      tables: TABLES.length,
      totalRecords,
      data: backup,
    }

    const jsonStr = JSON.stringify(payload)
    const sizeBytes = new TextEncoder().encode(jsonStr).length

    // Log the backup execution
    await prisma.backupLog.create({
      data: {
        type,
        status: "sucesso",
        tables: TABLES.length,
        records: totalRecords,
        sizeBytes,
        data: save ? jsonStr : null,
        userName: type === "automatico" ? "Sistema (Cron)" : null,
      },
    })

    // For auto backups that save, just confirm
    if (save) {
      return NextResponse.json({
        ok: true,
        type,
        tables: TABLES.length,
        records: totalRecords,
        sizeBytes,
      })
    }

    // For manual backups, return the full data for download
    return new NextResponse(jsonStr, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="l2e-backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : String(e)

    // Log error
    try {
      await prisma.backupLog.create({
        data: {
          type,
          status: "erro",
          error,
          userName: type === "automatico" ? "Sistema (Cron)" : null,
        },
      })
    } catch { /* ignore logging errors */ }

    return NextResponse.json({ error }, { status: 500 })
  }
}

// DELETE: remove old backup logs (keep last N)
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keepLast = parseInt(searchParams.get("keepLast") ?? "30")

  const logs = await prisma.backupLog.findMany({
    orderBy: { createdAt: "desc" },
    skip: keepLast,
    select: { id: true },
  })

  if (logs.length > 0) {
    await prisma.backupLog.deleteMany({
      where: { id: { in: logs.map(l => l.id) } },
    })
  }

  return NextResponse.json({ deleted: logs.length })
}
