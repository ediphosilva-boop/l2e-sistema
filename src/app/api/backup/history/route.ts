import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAuthorizedCronOrSession } from "@/lib/cronAuth"

export async function GET(req: NextRequest) {
  if (!(await isAuthorizedCronOrSession(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "50")
  const logs = await prisma.backupLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true, type: true, status: true, tables: true,
      records: true, sizeBytes: true, error: true,
      userName: true, createdAt: true,
      data: false,
    },
  })
  return NextResponse.json(logs)
}
