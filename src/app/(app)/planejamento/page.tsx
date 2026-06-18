"use client"
import { useEffect, useState } from "react"
import { Calendar, CheckCircle2, Clock, AlertCircle, Pencil, X, Check } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { formatDate } from "@/lib/utils"

const STEPS = [
  { key: "stepEletrica",         label: "Elétrica",           dateKey: "stepEletricaDate" },
  { key: "stepPintura",          label: "Pintura",            dateKey: "stepPinturaDate" },
  { key: "stepAcabamentos",      label: "Acabamentos",        dateKey: "stepAcabamentosDate" },
  { key: "stepMoveis",           label: "Móveis",             dateKey: "stepMoveisDate" },
  { key: "stepEletrodomesticos", label: "Eletrodomésticos",   dateKey: "stepEletrodomesticosDate" },
  { key: "stepPersonalizacao",   label: "Personalização",     dateKey: "stepPersonalizacaoDate" },
]

const STATUS_CONFIG = {
  pendente:  { label: "Pendente",  icon: Clock,         color: "text-slate-400",  bg: "bg-slate-100" },
  comprado:  { label: "Comprado",  icon: AlertCircle,   color: "text-blue-500",   bg: "bg-blue-50" },
  entregue:  { label: "Entregue",  icon: AlertCircle,   color: "text-amber-500",  bg: "bg-amber-50" },
  instalado: { label: "Instalado", icon: CheckCircle2,  color: "text-emerald-500",bg: "bg-emerald-50" },
}

interface Project {
  id: string; name: string; address?: string; status: string
  startDate?: string; deliveryDate?: string; client?: { name: string }
  stepEletrica: string; stepPintura: string; stepAcabamentos: string
  stepMoveis: string; stepEletrodomesticos: string; stepPersonalizacao: string
  stepEletricaDate?: string; stepPinturaDate?: string; stepAcabamentosDate?: string
  stepMoveisDate?: string; stepEletrodomesticosDate?: string; stepPersonalizacaoDate?: string
}

function StepCell({ status, date, projectId, stepKey, dateKey, onSave }: {
  status: string; date?: string; projectId: string; stepKey: string; dateKey: string
  onSave: (id: string, data: Record<string, string>) => void
}) {
  const [editing, setEditing] = useState(false)
  const [newStatus, setNewStatus] = useState(status)
  const [newDate, setNewDate] = useState(date ? date.split("T")[0] : "")
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pendente
  const Icon = cfg.icon

  const save = () => {
    onSave(projectId, { [stepKey]: newStatus, [dateKey]: newDate ? new Date(newDate).toISOString() : "" })
    setEditing(false)
  }

  if (editing) {
    return (
      <td className="p-2">
        <div className="flex flex-col gap-1 min-w-[130px]">
          <select
            value={newStatus}
            onChange={e => setNewStatus(e.target.value)}
            className="rounded border border-slate-300 text-xs px-1.5 py-1 bg-white"
          >
            {Object.entries(STATUS_CONFIG).map(([v, { label }]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
          <input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            className="rounded border border-slate-300 text-xs px-1.5 py-1 bg-white"
          />
          <div className="flex gap-1">
            <button onClick={save} className="flex-1 rounded bg-amber-500 text-white text-xs py-1 flex items-center justify-center gap-1 hover:bg-amber-600">
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
    <td className="p-2 group">
      <div
        className={`flex flex-col items-center rounded-lg px-2 py-1.5 cursor-pointer hover:ring-2 hover:ring-amber-300 transition-all ${cfg.bg}`}
        onClick={() => setEditing(true)}
      >
        <Icon className={`h-4 w-4 ${cfg.color}`} />
        <span className={`text-[10px] font-medium mt-0.5 ${cfg.color}`}>{cfg.label}</span>
        {date && <span className="text-[9px] text-slate-400 mt-0.5">{formatDate(date)}</span>}
      </div>
    </td>
  )
}

export default function PlanejamentoPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState("todos")

  const load = () =>
    fetch("/api/projects").then(r => r.json()).then(setProjects)

  useEffect(() => { load() }, [])

  const save = async (id: string, data: Record<string, string>) => {
    await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    await load()
  }

  const filtered = projects.filter(p =>
    filter === "todos" ? true : p.status === filter
  )

  const completionOf = (p: Project) => {
    const statuses = STEPS.map(s => p[s.key as keyof Project] as string)
    const done = statuses.filter(s => s === "instalado").length
    return Math.round((done / STEPS.length) * 100)
  }

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Cronograma" subtitle="Planejamento de entrega dos projetos" />
      <div className="flex-1 p-6 space-y-4">

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          {[
            { v: "todos", l: "Todos" },
            { v: "orcamento", l: "Orçamento" },
            { v: "contrato", l: "Contrato" },
            { v: "execucao", l: "Em Execução" },
            { v: "entregue", l: "Entregues" },
          ].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === v ? "bg-amber-500 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Tabela cronograma */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[200px]">Projeto</th>
                <th className="py-3 px-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">% Concl.</th>
                <th className="py-3 px-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Entrega</th>
                {STEPS.map(s => (
                  <th key={s.key} className="py-3 px-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[110px]">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(p => {
                const pct = completionOf(p)
                const isLate = p.deliveryDate && new Date(p.deliveryDate) < new Date() && p.status !== "entregue"
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{p.name}</p>
                        {p.client && <p className="text-xs text-slate-400 mt-0.5">{p.client.name}</p>}
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-sm font-bold ${pct === 100 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-slate-700"}`}>
                          {pct}%
                        </span>
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : "bg-amber-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      {p.deliveryDate ? (
                        <span className={`text-xs font-medium ${isLate ? "text-red-500" : "text-slate-600"}`}>
                          {formatDate(p.deliveryDate)}
                          {isLate && <span className="block text-[10px] text-red-400">Atrasado</span>}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    {STEPS.map(s => (
                      <StepCell
                        key={s.key}
                        projectId={p.id}
                        stepKey={s.key}
                        dateKey={s.dateKey}
                        status={p[s.key as keyof Project] as string}
                        date={p[s.dateKey as keyof Project] as string | undefined}
                        onSave={save}
                      />
                    ))}
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-slate-400">
                    Nenhum projeto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-400">Clique em qualquer célula para editar o status e a data prevista da etapa.</p>
      </div>
    </div>
  )
}
