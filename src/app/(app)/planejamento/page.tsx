"use client"
import { useEffect, useState } from "react"
import { Check, X } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { formatDate, calcStepCompletion } from "@/lib/utils"

const STEPS = [
  { key: "stepEletrica",         label: "Elétrica",         dateKey: "stepEletricaDate" },
  { key: "stepPintura",          label: "Pintura",           dateKey: "stepPinturaDate" },
  { key: "stepAcabamentos",      label: "Acabamentos",       dateKey: "stepAcabamentosDate" },
  { key: "stepMoveis",           label: "Móveis",            dateKey: "stepMoveisDate" },
  { key: "stepEletrodomesticos", label: "Eletrodomésticos",  dateKey: "stepEletrodomesticosDate" },
  { key: "stepPersonalizacao",   label: "Personalização",    dateKey: "stepPersonalizacaoDate" },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  pendente:   { label: "Pendente",   color: "text-slate-400",   dot: "bg-slate-300" },
  comprado:   { label: "Comprado",   color: "text-yellow-600",  dot: "bg-yellow-400" },
  entregue:   { label: "Entregue",   color: "text-blue-600",    dot: "bg-blue-400" },
  instalado:  { label: "Instalado",  color: "text-emerald-600", dot: "bg-emerald-400" },
  naoaplica:  { label: "Não aplica", color: "text-slate-300",   dot: "bg-slate-200" },
}

interface Apartment {
  id: string; projectId: string; number: string; plan?: string; area?: number; bedrooms?: number; totalValue: number
  stepEletrica: string; stepPintura: string; stepAcabamentos: string
  stepMoveis: string; stepEletrodomesticos: string; stepPersonalizacao: string
  stepEletricaDate?: string; stepPinturaDate?: string; stepAcabamentosDate?: string
  stepMoveisDate?: string; stepEletrodomesticosDate?: string; stepPersonalizacaoDate?: string
  project: { id: string; name: string; status: string; deliveryDate?: string; client?: { name: string } }
}

