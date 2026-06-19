"use client"
import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, History, Lock } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"

const PACKAGES_CONFIG = ["Pacote Essencial", "Pacote Premium"]
const BEDROOMS_CONFIG = [
  { value: "1", label: "1 dormitório" },
  { value: "2", label: "2 dormitórios" },
]

interface PackagePrice {
  id: string
  package: string
  bedroom: string
  price: number
  startDate: string
  endDate?: string | null
  notes?: string | null
  createdAt: string
}

const emptyForm = () => ({
  package: PACKAGES_CONFIG[0],
  bedroom: "1",
  price: 0,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  notes: "",
})

function isActive(p: PackagePrice): boolean {
  const today = new Date()
  const start = new Date(p.startDate)
  const end = p.endDate ? new Date(p.endDate) : null
  return start <= today && (!end || end >= today)
}

export default function PrecosPage() {
  const [prices, setPrices] = useState<PackagePrice[]>([])
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [showAll, setShowAll] = useState(false)

  const load = () => fetch("/api/package-prices").then(r => r.json()).then(setPrices)
  useEffect(() => { load() }, [])

  const save = async () => {
    setLoading(true)
    const body = {
      package: form.package,
      bedroom: form.bedroom,
      price: form.price,
      startDate: form.startDate,
      endDate: form.endDate || null,
      notes: form.notes || null,
    }
    if (editId) {
      await fetch(`/api/package-prices/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    } else {
      await fetch("/api/package-prices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    }
    await load()
    setOpen(false)
    setLoading(false)
  }

  const del = async (id: string) => {
    if (!confirm("Excluir este registro de preço?")) return
    await fetch(`/api/package-prices/${id}`, { method: "DELETE" })
    await load()
  }

  const openNew = () => {
    setForm(emptyForm())
    setEditId(null)
    setOpen(true)
  }

  const openEdit = (p: PackagePrice) => {
    setForm({
      package: p.package,
      bedroom: p.bedroom,
      price: p.price,
      startDate: p.startDate.slice(0, 10),
      endDate: p.endDate ? p.endDate.slice(0, 10) : "",
      notes: p.notes ?? "",
    })
    setEditId(p.id)
    setOpen(true)
  }

  // Agrupa por pacote+dormitório para mostrar vigente + histórico
  const groups: Record<string, PackagePrice[]> = {}
  for (const p of prices) {
    const key = `${p.package}|${p.bedroom}`
    if (!groups[key]) groups[key] = []
    groups[key].push(p)
  }

  const displayed = showAll ? prices : prices.filter(isActive)

  return (
    <>
      <Topbar
        title="Preços de Pacotes"
        subtitle="Tabela de preços vigentes e histórico de reajustes"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <History className="h-4 w-4" />
              {showAll ? "Ver vigentes" : "Ver histórico"}
            </button>
            <Button onClick={openNew}><Plus className="h-4 w-4" />Novo Preço</Button>
          </div>
        }
      />
      <div className="p-3 sm:p-6 space-y-4">

        {/* Aviso sobre preços vigentes */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <Lock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Os preços vigentes são usados automaticamente em novas propostas. Para reajustar, cadastre um novo preço com a data de início do reajuste e encerre o anterior com a data de fim.
          </p>
        </div>

        {/* Tabela de preços */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Pacote</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Dormitórios</th>
                  <th className="text-right px-4 py-3 text-xs text-slate-500 font-medium">Preço/un</th>
                  <th className="text-center px-4 py-3 text-xs text-slate-500 font-medium">Início vigência</th>
                  <th className="text-center px-4 py-3 text-xs text-slate-500 font-medium">Fim vigência</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Obs.</th>
                  <th className="text-center px-4 py-3 text-xs text-slate-500 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayed.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-slate-400">
                      Nenhum preço cadastrado. Clique em &quot;Novo Preço&quot; para começar.
                    </td>
                  </tr>
                ) : displayed.map(p => {
                  const active = isActive(p)
                  return (
                    <tr key={p.id} className={`hover:bg-slate-50/50 ${!active ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          p.package === "Pacote Essencial"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {p.package.replace("Pacote ", "")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 text-xs">{p.bedroom} dorm.</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrency(p.price)}</td>
                      <td className="px-4 py-3 text-center text-xs text-slate-500">{formatDate(p.startDate)}</td>
                      <td className="px-4 py-3 text-center text-xs text-slate-500">{p.endDate ? formatDate(p.endDate) : <span className="text-emerald-600 font-medium">Vigente</span>}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 max-w-[160px] truncate">{p.notes ?? "—"}</td>
                      <td className="px-4 py-3 text-center">
                        {active
                          ? <Badge className="bg-emerald-50 text-emerald-700 text-[10px]">Vigente</Badge>
                          : <Badge className="bg-slate-100 text-slate-500 text-[10px]">Encerrado</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openEdit(p)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => del(p.id)} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumo das vigentes por combinação */}
        {!showAll && (
          <div>
            <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Preços vigentes por combinação</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PACKAGES_CONFIG.flatMap(pkg =>
                BEDROOMS_CONFIG.map(bed => {
                  const active = prices.find(p => p.package === pkg && p.bedroom === bed.value && isActive(p))
                  return (
                    <div key={`${pkg}-${bed.value}`} className="bg-white rounded-xl border border-slate-200 p-3">
                      <p className="text-[10px] text-slate-400 font-medium">{pkg.replace("Pacote ", "")} · {bed.label}</p>
                      {active
                        ? <p className="text-lg font-bold text-slate-800 mt-1">{formatCurrency(active.price)}</p>
                        : <p className="text-sm text-slate-300 mt-1 italic">Não cadastrado</p>}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) setOpen(false) }}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? "Editar Preço" : "Novo Preço de Pacote"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Pacote</Label>
                <select
                  value={form.package}
                  onChange={e => setForm({ ...form, package: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                >
                  {PACKAGES_CONFIG.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <Label>Dormitórios</Label>
                <select
                  value={form.bedroom}
                  onChange={e => setForm({ ...form, bedroom: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                >
                  {BEDROOMS_CONFIG.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <Label>Preço por unidade (R$)</Label>
              <Input
                type="number" min={0} step={0.01}
                value={form.price || ""}
                onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                className="mt-1"
                placeholder="0,00"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Início da vigência *</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Fim da vigência</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                  className="mt-1"
                  placeholder="Deixe em branco = vigente"
                />
                <p className="text-[10px] text-slate-400 mt-1">Deixe em branco para manter vigente</p>
              </div>
            </div>

            <div>
              <Label>Observação (motivo do reajuste)</Label>
              <Input
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="mt-1"
                placeholder="Ex: Reajuste jan/2026 — aumento de custo de MO"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!form.startDate || !form.price || loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
