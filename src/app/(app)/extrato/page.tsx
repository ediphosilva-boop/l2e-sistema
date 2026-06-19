"use client"
import { useEffect, useState } from "react"
import { CheckCircle2, Clock, ChevronDown, ChevronRight, Printer, Building2 } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { formatCurrency, formatDate } from "@/lib/utils"

const STATUS_STEP: Record<string, { label: string; color: string; bg: string }> = {
  pendente:   { label: "Pendente",   color: "text-slate-400",   bg: "bg-slate-50" },
  comprado:   { label: "Comprado",   color: "text-blue-500",    bg: "bg-blue-50" },
  entregue:   { label: "Entregue",   color: "text-amber-500",   bg: "bg-amber-50" },
  instalado:  { label: "Instalado",  color: "text-emerald-600", bg: "bg-emerald-50" },
  naoaplica:  { label: "N/A",        color: "text-slate-300",   bg: "bg-slate-50" },
}

interface Pagamento { id: string; description: string; amount: number; status: string; dueDate?: string; paidDate?: string; paymentMethod?: string }
interface Step { label: string; status: string }
interface ApartmentExtrato {
  id: string; number: string; area?: string; bedrooms?: string; plan?: string
  totalValue: number; completion: number; steps: Step[]
}
interface ProjectExtrato {
  id: string; name: string; address?: string; status: string
  startDate?: string; deliveryDate?: string
  totalContrato: number; totalPago: number; totalPendente: number
  completion: number; steps: Step[]; apartments: ApartmentExtrato[]; pagamentos: Pagamento[]
}
interface ExtratoData {
  client: { id: string; name: string; email?: string; phone?: string; address?: string }
  projects: ProjectExtrato[]
  totais: { totalGeral: number; totalPagoGeral: number; totalPendenteGeral: number }
}

function StepGrid({ steps, compact = false }: { steps: Step[]; compact?: boolean }) {
  return (
    <div className={`grid gap-1.5 mt-2 ${compact ? "grid-cols-6" : "grid-cols-3 sm:grid-cols-6"}`}>
      {steps.map(s => {
        const cfg = STATUS_STEP[s.status] ?? STATUS_STEP.pendente
        return (
          <div key={s.label} className={`flex flex-col items-center rounded-lg px-1.5 py-1.5 ${cfg.bg}`}>
            {s.status === "instalado"
              ? <CheckCircle2 className="h-3 w-3 text-emerald-500 mb-0.5" />
              : <Clock className={`h-3 w-3 mb-0.5 ${s.status === "naoaplica" ? "text-slate-200" : "text-slate-300"}`} />}
            <p className="text-[9px] font-medium text-slate-600 leading-tight text-center">{s.label}</p>
            <p className={`text-[9px] font-semibold leading-tight ${cfg.color}`}>{cfg.label}</p>
          </div>
        )
      })}
    </div>
  )
}

function ProgressBar({ pct, label }: { pct: number; label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : "bg-amber-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-bold shrink-0 ${pct === 100 ? "text-emerald-600" : "text-amber-600"}`}>
        {label ?? `${pct}%`}
      </span>
    </div>
  )
}

