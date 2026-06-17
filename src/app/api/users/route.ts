import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
  })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const { password, ...data } = await req.json()
  const hashed = password ? await bcrypt.hash(password, 10) : await bcrypt.hash("l2e@2026", 10)
  const user = await prisma.user.create({
    data: { ...data, password: hashed },
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
  })
  return NextResponse.json(user)
}
