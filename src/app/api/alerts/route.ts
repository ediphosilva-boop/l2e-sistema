import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const ALERT_EMAILS = (process.env.ALERT_EMAIL ?? "ediphosilva@gmail.com").split(",").map(e => e.trim()).filter(Boolean)
const FROM_EMAIL = process.env.RESEND_FROM ?? "L2E Sistema <onboarding@resend.dev>"

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" })
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  const isCron = !!authHeader
  if (isCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().slice(0, 10)

  const todayStart = new Date(todayStr + "T00:00:00.000Z")
  const todayEnd = new Date(todayStr + "T23:59:59.999Z")
  const tomorrowStart = new Date(tomorrowStr + "T00:00:00.000Z")
  const tomorrowEnd = new Date(tomorrowStr + "T23:59:59.999Z")

  const [venceHoje, venceAmanha] = await Promise.all([
    prisma.transaction.findMany({
      where: { status: "pendente", dueDate: { gte: todayStart, lte: todayEnd } },
      include: { project: { select: { name: true } }, supplier: { select: { name: true } }, client: { select: { name: true } } },
      orderBy: { amount: "desc" },
    }),
    prisma.transaction.findMany({
      where: { status: "pendente", dueDate: { gte: tomorrowStart, lte: tomorrowEnd } },
      include: { project: { select: { name: true } }, supplier: { select: { name: true } }, client: { select: { name: true } } },
      orderBy: { amount: "desc" },
    }),
  ])

  const vencidos = await prisma.transaction.findMany({
    where: { status: "pendente", dueDate: { lt: todayStart } },
    include: { project: { select: { name: true } }, supplier: { select: { name: true } }, client: { select: { name: true } } },
    orderBy: { dueDate: "asc" },
  })

  const totalItems = venceHoje.length + venceAmanha.length + vencidos.length

  if (totalItems === 0) {
    return NextResponse.json({ ok: true, message: "Nenhum alerta para enviar", sent: false })
  }

  const buildRow = (t: typeof venceHoje[0]) => {
    const who = t.supplier?.name ?? t.client?.name ?? "—"
    const proj = t.project?.name ?? ""
    const tipo = t.type === "entrada" ? "🟢 Receber" : "🔴 Pagar"
    return `<tr>
      <td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;font-size:13px">${t.description}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b">${who}${proj ? ` · ${proj}` : ""}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;font-size:13px;text-align:center">${t.dueDate ? fmtDate(new Date(t.dueDate)) : "—"}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;font-size:13px;text-align:right;font-weight:600;color:${t.type === "entrada" ? "#16a34a" : "#dc2626"}">${formatBRL(t.amount)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;font-size:12px;text-align:center">${tipo}</td>
    </tr>`
  }

  const tableHeader = `<table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif">
    <thead><tr style="background:#f8fafc">
      <th style="padding:8px 10px;text-align:left;font-size:11px;color:#64748b;border-bottom:2px solid #e2e8f0">Descrição</th>
      <th style="padding:8px 10px;text-align:left;font-size:11px;color:#64748b;border-bottom:2px solid #e2e8f0">Fornecedor/Cliente</th>
      <th style="padding:8px 10px;text-align:center;font-size:11px;color:#64748b;border-bottom:2px solid #e2e8f0">Vencimento</th>
      <th style="padding:8px 10px;text-align:right;font-size:11px;color:#64748b;border-bottom:2px solid #e2e8f0">Valor</th>
      <th style="padding:8px 10px;text-align:center;font-size:11px;color:#64748b;border-bottom:2px solid #e2e8f0">Tipo</th>
    </tr></thead><tbody>`
  const tableFooter = `</tbody></table>`

  const sections: string[] = []

  if (vencidos.length > 0) {
    const total = vencidos.reduce((s, t) => s + t.amount, 0)
    sections.push(`
      <div style="margin-bottom:20px">
        <h2 style="font-size:15px;color:#dc2626;margin-bottom:8px">⚠️ Vencidos — ${vencidos.length} item(ns) · ${formatBRL(total)}</h2>
        ${tableHeader}${vencidos.map(buildRow).join("")}${tableFooter}
      </div>
    `)
  }

  if (venceHoje.length > 0) {
    const total = venceHoje.reduce((s, t) => s + t.amount, 0)
    sections.push(`
      <div style="margin-bottom:20px">
        <h2 style="font-size:15px;color:#d97706;margin-bottom:8px">📅 Vencem HOJE (${fmtDate(now)}) — ${venceHoje.length} item(ns) · ${formatBRL(total)}</h2>
        ${tableHeader}${venceHoje.map(buildRow).join("")}${tableFooter}
      </div>
    `)
  }

  if (venceAmanha.length > 0) {
    const total = venceAmanha.reduce((s, t) => s + t.amount, 0)
    sections.push(`
      <div style="margin-bottom:20px">
        <h2 style="font-size:15px;color:#2563eb;margin-bottom:8px">🔔 Vencem AMANHÃ (${fmtDate(tomorrow)}) — ${venceAmanha.length} item(ns) · ${formatBRL(total)}</h2>
        ${tableHeader}${venceAmanha.map(buildRow).join("")}${tableFooter}
      </div>
    `)
  }

  const subject = `L2E Alertas: ${vencidos.length > 0 ? `${vencidos.length} vencido(s), ` : ""}${venceHoje.length > 0 ? `${venceHoje.length} vence(m) hoje, ` : ""}${venceAmanha.length > 0 ? `${venceAmanha.length} vence(m) amanhã` : ""}`.replace(/, $/, "")

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:20px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:12px;border-bottom:3px solid #f59e0b">
        <div>
          <div style="font-size:18px;font-weight:bold;color:#111">L2E Prime Solutions</div>
          <div style="font-size:12px;color:#64748b">Alerta de Vencimentos — ${fmtDate(now)}</div>
        </div>
      </div>
      ${sections.join("")}
      <div style="margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#94a3b8">
        Este é um alerta automático do sistema L2E Prime Solutions
      </div>
    </div>
  `

  let emailSent = false
  let emailError: string | null = null

  if (resend) {
    try {
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: ALERT_EMAILS,
        subject,
        html,
      })
      if (result.error) {
        emailError = `${result.error.name}: ${result.error.message}`
      } else {
        emailSent = true
      }
    } catch (e: unknown) {
      emailError = e instanceof Error ? e.message : String(e)
    }
  } else {
    emailError = "RESEND_API_KEY não configurada"
  }

  // Save alert as notification record
  await prisma.backupLog.create({
    data: {
      type: "alerta",
      status: emailSent ? "sucesso" : (resend ? "erro" : "sucesso"),
      tables: totalItems,
      records: vencidos.length,
      sizeBytes: 0,
      error: emailError,
      userName: "Sistema (Alerta Vencimentos)",
      data: JSON.stringify({
        vencidos: vencidos.length,
        venceHoje: venceHoje.length,
        venceAmanha: venceAmanha.length,
        emailSent,
      }),
    },
  })

  return NextResponse.json({
    ok: true,
    vencidos: vencidos.length,
    venceHoje: venceHoje.length,
    venceAmanha: venceAmanha.length,
    emailSent,
    emailError,
    alertData: { subject, totalItems },
  })
}
