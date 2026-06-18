import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const ALLOWED = ["type","category","description","amount","dueDate","paidDate","status","invoiceNumber","notes","projectId","supplierId","clientId"]

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const raw = await req.json()
    const data: Record<string, unknown> = {}
    for (const key of ALLOWED) if (key in raw) data[key] = raw[key]
    // convert empty strings to null for optional fields
    for (const key of ["category","dueDate","paidDate","invoiceNumber","notes","projectId","supplierId","clientId"]) {
      if (data[key] === "") data[key] = null
    }
    // convert date strings to ISO DateTime
    for (const key of ["dueDate","paidDate"]) {
      if (data[key] && typeof data[key] === "string" && !/T/.test(data[key] as string)) {
        data[key] = new Date(data[key] as string).toISOString()
      }
    }
    if (data.amount !== undefined) data.amount = parseFloat(String(data.amount)) || 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = await prisma.transaction.update({ where: { id }, data: data as any })
    return NextResponse.json(t)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.transaction.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