function PagamentosTable({ pagamentos }: { pagamentos: Pagamento[] }) {
  return (
    <div className="rounded-lg border border-slate-100 overflow-x-auto">
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr className="bg-slate-50">
            <th className="py-2 px-3 text-left text-xs text-slate-500 font-medium">Descrição</th>
            <th className="py-2 px-3 text-center text-xs text-slate-500 font-medium">Vencimento</th>
            <th className="py-2 px-3 text-center text-xs text-slate-500 font-medium">Data Pgto.</th>
            <th className="py-2 px-3 text-center text-xs text-slate-500 font-medium">Forma</th>
            <th className="py-2 px-3 text-right text-xs text-slate-500 font-medium">Valor</th>
            <th className="py-2 px-3 text-center text-xs text-slate-500 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {pagamentos.map(pg => (
            <tr key={pg.id} className="hover:bg-slate-50/50">
              <td className="py-2 px-3 text-slate-700 text-xs">{pg.description}</td>
              <td className="py-2 px-3 text-center text-xs text-slate-500">{pg.dueDate ? formatDate(pg.dueDate) : "—"}</td>
              <td className="py-2 px-3 text-center text-xs text-slate-500">{pg.paidDate ? formatDate(pg.paidDate) : "—"}</td>
              <td className="py-2 px-3 text-center">
                {pg.paymentMethod
                  ? <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-medium">{pg.paymentMethod}</span>
                  : <span className="text-xs text-slate-300">—</span>}
              </td>
              <td className="py-2 px-3 text-right text-xs font-semibold text-slate-700">{formatCurrency(pg.amount)}</td>
              <td className="py-2 px-3 text-center">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${pg.status === "pago" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {pg.status === "pago" ? "Pago" : "Pendente"}
                </span>
              </td>
            </tr>
          ))}
          {pagamentos.length === 0 && (
            <tr><td colSpan={6} className="py-4 text-center text-xs text-slate-400">Nenhum pagamento registrado</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// Card de projeto no modo "por apartamento": expande lista de apartamentos
function ProjectCard({ p, defaultOpen }: { p: ProjectExtrato; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const hasApts = p.apartments.length > 0

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 text-left min-w-0">
          {open ? <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />}
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate">{p.name}</p>
            {p.address && <p className="text-xs text-slate-400 mt-0.5 truncate">{p.address}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 text-right shrink-0 ml-3">
          <div className="hidden sm:block">
            <p className="text-xs text-slate-400">Pago</p>
            <p className="text-sm font-bold text-emerald-600">{formatCurrency(p.totalPago)}</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs text-slate-400">Pendente</p>
            <p className="text-sm font-bold text-amber-600">{formatCurrency(p.totalPendente)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Total</p>
            <p className="text-sm font-bold text-slate-700">{formatCurrency(p.totalContrato)}</p>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-5 pb-5 space-y-5">

          {/* Evolução — por apartamento se houver, senão project-level */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-700">Evolução da Obra</p>
              <span className={`text-sm font-bold ${p.completion === 100 ? "text-emerald-600" : "text-amber-600"}`}>
                {p.completion}% concluído
              </span>
            </div>
            <ProgressBar pct={p.completion} />

            {hasApts ? (
              <div className="mt-3 space-y-3">
                {p.apartments.map(a => (
                  <div key={a.id} className="rounded-lg border border-slate-100 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-700">Apto {a.number}</span>
                        {a.bedrooms && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{a.bedrooms} dorm.</span>}
                        {a.plan && <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">{a.plan.replace("Pacote ","")}</span>}
                        {a.area && <span className="text-[10px] text-slate-400">{a.area}m²</span>}
                      </div>
                      <span className={`text-xs font-bold shrink-0 ml-2 ${a.completion === 100 ? "text-emerald-600" : "text-amber-600"}`}>
                        {a.completion}%
                      </span>
                    </div>
                    <ProgressBar pct={a.completion} />
                    <StepGrid steps={a.steps} />
                  </div>
                ))}
              </div>
            ) : (
              <StepGrid steps={p.steps} />
            )}
          </div>

          {/* Pagamentos */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Histórico de Pagamentos</p>
            <PagamentosTable pagamentos={p.pagamentos} />
          </div>

          {(p.startDate || p.deliveryDate) && (
            <div className="flex gap-4 text-xs text-slate-500">
              {p.startDate && <span>Início: <strong>{formatDate(p.startDate)}</strong></span>}
              {p.deliveryDate && <span>Entrega prevista: <strong>{formatDate(p.deliveryDate)}</strong></span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Modo consolidado: resumo por projeto + pagamentos totais (sem detalhe de apartamentos)
function ConsolidadoView({ filtered, pagamentos }: { filtered: ProjectExtrato[]; pagamentos: Pagamento[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <p className="font-semibold text-slate-800">Resumo Consolidado</p>
        <p className="text-xs text-slate-400 mt-0.5">{filtered.length} projeto(s) selecionado(s)</p>
      </div>
      <div className="px-5 pb-5 space-y-5">

        {/* Resumo por projeto */}
        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">Evolução por Projeto</p>
          <div className="space-y-2">
            {filtered.map(p => (
              <div key={p.id} className="rounded-lg border border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-700 truncate">{p.name}</p>
                    {p.address && <p className="text-[10px] text-slate-400 truncate">{p.address}</p>}
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-right text-xs">
                    <div>
                      <p className="text-slate-400">Pago</p>
                      <p className="font-bold text-emerald-600">{formatCurrency(p.totalPago)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Pendente</p>
                      <p className="font-bold text-amber-600">{formatCurrency(p.totalPendente)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Total</p>
                      <p className="font-bold text-slate-700">{formatCurrency(p.totalContrato)}</p>
                    </div>
                  </div>
                </div>
                <ProgressBar pct={p.completion} />
              </div>
            ))}
          </div>
        </div>

        {/* Todos os pagamentos */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Todos os Pagamentos</p>
          <PagamentosTable pagamentos={pagamentos} />
        </div>
      </div>
    </div>
  )
}

function printExtrato(
  data: ExtratoData,
  filtered: ProjectExtrato[],
  totais: { totalGeral: number; totalPagoGeral: number; totalPendenteGeral: number },
  view: "por-apartamento" | "consolidado"
) {
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleDateString("pt-BR") : "—"
  const stepColor: Record<string, string> = { pendente: "#94a3b8", comprado: "#3b82f6", entregue: "#f59e0b", instalado: "#10b981", naoaplica: "#cbd5e1" }
  const stepLabel: Record<string, string> = { pendente: "Pendente", comprado: "Comprado", entregue: "Entregue", instalado: "Instalado", naoaplica: "N/A" }

  const aptStepsHtml = (steps: Step[]) =>
    `<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:3px;margin-top:6px">
      ${steps.map(s => `<div style="text-align:center;padding:3px;border-radius:4px;background:${stepColor[s.status] ?? "#e2e8f0"}18;border:1px solid ${stepColor[s.status] ?? "#e2e8f0"}40">
        <div style="font-size:8px;color:#64748b">${s.label}</div>
        <div style="font-size:8px;font-weight:600;color:${stepColor[s.status] ?? "#64748b"}">${stepLabel[s.status] ?? s.status}</div>
      </div>`).join("")}
    </div>`

  const pagamentosHtml = (pagamentos: Pagamento[]) =>
    `<table style="width:100%;border-collapse:collapse;font-size:11px;margin-top:8px">
      <thead><tr style="background:#f8fafc">
        <th style="text-align:left;padding:5px 8px;color:#64748b;border-bottom:1px solid #e2e8f0">Descrição</th>
        <th style="text-align:center;padding:5px 8px;color:#64748b;border-bottom:1px solid #e2e8f0">Vencimento</th>
        <th style="text-align:center;padding:5px 8px;color:#64748b;border-bottom:1px solid #e2e8f0">Pgto</th>
        <th style="text-align:center;padding:5px 8px;color:#64748b;border-bottom:1px solid #e2e8f0">Forma</th>
        <th style="text-align:right;padding:5px 8px;color:#64748b;border-bottom:1px solid #e2e8f0">Valor</th>
        <th style="text-align:center;padding:5px 8px;color:#64748b;border-bottom:1px solid #e2e8f0">Status</th>
      </tr></thead>
      <tbody>
        ${pagamentos.map(pg => `<tr style="border-bottom:1px solid #f1f5f9">
          <td style="padding:4px 8px;color:#334155">${pg.description}</td>
          <td style="padding:4px 8px;text-align:center;color:#64748b">${fmtDate(pg.dueDate)}</td>
          <td style="padding:4px 8px;text-align:center;color:#64748b">${fmtDate(pg.paidDate)}</td>
          <td style="padding:4px 8px;text-align:center;font-size:10px;color:#475569">${pg.paymentMethod || "—"}</td>
          <td style="padding:4px 8px;text-align:right;font-weight:600;color:#334155">${fmt(pg.amount)}</td>
          <td style="padding:4px 8px;text-align:center"><span style="font-size:9px;padding:1px 6px;border-radius:9999px;background:${pg.status==="pago"?"#dcfce7":"#fef3c7"};color:${pg.status==="pago"?"#16a34a":"#92400e"}">${pg.status==="pago"?"Pago":"Pendente"}</span></td>
        </tr>`).join("")}
        ${pagamentos.length === 0 ? `<tr><td colspan="6" style="padding:8px;text-align:center;color:#94a3b8">Nenhum pagamento</td></tr>` : ""}
      </tbody>
    </table>`

  const progressBar = (pct: number) =>
    `<div style="height:5px;background:#e2e8f0;border-radius:3px;margin:4px 0">
      <div style="height:5px;background:${pct===100?"#10b981":"#f59e0b"};border-radius:3px;width:${pct}%"></div>
    </div>`

  let bodyHtml = ""

  if (view === "por-apartamento") {
    bodyHtml = filtered.map(p => {
      const hasApts = p.apartments.length > 0
      return `
        <div style="margin-bottom:20px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
          <div style="background:#f8fafc;padding:10px 14px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center">
            <div>
              <strong style="color:#1e293b">${p.name}</strong>
              ${p.address ? `<div style="font-size:10px;color:#64748b">${p.address}</div>` : ""}
            </div>
            <div style="display:flex;gap:20px;text-align:right;font-size:11px">
              <div><div style="color:#64748b">Pago</div><strong style="color:#16a34a">${fmt(p.totalPago)}</strong></div>
              <div><div style="color:#64748b">Pendente</div><strong style="color:#d97706">${fmt(p.totalPendente)}</strong></div>
              <div><div style="color:#64748b">Total</div><strong>${fmt(p.totalContrato)}</strong></div>
            </div>
          </div>
          <div style="padding:10px 14px">
            <div style="font-size:10px;font-weight:600;color:#64748b;margin-bottom:4px">EVOLUÇÃO — ${p.completion}% concluído</div>
            ${progressBar(p.completion)}
            ${hasApts
              ? p.apartments.map(a => `
                  <div style="margin:8px 0;padding:8px;border:1px solid #f1f5f9;border-radius:6px">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
                      <span style="font-size:11px;font-weight:600">Apto ${a.number}${a.bedrooms ? ` · ${a.bedrooms} dorm.` : ""}${a.plan ? ` · ${a.plan.replace("Pacote ","")}` : ""}</span>
                      <span style="font-size:11px;font-weight:bold;color:${a.completion===100?"#16a34a":"#d97706"}">${a.completion}%</span>
                    </div>
                    ${progressBar(a.completion)}
                    ${aptStepsHtml(a.steps)}
                  </div>
                `).join("")
              : aptStepsHtml(p.steps)}
            <div style="font-size:10px;font-weight:600;color:#64748b;margin:12px 0 4px">PAGAMENTOS</div>
            ${pagamentosHtml(p.pagamentos)}
          </div>
        </div>
      `
    }).join("")
  } else {
    const allPagamentos = filtered.flatMap(p => p.pagamentos)

    bodyHtml = `
      <div style="margin-bottom:16px">
        <div style="font-size:12px;font-weight:600;color:#64748b;margin-bottom:8px">EVOLUÇÃO POR PROJETO</div>
        ${filtered.map(p => `
          <div style="padding:10px 12px;border:1px solid #e2e8f0;border-radius:6px;margin-bottom:6px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
              <div>
                <div style="font-size:12px;font-weight:600;color:#1e293b">${p.name}</div>
                ${p.address ? `<div style="font-size:10px;color:#64748b">${p.address}</div>` : ""}
              </div>
              <div style="display:flex;gap:16px;text-align:right;font-size:11px;flex-shrink:0;margin-left:12px">
                <div><div style="color:#64748b">Pago</div><strong style="color:#16a34a">${fmt(p.totalPago)}</strong></div>
                <div><div style="color:#64748b">Pendente</div><strong style="color:#d97706">${fmt(p.totalPendente)}</strong></div>
                <div><div style="color:#64748b">Total</div><strong>${fmt(p.totalContrato)}</strong></div>
              </div>
            </div>
            ${progressBar(p.completion)}
            <div style="text-align:right;font-size:10px;font-weight:bold;color:${p.completion===100?"#16a34a":"#d97706"};margin-top:2px">${p.completion}% concluído</div>
          </div>
        `).join("")}
      </div>
      <div style="font-size:12px;font-weight:600;color:#64748b;margin-bottom:6px">TODOS OS PAGAMENTOS</div>
      ${pagamentosHtml(allPagamentos)}
    `
  }

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
    <title>Extrato — ${data.client.name}</title>
    <style>* { box-sizing:border-box;margin:0;padding:0 } body { font-family:Arial,sans-serif;color:#1e293b;font-size:13px;padding:28px;max-width:900px;margin:0 auto } @media print { body { padding:16px } }</style>
  </head><body>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:14px;border-bottom:2px solid #f59e0b">
      <div style="display:flex;align-items:center;gap:12px">
        <img src="${window.location.origin}/logo-l2e.png" style="height:44px;object-fit:contain" alt="L2E" />
        <div>
          <div style="font-size:15px;font-weight:bold">L2E Prime Solutions</div>
          <div style="font-size:11px;color:#64748b">Acabamento Completo de Apartamentos</div>
        </div>
      </div>
      <div style="text-align:right;font-size:11px;color:#64748b">
        <div>Emitido em: <strong>${new Date().toLocaleDateString("pt-BR")}</strong></div>
        <div>${filtered.length} projeto(s) selecionado(s)</div>
      </div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:16px;font-weight:bold">${data.client.name}</div>
      ${data.client.phone ? `<div style="font-size:11px;color:#64748b">${data.client.phone}</div>` : ""}
      ${data.client.address ? `<div style="font-size:11px;color:#64748b">${data.client.address}</div>` : ""}
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">
      <div style="border:1px solid #e2e8f0;border-radius:6px;padding:10px;text-align:center">
        <div style="font-size:10px;color:#64748b;margin-bottom:3px">Total contratado</div>
        <div style="font-size:16px;font-weight:bold">${fmt(totais.totalGeral)}</div>
      </div>
      <div style="border:1px solid #bbf7d0;border-radius:6px;padding:10px;text-align:center;background:#f0fdf4">
        <div style="font-size:10px;color:#16a34a;margin-bottom:3px">Total pago</div>
        <div style="font-size:16px;font-weight:bold;color:#16a34a">${fmt(totais.totalPagoGeral)}</div>
      </div>
      <div style="border:1px solid #fde68a;border-radius:6px;padding:10px;text-align:center;background:#fffbeb">
        <div style="font-size:10px;color:#d97706;margin-bottom:3px">Saldo pendente</div>
        <div style="font-size:16px;font-weight:bold;color:#d97706">${fmt(totais.totalPendenteGeral)}</div>
      </div>
    </div>
    ${bodyHtml}
    <div style="margin-top:32px;border-top:1px solid #e2e8f0;padding-top:10px;text-align:center;font-size:10px;color:#94a3b8">
      L2E Prime Solutions · Documento gerado em ${new Date().toLocaleString("pt-BR")}
    </div>
  </body></html>`

  const w = window.open("", "_blank", "width=960,height=800")
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.onload = () => { w.focus(); w.print() }
}

export default function ExtratoPage() {
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [clientId, setClientId] = useState("")
  const [view, setView] = useState<"por-apartamento" | "consolidado">("por-apartamento")
  const [data, setData] = useState<ExtratoData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients)
  }, [])

  const handleClientChange = async (id: string) => {
    setClientId(id)
    setData(null)
    setSelectedProjects([])
    if (!id) return
    setLoading(true)
    const res = await fetch(`/api/extrato?clientId=${id}`)
    const d = await res.json()
    setData(d)
    setSelectedProjects(d.projects.map((p: ProjectExtrato) => p.id))
    setLoading(false)
  }

  const toggleProject = (id: string) =>
    setSelectedProjects(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const toggleAll = () => {
    if (!data) return
    setSelectedProjects(selectedProjects.length === data.projects.length ? [] : data.projects.map(p => p.id))
  }

  const filtered = data?.projects.filter(p => selectedProjects.includes(p.id)) ?? []
  const totaisFiltrados = {
    totalGeral: filtered.reduce((s, p) => s + p.totalContrato, 0),
    totalPagoGeral: filtered.reduce((s, p) => s + p.totalPago, 0),
    totalPendenteGeral: filtered.reduce((s, p) => s + p.totalPendente, 0),
  }
  const allPagamentos = filtered.flatMap(p => p.pagamentos)

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Extrato do Cliente" subtitle="Evolução da obra e resumo financeiro" />
      <div className="flex-1 p-3 sm:p-6 space-y-4 sm:space-y-5">

        {/* Painel de filtros */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Configurar Extrato</h2>

          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">Cliente</label>
              <select
                value={clientId}
                onChange={e => handleClientChange(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:outline-none min-w-[200px]"
              >
                <option value="">Selecione o cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {data && filtered.length > 0 && (
              <div>
                <label className="block text-xs text-slate-500 mb-1.5 font-medium">Visualização</label>
                <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                  <button
                    onClick={() => setView("por-apartamento")}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${view === "por-apartamento" ? "bg-amber-500 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    Por apartamento
                  </button>
                  <button
                    onClick={() => setView("consolidado")}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-l border-slate-300 ${view === "consolidado" ? "bg-amber-500 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    Consolidado
                  </button>
                </div>
              </div>
            )}

            {data && filtered.length > 0 && (
              <button
                onClick={() => printExtrato(data, filtered, totaisFiltrados, view)}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Printer className="h-4 w-4" />
                Imprimir
              </button>
            )}
          </div>

          {/* Seleção de projetos */}
          {data && data.projects.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-slate-500 font-medium">
                  Projetos — selecione quais incluir
                </label>
                <button onClick={toggleAll} className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                  {selectedProjects.length === data.projects.length ? "Desmarcar todos" : "Selecionar todos"}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {data.projects.map(p => {
                  const selected = selectedProjects.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleProject(p.id)}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${selected ? "border-amber-400 bg-amber-50 ring-1 ring-amber-300" : "border-slate-200 bg-white hover:border-slate-300"}`}
                    >
                      <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${selected ? "border-amber-500 bg-amber-500" : "border-slate-300"}`}>
                        {selected && <span className="text-white text-[10px] font-bold">✓</span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="h-1 w-14 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${p.completion}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-500">{p.completion}%</span>
                          {p.apartments.length > 0 && <span className="text-[10px] text-slate-400">{p.apartments.length} apto(s)</span>}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-bold text-slate-700">{formatCurrency(p.totalContrato)}</p>
                        <p className="text-[10px] text-emerald-600">{formatCurrency(p.totalPago)} pago</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Extrato */}
        {data && filtered.length > 0 && (
          <div className="space-y-4">
            {/* Cabeçalho cliente */}
            <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo-l2e.png" alt="L2E" className="h-7 object-contain brightness-0 invert" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold">{data.client.name}</h3>
                  {data.client.phone && <p className="text-slate-300 text-sm mt-0.5">{data.client.phone}</p>}
                  {data.client.address && <p className="text-slate-400 text-xs mt-0.5">{data.client.address}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-400">Extrato gerado em</p>
                  <p className="text-sm font-medium">{new Date().toLocaleDateString("pt-BR")}</p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 justify-end">
                    <Building2 className="h-3 w-3" />{filtered.length} projeto(s)
                  </p>
                </div>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 text-center">
                <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Total contratado</p>
                <p className="text-base sm:text-xl font-bold text-slate-800">{formatCurrency(totaisFiltrados.totalGeral)}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3 sm:p-4 text-center">
                <p className="text-[10px] sm:text-xs text-emerald-600 mb-1">Total pago</p>
                <p className="text-base sm:text-xl font-bold text-emerald-700">{formatCurrency(totaisFiltrados.totalPagoGeral)}</p>
              </div>
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-3 sm:p-4 text-center">
                <p className="text-[10px] sm:text-xs text-amber-600 mb-1">Saldo restante</p>
                <p className="text-base sm:text-xl font-bold text-amber-700">{formatCurrency(totaisFiltrados.totalPendenteGeral)}</p>
              </div>
            </div>

            {/* Conteúdo */}
            {view === "por-apartamento"
              ? filtered.map(p => <ProjectCard key={p.id} p={p} defaultOpen={filtered.length === 1} />)
              : <ConsolidadoView filtered={filtered} pagamentos={allPagamentos} />
            }
          </div>
        )}

        {loading && <div className="text-center py-12 text-sm text-slate-400">Carregando projetos...</div>}
        {!clientId && <div className="text-center py-12 text-sm text-slate-400">Selecione um cliente para começar.</div>}
        {data && filtered.length === 0 && !loading && (
          <div className="text-center py-12 text-sm text-slate-400">Selecione ao menos um projeto para gerar o extrato.</div>
        )}
      </div>
    </div>
  )
}
