"use client"
import { useEffect, useState } from "react"
import { FileText, CheckCircle2, Clock, ChevronDown, ChevronRight, Printer } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { formatCurrency, formatDate } from "@/lib/utils"

const STATUS_STEP: Record<string, { label: string; color: string }> = {
  pendente:  { label: "Pendente",   color: "text-slate-400" },
  comprado:  { label: "Comprado",   color: "text-blue-500" },
  entregue:  { label: "Entregue",   color: "text-amber-500" },
  instalado: { label: "Instalado",  color: "text-emerald-600" },
}

interface Pagamento { id: string; description: string; amount: number; status: string; dueDate?: string; paidDate?: string }
interface Step { label: string; status: string }
interface ProjectExtrato {
  id: string; name: string; address?: string; status: string
  startDate?: string; deliveryDate?: string
  totalContrato: number; totalPago: number; totalPendente: number
  completion: number; steps: Step[]; pagamentos: Pagamento[]
}
interface ExtratoData {
  client: { id: string; name: string; email?: string; phone?: string; address?: string }
  projects: ProjectExtrato[]
  totais: { totalGeral: number; totalPagoGeral: number; totalPendenteGeral: number }
}

function ProjectCard({ p, defaultOpen }: { p: ProjectExtrato; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          {open ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
          <div>
            <p className="font-semibold text-slate-800">{p.name}</p>
            {p.address && <p className="text-xs text-slate-400 mt-0.5">{p.address}</p>}
          </div>
        </div>
        <div className="flex items-center gap-6 text-right">
          <div>
            <p className="text-xs text-slate-400">Pago</p>
            <p className="text-sm font-bold text-emerald-600">{formatCurrency(p.totalPago)}</p>
          </div>
          <div>
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
        <div className="border-t border-slate-100 px-5 pb-5 space-y-4">
          {/* Progresso da obra */}
          <div>
            <div className="flex items-center justify-between mb-2 mt-4">
              <p className="text-sm font-semibold text-slate-700">Evolução da Obra</p>
              <span className={`text-sm font-bold ${p.completion === 100 ? "text-emerald-600" : "text-amber-600"}`}>
                {p.completion}% concluído
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all ${p.completion === 100 ? "bg-emerald-500" : "bg-amber-500"}`}
                style={{ width: `${p.completion}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {p.steps.map(s => {
                const cfg = STATUS_STEP[s.status] ?? STATUS_STEP.pendente
                return (
                  <div key={s.label} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    {s.status === "instalado"
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      : <Clock className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
                    <div>
                      <p className="text-xs font-medium text-slate-700">{s.label}</p>
                      <p className={`text-[10px] ${cfg.color}`}>{cfg.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pagamentos */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Histórico de Pagamentos</p>
            <div className="rounded-lg border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="py-2 px-3 text-left text-xs text-slate-500 font-medium">Descrição</th>
                    <th className="py-2 px-3 text-center text-xs text-slate-500 font-medium">Vencimento</th>
                    <th className="py-2 px-3 text-center text-xs text-slate-500 font-medium">Data Pgto.</th>
                    <th className="py-2 px-3 text-right text-xs text-slate-500 font-medium">Valor</th>
                    <th className="py-2 px-3 text-center text-xs text-slate-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {p.pagamentos.map(pg => (
                    <tr key={pg.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 text-slate-700 text-xs">{pg.description}</td>
                      <td className="py-2 px-3 text-center text-xs text-slate-500">{pg.dueDate ? formatDate(pg.dueDate) : "—"}</td>
                      <td className="py-2 px-3 text-center text-xs text-slate-500">{pg.paidDate ? formatDate(pg.paidDate) : "—"}</td>
                      <td className="py-2 px-3 text-right text-xs font-semibold text-slate-700">{formatCurrency(pg.amount)}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          pg.status === "pago" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {pg.status === "pago" ? "Pago" : "Pendente"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {p.pagamentos.length === 0 && (
                    <tr><td colSpan={5} className="py-4 text-center text-xs text-slate-400">Nenhum pagamento registrado</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Datas */}
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

export default function ExtratoPage() {
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [clientId, setClientId] = useState("")
  const [view, setView] = useState<"total" | "por-apartamento">("total")
  const [data, setData] = useState<ExtratoData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients)
  }, [])

  const generate = async () => {
    if (!clientId) return
    setLoading(true)
    const res = await fetch(`/api/extrato?clientId=${clientId}`)
    setData(await res.json())
    setLoading(false)
  }

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Extrato do Cliente" subtitle="Evolução da obra e resumo financeiro" />
      <div className="flex-1 p-6 space-y-6">

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Gerar Extrato</h2>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">Cliente</label>
              <select
                value={clientId}
                onChange={e => { setClientId(e.target.value); setData(null) }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:outline-none min-w-[220px]"
              >
                <option value="">Selecione o cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">Tipo de emissão</label>
              <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                <button
                  onClick={() => setView("total")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${view === "total" ? "bg-amber-500 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  Total geral
                </button>
                <button
                  onClick={() => setView("por-apartamento")}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-l border-slate-300 ${view === "por-apartamento" ? "bg-amber-500 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  Por apartamento
                </button>
              </div>
            </div>
            <button
              onClick={generate}
              disabled={!clientId || loading}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              <FileText className="h-4 w-4" />
              {loading ? "Gerando..." : "Gerar Extrato"}
            </button>
            {data && (
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Printer className="h-4 w-4" />
                Imprimir
              </button>
            )}
          </div>
        </div>

        {/* Extrato */}
        {data && (
          <div className="space-y-4 print:space-y-4" id="extrato-print">

            {/* Cabeçalho */}
            <div className="bg-slate-900 text-white rounded-xl p-5 print:rounded-none">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 font-bold text-slate-900 text-xs">L2</div>
                    <span className="font-bold text-sm">L2E Prime Solutions</span>
                  </div>
                  <h3 className="text-lg font-bold">{data.client.name}</h3>
                  {data.client.phone && <p className="text-slate-300 text-sm mt-0.5">{data.client.phone}</p>}
                  {data.client.address && <p className="text-slate-400 text-xs mt-0.5">{data.client.address}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Extrato gerado em</p>
                  <p className="text-sm font-medium">{new Date().toLocaleDateString("pt-BR")}</p>
                  <p className="text-xs text-slate-400 mt-2">{data.projects.length} projeto(s)</p>
                </div>
              </div>
            </div>

            {/* KPIs financeiros */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">Total contratado</p>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(data.totais.totalGeral)}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-center">
                <p className="text-xs text-emerald-600 mb-1">Total pago</p>
                <p className="text-xl font-bold text-emerald-700">{formatCurrency(data.totais.totalPagoGeral)}</p>
              </div>
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
                <p className="text-xs text-amber-600 mb-1">Saldo restante</p>
                <p className="text-xl font-bold text-amber-700">{formatCurrency(data.totais.totalPendenteGeral)}</p>
              </div>
            </div>

            {/* Projetos */}
            {view === "por-apartamento"
              ? data.projects.map(p => <ProjectCard key={p.id} p={p} defaultOpen={true} />)
              : <ProjectCard p={{ ...data.projects[0], name: `Resumo — ${data.client.name}`, pagamentos: data.projects.flatMap(p => p.pagamentos) } as ProjectExtrato} defaultOpen={true} />
            }
          </div>
        )}

        {!data && !loading && clientId && (
          <div className="text-center py-12 text-sm text-slate-400">
            Clique em "Gerar Extrato" para visualizar o resumo do cliente.
          </div>
        )}
        {!clientId && (
          <div className="text-center py-12 text-sm text-slate-400">
            Selecione um cliente para gerar o extrato.
          </div>
        )}
      </div>
    </div>
  )
}
