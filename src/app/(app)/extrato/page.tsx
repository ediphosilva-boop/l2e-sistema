"use client"
import { useEffect, useState } from "react"
import { FileText, CheckCircle2, Clock, ChevronDown, ChevronRight, Printer, Building2 } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { formatCurrency, formatDate } from "@/lib/utils"

const STATUS_STEP: Record<string, { label: string; color: string; bg: string }> = {
  pendente:  { label: "Pendente",  color: "text-slate-400",   bg: "bg-slate-50" },
  comprado:  { label: "Comprado",  color: "text-blue-500",    bg: "bg-blue-50" },
  entregue:  { label: "Entregue",  color: "text-amber-500",   bg: "bg-amber-50" },
  instalado: { label: "Instalado", color: "text-emerald-600", bg: "bg-emerald-50" },
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

function StepGrid({ steps }: { steps: Step[] }) {
  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {steps.map(s => {
        const cfg = STATUS_STEP[s.status] ?? STATUS_STEP.pendente
        return (
          <div key={s.label} className={`flex items-center gap-2 rounded-lg px-3 py-2 ${cfg.bg}`}>
            {s.status === "instalado"
              ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              : <Clock className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
            <div>
              <p className="text-xs font-medium text-slate-700">{s.label}</p>
              <p className={`text-[10px] font-medium ${cfg.color}`}>{cfg.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PagamentosTable({ pagamentos }: { pagamentos: Pagamento[] }) {
  return (
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
          {pagamentos.map(pg => (
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
          {pagamentos.length === 0 && (
            <tr><td colSpan={5} className="py-4 text-center text-xs text-slate-400">Nenhum pagamento registrado</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
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
          {/* Evolução */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-700">Evolução da Obra</p>
              <span className={`text-sm font-bold ${p.completion === 100 ? "text-emerald-600" : "text-amber-600"}`}>
                {p.completion}% concluído
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${p.completion === 100 ? "bg-emerald-500" : "bg-amber-500"}`}
                style={{ width: `${p.completion}%` }}
              />
            </div>
            <StepGrid steps={p.steps} />
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

export default function ExtratoPage() {
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [clientId, setClientId] = useState("")
  const [view, setView] = useState<"total" | "por-apartamento">("por-apartamento")
  const [data, setData] = useState<ExtratoData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients)
  }, [])

  // Ao trocar cliente, carrega os projetos dele automaticamente
  const handleClientChange = async (id: string) => {
    setClientId(id)
    setData(null)
    setSelectedProjects([])
    if (!id) return
    setLoading(true)
    const res = await fetch(`/api/extrato?clientId=${id}`)
    const d = await res.json()
    setData(d)
    // seleciona todos por padrão
    setSelectedProjects(d.projects.map((p: ProjectExtrato) => p.id))
    setLoading(false)
  }

  const toggleProject = (id: string) => {
    setSelectedProjects(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (!data) return
    setSelectedProjects(
      selectedProjects.length === data.projects.length ? [] : data.projects.map(p => p.id)
    )
  }

  // Projetos filtrados pela seleção
  const filtered = data?.projects.filter(p => selectedProjects.includes(p.id)) ?? []

  const totaisFiltrados = {
    totalGeral: filtered.reduce((s, p) => s + p.totalContrato, 0),
    totalPagoGeral: filtered.reduce((s, p) => s + p.totalPago, 0),
    totalPendenteGeral: filtered.reduce((s, p) => s + p.totalPendente, 0),
  }

  // Resumo consolidado (para view "total geral")
  const resumoConsolidado: ProjectExtrato | null = filtered.length > 0 ? {
    id: "consolidado",
    name: `Resumo consolidado — ${filtered.length} apartamento(s)`,
    totalContrato: totaisFiltrados.totalGeral,
    totalPago: totaisFiltrados.totalPagoGeral,
    totalPendente: totaisFiltrados.totalPendenteGeral,
    completion: Math.round(filtered.reduce((s, p) => s + p.completion, 0) / filtered.length),
    steps: [],
    pagamentos: filtered.flatMap(p => p.pagamentos),
    status: "execucao",
  } : null

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Extrato do Cliente" subtitle="Evolução da obra e resumo financeiro" />
      <div className="flex-1 p-6 space-y-5">

        {/* Painel de filtros */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Configurar Extrato</h2>

          <div className="flex flex-wrap gap-4 items-end">
            {/* Cliente */}
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">Cliente</label>
              <select
                value={clientId}
                onChange={e => handleClientChange(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:outline-none min-w-[220px]"
              >
                <option value="">Selecione o cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Tipo de emissão */}
            {data && filtered.length > 0 && (
              <div>
                <label className="block text-xs text-slate-500 mb-1.5 font-medium">Tipo de emissão</label>
                <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                  <button
                    onClick={() => setView("por-apartamento")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${view === "por-apartamento" ? "bg-amber-500 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    Por apartamento
                  </button>
                  <button
                    onClick={() => setView("total")}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-l border-slate-300 ${view === "total" ? "bg-amber-500 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    Total consolidado
                  </button>
                </div>
              </div>
            )}

            {data && filtered.length > 0 && (
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Printer className="h-4 w-4" />
                Imprimir
              </button>
            )}
          </div>

          {/* Seleção de apartamentos */}
          {data && data.projects.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-slate-500 font-medium">
                  Apartamentos / Projetos — selecione quais incluir no extrato
                </label>
                <button
                  onClick={toggleAll}
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                >
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
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
                        selected
                          ? "border-amber-400 bg-amber-50 ring-1 ring-amber-300"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                        selected ? "border-amber-500 bg-amber-500" : "border-slate-300"
                      }`}>
                        {selected && <span className="text-white text-[10px] font-bold">✓</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{p.address ?? "—"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="h-1 w-16 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${p.completion}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-500">{p.completion}%</span>
                        </div>
                      </div>
                      <div className="ml-auto shrink-0 text-right">
                        <p className="text-xs font-bold text-slate-700">{formatCurrency(p.totalContrato)}</p>
                        <p className="text-[10px] text-emerald-600">{formatCurrency(p.totalPago)} pago</p>
                      </div>
                    </button>
                  )
                })}
              </div>
              {selectedProjects.length === 0 && (
                <p className="text-xs text-slate-400 mt-2">Selecione ao menos um apartamento para gerar o extrato.</p>
              )}
            </div>
          )}
        </div>

        {/* Extrato gerado */}
        {data && filtered.length > 0 && (
          <div className="space-y-4" id="extrato-print">

            {/* Cabeçalho */}
            <div className="bg-slate-900 text-white rounded-xl p-5">
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
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 justify-end">
                    <Building2 className="h-3 w-3" />
                    {filtered.length} apartamento(s) selecionado(s)
                  </p>
                </div>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">Total contratado</p>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(totaisFiltrados.totalGeral)}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-center">
                <p className="text-xs text-emerald-600 mb-1">Total pago</p>
                <p className="text-xl font-bold text-emerald-700">{formatCurrency(totaisFiltrados.totalPagoGeral)}</p>
              </div>
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
                <p className="text-xs text-amber-600 mb-1">Saldo restante</p>
                <p className="text-xl font-bold text-amber-700">{formatCurrency(totaisFiltrados.totalPendenteGeral)}</p>
              </div>
            </div>

            {/* Conteúdo por modo */}
            {view === "por-apartamento" ? (
              filtered.map(p => <ProjectCard key={p.id} p={p} defaultOpen={filtered.length === 1} />)
            ) : resumoConsolidado ? (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <p className="font-semibold text-slate-800">{resumoConsolidado.name}</p>
                </div>
                <div className="px-5 pb-5 space-y-4">
                  {/* Evolução por apartamento no modo total */}
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Evolução por Apartamento</p>
                    <div className="space-y-3">
                      {filtered.map(p => (
                        <div key={p.id} className="rounded-lg border border-slate-100 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-slate-700 truncate">{p.name}</p>
                            <span className={`text-xs font-bold shrink-0 ml-2 ${p.completion === 100 ? "text-emerald-600" : "text-amber-600"}`}>
                              {p.completion}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                            <div
                              className={`h-full rounded-full ${p.completion === 100 ? "bg-emerald-500" : "bg-amber-500"}`}
                              style={{ width: `${p.completion}%` }}
                            />
                          </div>
                          <div className="grid grid-cols-6 gap-1">
                            {p.steps.map(s => {
                              const cfg = STATUS_STEP[s.status] ?? STATUS_STEP.pendente
                              return (
                                <div key={s.label} className={`rounded px-1.5 py-1 text-center ${cfg.bg}`}>
                                  <p className="text-[9px] text-slate-500 leading-tight">{s.label}</p>
                                  <p className={`text-[9px] font-semibold leading-tight ${cfg.color}`}>{cfg.label}</p>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pagamentos consolidados */}
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Todos os Pagamentos</p>
                    <PagamentosTable pagamentos={resumoConsolidado.pagamentos} />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-sm text-slate-400">Carregando projetos...</div>
        )}
        {!clientId && (
          <div className="text-center py-12 text-sm text-slate-400">Selecione um cliente para começar.</div>
        )}
        {data && filtered.length === 0 && !loading && (
          <div className="text-center py-12 text-sm text-slate-400">Selecione ao menos um apartamento para gerar o extrato.</div>
        )}
      </div>
    </div>
  )
}