function StepCell({ status, date, aptId, stepKey, dateKey, onSave }: {
  status: string; date?: string; aptId: string; stepKey: string; dateKey: string
  onSave: (id: string, data: Record<string, string>) => void
}) {
  const [editing, setEditing] = useState(false)
  const [newStatus, setNewStatus] = useState(status)
  const [newDate, setNewDate] = useState(date ? date.split("T")[0] : "")
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pendente

  const save = () => {
    onSave(aptId, { [stepKey]: newStatus, [dateKey]: newDate ? new Date(newDate).toISOString() : "" })
    setEditing(false)
  }

  if (editing) {
    return (
      <td className="p-1.5">
        <div className="flex flex-col gap-1 min-w-[120px]">
          <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
            className="rounded border border-slate-300 text-xs px-1.5 py-1 bg-white">
            {Object.entries(STATUS_CONFIG).map(([v, { label }]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
          <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
            className="rounded border border-slate-300 text-xs px-1.5 py-1 bg-white" />
          <div className="flex gap-1">
            <button onClick={save} className="flex-1 rounded bg-amber-500 text-white text-xs py-1 flex items-center justify-center hover:bg-amber-600">
              <Check className="h-3 w-3" />
            </button>
            <button onClick={() => setEditing(false)} className="flex-1 rounded bg-slate-200 text-slate-600 text-xs py-1 flex items-center justify-center">
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      </td>
    )
  }

  return (
    <td className="p-1.5">
      <button
        onClick={() => { setNewStatus(status); setNewDate(date ? date.split("T")[0] : ""); setEditing(true) }}
        className="flex flex-col items-center gap-0.5 w-full rounded-lg px-2 py-1.5 hover:bg-slate-100 transition-all group"
      >
        <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${cfg.color}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
        {date && status !== "naoaplica" && (
          <span className="text-[9px] text-slate-400">{formatDate(date)}</span>
        )}
      </button>
    </td>
  )
}

export default function PlanejamentoPage() {
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [filter, setFilter] = useState("todos")
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const load = () => fetch("/api/apartments").then(r => r.json()).then(setApartments)
  useEffect(() => { load() }, [])

  const saveStep = async (id: string, data: Record<string, string>) => {
    await fetch(`/api/apartments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    await load()
  }

  const filtered = apartments.filter(a =>
    filter === "todos" ? true : a.project?.status === filter
  )

  // group by project
  const byProject = filtered.reduce<Record<string, Apartment[]>>((acc, a) => {
    const key = a.projectId
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {})

  const toggleCollapse = (projectId: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(projectId)) next.delete(projectId)
      else next.add(projectId)
      return next
    })
  }

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Cronograma" subtitle="Planejamento de entrega por apartamento" />
      <div className="flex-1 p-6 space-y-4">

        <div className="flex gap-2 flex-wrap">
          {[
            { v: "todos", l: "Todos" },
            { v: "orcamento", l: "Orçamento" },
            { v: "contrato", l: "Contrato" },
            { v: "execucao", l: "Em Execução" },
            { v: "entregue", l: "Entregues" },
          ].map(({ v, l }) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === v ? "bg-amber-500 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {l}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[200px]">Apartamento</th>
                <th className="py-3 px-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[60px]">%</th>
                {STEPS.map(s => (
                  <th key={s.key} className="py-3 px-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[100px]">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {Object.entries(byProject).map(([projectId, apts]) => {
                const proj = apts[0]?.project
                if (!proj) return null
                const isCollapsed = collapsed.has(projectId)
                const avgPct = Math.round(apts.reduce((acc, a) => acc + calcStepCompletion(a), 0) / apts.length)

                return (
                  <>
                    {/* Project header row */}
                    <tr key={`proj-${projectId}`} className="bg-amber-50 border-y border-amber-100">
                      <td colSpan={2 + STEPS.length} className="py-2 px-4">
                        <button
                          onClick={() => toggleCollapse(projectId)}
                          className="flex items-center gap-3 w-full text-left"
                        >
                          <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">{proj.name}</span>
                          {proj.client && <span className="text-xs text-amber-600">{proj.client.name}</span>}
                          {proj.deliveryDate && (
                            <span className="text-xs text-amber-600 ml-auto mr-2">Entrega: {formatDate(proj.deliveryDate)}</span>
                          )}
                          <span className="text-xs text-amber-700 font-medium">{avgPct}% concluído · {apts.length} apto{apts.length !== 1 ? "s" : ""}</span>
                          <span className="text-xs text-amber-500 ml-2">{isCollapsed ? "▶ expandir" : "▼ recolher"}</span>
                        </button>
                      </td>
                    </tr>

                    {/* Apartment rows */}
                    {!isCollapsed && apts.map(a => {
                      const pct = calcStepCompletion(a)
                      return (
                        <tr key={a.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-4">
                            <div>
                              <p className="font-medium text-slate-800 text-sm">Apto {a.number || "s/n"}</p>
                              <div className="flex gap-2 text-[10px] text-slate-400 mt-0.5">
                                {a.plan && <span>{a.plan}</span>}
                                {a.area && <span>{a.area}m²</span>}
                                {a.bedrooms && <span>{a.bedrooms} dorm.</span>}
                              </div>
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-xs font-bold ${pct === 100 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-slate-600"}`}>{pct}%</span>
                              <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${pct === 100 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </td>
                          {STEPS.map(s => (
                            <StepCell
                              key={s.key}
                              aptId={a.id}
                              stepKey={s.key}
                              dateKey={s.dateKey}
                              status={a[s.key as keyof Apartment] as string}
                              date={a[s.dateKey as keyof Apartment] as string | undefined}
                              onSave={saveStep}
                            />
                          ))}
                        </tr>
                      )
                    })}
                  </>
                )
              })}
              {Object.keys(byProject).length === 0 && (
                <tr>
                  <td colSpan={2 + STEPS.length} className="py-12 text-center text-sm text-slate-400">
                    Nenhum apartamento cadastrado. Crie um projeto e adicione apartamentos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400">Clique em qualquer célula para editar o status e a data da etapa.</p>
      </div>
    </div>
  )
}
