import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { password, ...data } = await req.json()
  const updateData: Record<string, unknown> = { ...data }
  if (password) updateData.password = await bcrypt.hash(password, 10)
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
  })
  return NextResponse.json(user)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
