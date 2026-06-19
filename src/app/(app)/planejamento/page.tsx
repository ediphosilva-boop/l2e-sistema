"use client"
import { useEffect, useState } from "react"
import { Check, X, Plus, RefreshCw, CalendarDays, Clock } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { formatDate } from "@/lib/utils"
import { businessDaysRemaining, DEFAULT_PACKAGE_ITEMS } from "@/lib/packageItems"

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pendente:  { label: "Pendente",   bg: "bg-slate-100",   text: "text-slate-500",   dot: "bg-slate-400" },
  comprado:  { label: "Comprado",   bg: "bg-yellow-50",   text: "text-yellow-700",  dot: "bg-yellow-400" },
  entregue:  { label: "Entregue",   bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-400" },
  instalado: { label: "Instalado",  bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
  naoaplica: { label: "N/A",        bg: "bg-slate-50",    text: "text-slate-300",   dot: "bg-slate-200" },
}

interface ApartmentItem {
  id: string; apartmentId: string; category: string; description: string
  status: string; completedAt?: string; order: number
}

interface Apartment {
  id: string; projectId: string; number: string; plan?: string; bedrooms?: number; totalValue: number
  items: ApartmentItem[]
  project: {
    id: string; name: string; status: string
    startDate?: string; deliveryDate?: string
    client?: { name: string }
    contracts: Array<{ signedAt?: string }>
  }
}

function ItemCell({ item, onSave }: {
  item: ApartmentItem
  onSave: (id: string, status: string, date: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [newStatus, setNewStatus] = useState(item.status)
  const [newDate, setNewDate] = useState(item.completedAt ? item.completedAt.split("T")[0] : "")
  const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pendente

  const save = () => {
    onSave(item.id, newStatus, newDate)
    setEditing(false)
  }

  if (editing) {
    return (
      <td className="p-1 border-r border-slate-100 last:border-0 bg-white">
        <div className="flex flex-col gap-1 w-[130px]">
          <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
            className="rounded border border-slate-300 text-[11px] px-1.5 py-1 bg-white">
            {Object.entries(STATUS_CONFIG).map(([v, { label }]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
          <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
            className="rounded border border-slate-300 text-[11px] px-1.5 py-1 bg-white" />
          <div className="flex gap-1">
            <button onClick={save} className="flex-1 rounded bg-amber-500 text-white text-[11px] py-1 flex items-center justify-center hover:bg-amber-600">
              <Check className="h-3 w-3" />
            </button>
            <button onClick={() => setEditing(false)} className="flex-1 rounded bg-slate-200 text-slate-600 text-[11px] py-1 flex items-center justify-center">
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      </td>
    )
  }

  return (
    <td className="p-1 border-r border-slate-100 last:border-0">
      <button
        onClick={() => { setNewStatus(item.status); setNewDate(item.completedAt ? item.completedAt.split("T")[0] : ""); setEditing(true) }}
        className={`w-full rounded-lg px-2 py-1.5 text-center hover:opacity-80 transition-all ${cfg.bg} ${cfg.text}`}
      >
        <span className="flex items-center justify-center gap-1 text-[11px] font-medium">
          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot}`} />
          {cfg.label}
        </span>
        {item.completedAt && item.status !== "naoaplica" && (
          <span className="text-[9px] opacity-60 block">{formatDate(item.completedAt)}</span>
        )}
      </button>
    </td>
  )
}

function EmptyCell() {
  return (
    <td className="p-1 border-r border-slate-100 last:border-0">
      <div className="w-full rounded-lg px-2 py-1.5 text-center bg-slate-50">
        <span className="text-[11px] text-slate-300">—</span>
      </div>
    </td>
  )
}

export default function PlanejamentoPage() {
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [filter, setFilter] = useState("todos")
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [initializing, setInitializing] = useState<Set<string>>(new Set())

  const load = () => fetch("/api/apartments").then(r => r.json()).then(setApartments)
  useEffect(() => { load() }, [])

  const saveItem = async (id: string, status: string, date: string) => {
    await fetch(`/api/apartment-items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, completedAt: date ? new Date(date).toISOString() : null }),
    })
    await load()
  }

  const initItems = async (apt: Apartment) => {
    setInitializing(prev => new Set(prev).add(apt.id))
    await fetch("/api/apartment-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initFromPlan: true, apartmentId: apt.id, plan: apt.plan }),
    })
    await load()
    setInitializing(prev => { const n = new Set(prev); n.delete(apt.id); return n })
  }

  const filtered = apartments.filter(a =>
    filter === "todos" ? true : a.project?.status === filter
  )

  const byProject = filtered.reduce<Record<string, Apartment[]>>((acc, a) => {
    const key = a.projectId
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {})

  const toggleCollapse = (id: string) =>
    setCollapsed(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Cronograma" subtitle="Acompanhamento por item de cada apartamento" />
      <div className="flex-1 p-3 sm:p-6 space-y-6">

        {/* Filtros */}
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

        {Object.entries(byProject).map(([projectId, apts]) => {
          const proj = apts[0]?.project
          if (!proj) return null
          const isCollapsed = collapsed.has(projectId)

          // Delivery date + countdown
          const deliveryDate = proj.deliveryDate ? new Date(proj.deliveryDate) : null
          const daysLeft = deliveryDate ? businessDaysRemaining(deliveryDate) : null
          const isOverdue = deliveryDate && deliveryDate < new Date()

          // Collect all unique (category, description) pairs across all apts in this project
          const allItemKeys = new Map<string, { category: string; description: string; order: number }>()
          for (const apt of apts) {
            for (const item of apt.items) {
              const key = `${item.category}|||${item.description}`
              if (!allItemKeys.has(key)) allItemKeys.set(key, { category: item.category, description: item.description, order: item.order })
            }
          }

          // If no items initialized yet, show default for each unique package
          const hasNoItems = apts.every(a => a.items.length === 0)
          if (hasNoItems) {
            // Fallback: show rows from the first apartment's package
            const plan = apts[0]?.plan || "Pacote Essencial"
            const defaults = DEFAULT_PACKAGE_ITEMS[plan] ?? DEFAULT_PACKAGE_ITEMS["Pacote Essencial"]
            for (const d of defaults) {
              const key = `${d.category}|||${d.description}`
              if (!allItemKeys.has(key)) allItemKeys.set(key, d)
            }
          }

          // Sort by (category order, item order)
          const allItems = [...allItemKeys.values()].sort((a, b) =>
            a.category.localeCompare(b.category) || a.order - b.order
          )
          const categories = [...new Set(allItems.map(it => it.category))]

          // Apt-level completion
          const aptCompletions = apts.map(apt => {
            if (apt.items.length === 0) return 0
            const active = apt.items.filter(it => it.status !== "naoaplica")
            if (active.length === 0) return 100
            const done = active.filter(it => it.status === "instalado").length
            return Math.round(done / active.length * 100)
          })
          const avgPct = Math.round(aptCompletions.reduce((s, p) => s + p, 0) / apts.length)

          return (
            <div key={projectId} className="bg-white rounded-xl border border-slate-200 overflow-hidden">

              {/* Project header */}
              <div className="bg-amber-50 border-b border-amber-100 px-4 py-3">
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
                  <button onClick={() => toggleCollapse(projectId)} className="flex items-center gap-2 text-left">
                    <span className="text-sm font-bold text-amber-800">{proj.name}</span>
                    {proj.client && <span className="text-xs text-amber-600">{proj.client.name}</span>}
                    <span className="text-xs text-amber-500">{isCollapsed ? "▶" : "▼"}</span>
                  </button>

                  <div className="flex items-center gap-3 ml-auto flex-wrap">
                    <span className="text-xs font-semibold text-amber-700">{avgPct}% · {apts.length} apto{apts.length !== 1 ? "s" : ""}</span>

                    {deliveryDate ? (
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-amber-600" />
                        <span className="text-xs text-amber-700 font-medium">Previsão: {formatDate(deliveryDate.toISOString())}</span>
                        {isOverdue ? (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">ATRASADO</span>
                        ) : daysLeft !== null ? (
                          <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            daysLeft <= 5 ? "bg-red-50 text-red-600 border-red-200" :
                            daysLeft <= 15 ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}>
                            <Clock className="h-2.5 w-2.5" />
                            {daysLeft} dias úteis
                          </span>
                        ) : null}
                      </div>
                    ) : proj.startDate ? (
                      <span className="text-xs text-slate-400">Iniciado em {formatDate(proj.startDate)}</span>
                    ) : null}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${avgPct === 100 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${avgPct}%` }} />
                </div>
              </div>

              {!isCollapsed && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      {/* Apartment header row */}
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="sticky left-0 bg-slate-50 text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[200px] border-r border-slate-200 z-10">
                          Item
                        </th>
                        {apts.map((apt, i) => (
                          <th key={apt.id} className="px-2 py-2.5 text-center min-w-[130px] border-r border-slate-100 last:border-0">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-xs font-bold text-slate-700">Apto {apt.number || String(i + 1)}</span>
                              {apt.plan && <span className="text-[10px] text-slate-400">{apt.plan.replace("Pacote ", "")}</span>}
                              {apt.bedrooms && <span className="text-[10px] text-slate-400">{apt.bedrooms} dorm.</span>}
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className={`text-[10px] font-bold ${aptCompletions[i] === 100 ? "text-emerald-600" : "text-amber-600"}`}>
                                  {aptCompletions[i]}%
                                </span>
                                <div className="w-10 h-1 bg-slate-200 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${aptCompletions[i] === 100 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${aptCompletions[i]}%` }} />
                                </div>
                              </div>
                              {apt.items.length === 0 && (
                                <button
                                  onClick={() => initItems(apt)}
                                  disabled={initializing.has(apt.id)}
                                  className="mt-1 flex items-center gap-1 text-[10px] text-amber-600 border border-amber-300 rounded px-1.5 py-0.5 hover:bg-amber-50 transition-colors disabled:opacity-50"
                                >
                                  <Plus className="h-2.5 w-2.5" />
                                  {initializing.has(apt.id) ? "..." : "Inicializar"}
                                </button>
                              )}
                              {apt.items.length > 0 && (
                                <button
                                  onClick={() => initItems(apt)}
                                  disabled={initializing.has(apt.id)}
                                  title="Reinicializar itens do pacote"
                                  className="mt-1 text-[10px] text-slate-300 hover:text-slate-500 transition-colors disabled:opacity-50"
                                >
                                  <RefreshCw className="h-2.5 w-2.5" />
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(cat => {
                        const catItems = allItems.filter(it => it.category === cat)
                        return (
                          <>
                            {/* Category separator */}
                            <tr key={`cat-${cat}`} className="bg-slate-50/80 border-y border-slate-100">
                              <td colSpan={1 + apts.length} className="sticky left-0 px-4 py-1.5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cat}</span>
                              </td>
                            </tr>
                            {catItems.map(rowItem => {
                              const key = `${rowItem.category}|||${rowItem.description}`
                              return (
                                <tr key={key} className="border-b border-slate-50 hover:bg-slate-50/30">
                                  <td className="sticky left-0 bg-white px-4 py-1 border-r border-slate-100 z-10">
                                    <span className="text-xs text-slate-700">{rowItem.description}</span>
                                  </td>
                                  {apts.map(apt => {
                                    const item = apt.items.find(
                                      it => it.category === rowItem.category && it.description === rowItem.description
                                    )
                                    return item
                                      ? <ItemCell key={apt.id} item={item} onSave={saveItem} />
                                      : <EmptyCell key={apt.id} />
                                  })}
                                </tr>
                              )
                            })}
                          </>
                        )
                      })}
                      {allItems.length === 0 && (
                        <tr>
                          <td colSpan={1 + apts.length} className="py-8 text-center text-xs text-slate-400">
                            Clique em "Inicializar" acima de cada apartamento para carregar os itens do pacote.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}

        {Object.keys(byProject).length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center text-sm text-slate-400">
            Nenhum apartamento cadastrado. Assine uma proposta para criar o projeto e os apartamentos.
          </div>
        )}

        <p className="text-xs text-slate-400">Clique em qualquer célula de status para atualizar. Use ▶/▼ para recolher projetos.</p>
      </div>
    </div>
  )
}
