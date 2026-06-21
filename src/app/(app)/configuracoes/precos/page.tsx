"use client"
import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, History, Lock, ChevronDown, Download } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"

const PACKAGES_CONFIG = ["Pacote Essencial", "Pacote Premium"]
const ALL_PACKAGES = ["Pacote Essencial", "Pacote Premium", "Pacote Personalizado"]
const BEDROOMS_CONFIG = [
  { value: "1", label: "1 dormitório" },
  { value: "2", label: "2 dormitórios" },
]

const ITEM_CATEGORIES = [
  "Eletrodomésticos",
  "Móveis",
  "Elétrica",
  "Pintura",
  "Acabamentos",
  "Personalização",
  "Mão de Obra",
  "Outros",
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

interface PackageItem {
  id: string
  package: string
  description: string
  category?: string | null
  quantity: number
  unitCost: number
  order: number
}

const emptyPriceForm = () => ({
  package: PACKAGES_CONFIG[0],
  bedroom: "1",
  price: 0,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  notes: "",
})

const emptyItemForm = () => ({
  package: ALL_PACKAGES[0],
  description: "",
  category: "",
  quantity: 1,
  unitCost: 0,
})

function isActive(p: PackagePrice): boolean {
  const today = new Date()
  const start = new Date(p.startDate)
  const end = p.endDate ? new Date(p.endDate) : null
  return start <= today && (!end || end >= today)
}

export default function PrecosPage() {
  // --- preços ---
  const [prices, setPrices] = useState<PackagePrice[]>([])
  const [priceOpen, setPriceOpen] = useState(false)
  const [priceEditId, setPriceEditId] = useState<string | null>(null)
  const [priceLoading, setPriceLoading] = useState(false)
  const [priceForm, setPriceForm] = useState(emptyPriceForm())
  const [showAll, setShowAll] = useState(false)

  // --- itens ---
  const [items, setItems] = useState<PackageItem[]>([])
  const [itemOpen, setItemOpen] = useState(false)
  const [itemEditId, setItemEditId] = useState<string | null>(null)
  const [itemLoading, setItemLoading] = useState(false)
  const [itemForm, setItemForm] = useState(emptyItemForm())
  const [activeTab, setActiveTab] = useState(ALL_PACKAGES[0])
  const [editingInlineId, setEditingInlineId] = useState<string | null>(null)
  const [inlineForm, setInlineForm] = useState<Partial<PackageItem>>({})
  const [seeding, setSeeding] = useState(false)

  const loadPrices = () => fetch("/api/package-prices").then(r => r.json()).then(setPrices)
  const loadItems = () => fetch("/api/package-items").then(r => r.json()).then(setItems)

  const runSeed = async () => {
    if (!confirm("Isso vai apagar todos os itens de composição atuais e carregar os dados padrão. Confirmar?")) return
    setSeeding(true)
    await fetch("/api/seed/package-items", { method: "POST" })
    await loadItems()
    setSeeding(false)
  }

  useEffect(() => {
    loadPrices()
    loadItems()
  }, [])

  // ---------- preços handlers ----------
  const savePrice = async () => {
    setPriceLoading(true)
    const body = {
      package: priceForm.package,
      bedroom: priceForm.bedroom,
      price: priceForm.price,
      startDate: priceForm.startDate,
      endDate: priceForm.endDate || null,
      notes: priceForm.notes || null,
    }
    if (priceEditId) {
      await fetch(`/api/package-prices/${priceEditId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    } else {
      await fetch("/api/package-prices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    }
    await loadPrices()
    setPriceOpen(false)
    setPriceLoading(false)
  }

  const delPrice = async (id: string) => {
    if (!confirm("Excluir este registro de preço?")) return
    await fetch(`/api/package-prices/${id}`, { method: "DELETE" })
    await loadPrices()
  }

  const openNewPrice = () => { setPriceForm(emptyPriceForm()); setPriceEditId(null); setPriceOpen(true) }
  const openEditPrice = (p: PackagePrice) => {
    setPriceForm({ package: p.package, bedroom: p.bedroom, price: p.price, startDate: p.startDate.slice(0, 10), endDate: p.endDate ? p.endDate.slice(0, 10) : "", notes: p.notes ?? "" })
    setPriceEditId(p.id)
    setPriceOpen(true)
  }

  // ---------- itens handlers ----------
  const saveItem = async () => {
    setItemLoading(true)
    const body = { package: itemForm.package, description: itemForm.description, category: itemForm.category || null, quantity: itemForm.quantity, unitCost: itemForm.unitCost }
    if (itemEditId) {
      await fetch(`/api/package-items/${itemEditId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    } else {
      await fetch("/api/package-items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    }
    await loadItems()
    setItemOpen(false)
    setItemLoading(false)
  }

  const delItem = async (id: string) => {
    if (!confirm("Excluir este item?")) return
    await fetch(`/api/package-items/${id}`, { method: "DELETE" })
    await loadItems()
  }

  const openNewItem = () => {
    setItemForm({ ...emptyItemForm(), package: activeTab })
    setItemEditId(null)
    setItemOpen(true)
  }

  const openEditItem = (it: PackageItem) => {
    setItemForm({ package: it.package, description: it.description, category: it.category ?? "", quantity: it.quantity, unitCost: it.unitCost })
    setItemEditId(it.id)
    setItemOpen(true)
  }

  const startInlineEdit = (it: PackageItem) => {
    setEditingInlineId(it.id)
    setInlineForm({ quantity: it.quantity, unitCost: it.unitCost })
  }

  const saveInlineEdit = async (id: string) => {
    await fetch(`/api/package-items/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(inlineForm) })
    await loadItems()
    setEditingInlineId(null)
  }

  // ---------- derived ----------
  const tabItems = items.filter(it => it.package === activeTab)
  const tabCost = tabItems.reduce((s, it) => s + it.quantity * it.unitCost, 0)

  // Custo por dormitório: 1 dorm exclui itens "Solteiro"
  const tabCost1 = tabItems
    .filter(it => !it.description.toLowerCase().includes("solteiro"))
    .reduce((s, it) => s + it.quantity * it.unitCost, 0)
  const tabCost2 = tabCost

  const activePrice1 = prices.find(p => p.package === activeTab && p.bedroom === "1" && isActive(p))
  const activePrice2 = prices.find(p => p.package === activeTab && p.bedroom === "2" && isActive(p))

  const margin1 = activePrice1 && tabCost1 > 0 ? ((activePrice1.price - tabCost1) / activePrice1.price * 100) : null
  const margin2 = activePrice2 && tabCost2 > 0 ? ((activePrice2.price - tabCost2) / activePrice2.price * 100) : null

  const byCategory: Record<string, PackageItem[]> = {}
  for (const it of tabItems) {
    const cat = it.category || "Sem categoria"
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(it)
  }

  const displayed = showAll ? prices : prices.filter(isActive)

  return (
    <>
      <Topbar
        title="Preços de Pacotes"
        subtitle="Tabela de preços vigentes, histórico e composição de custos"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <History className="h-4 w-4" />
              {showAll ? "Ver vigentes" : "Ver histórico"}
            </button>
            <Button onClick={openNewPrice}><Plus className="h-4 w-4" />Novo Preço</Button>
          </div>
        }
      />
      <div className="p-3 sm:p-6 space-y-6">

        {/* Aviso */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <Lock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Os preços vigentes são usados automaticamente em novas propostas. Para reajustar, cadastre um novo preço com data de início e encerre o anterior com data de fim.
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
                  <tr><td colSpan={8} className="py-12 text-center text-sm text-slate-400">Nenhum preço cadastrado.</td></tr>
                ) : displayed.map(p => {
                  const active = isActive(p)
                  return (
                    <tr key={p.id} className={`hover:bg-slate-50/50 ${!active ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${p.package === "Pacote Essencial" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                          {p.package.replace("Pacote ", "")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 text-xs">{p.bedroom} dorm.</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrency(p.price)}</td>
                      <td className="px-4 py-3 text-center text-xs text-slate-500">{formatDate(p.startDate)}</td>
                      <td className="px-4 py-3 text-center text-xs text-slate-500">{p.endDate ? formatDate(p.endDate) : <span className="text-emerald-600 font-medium">Vigente</span>}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 max-w-[160px] truncate">{p.notes ?? "—"}</td>
                      <td className="px-4 py-3 text-center">
                        {active ? <Badge className="bg-emerald-50 text-emerald-700 text-[10px]">Vigente</Badge> : <Badge className="bg-slate-100 text-slate-500 text-[10px]">Encerrado</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openEditPrice(p)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => delPrice(p.id)} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumo vigentes */}
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
                      {active ? <p className="text-lg font-bold text-slate-800 mt-1">{formatCurrency(active.price)}</p> : <p className="text-sm text-slate-300 mt-1 italic">Não cadastrado</p>}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ============ COMPOSIÇÃO DOS PACOTES ============ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-slate-800">Composição dos Pacotes</p>
              <p className="text-xs text-slate-500 mt-0.5">Itens e custos que compõem cada pacote — base para cálculo de margem</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={runSeed}
                disabled={seeding}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {seeding ? "Carregando..." : "Carregar dados padrão"}
              </button>
              <Button onClick={openNewItem} size="sm"><Plus className="h-4 w-4" />Adicionar Item</Button>
            </div>
          </div>

          {/* Abas de pacote */}
          <div className="flex gap-1 mb-4">
            {ALL_PACKAGES.map(pkg => (
              <button
                key={pkg}
                onClick={() => setActiveTab(pkg)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === pkg
                    ? "bg-slate-800 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {pkg.replace("Pacote ", "")}
                {items.filter(it => it.package === pkg).length > 0 && (
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === pkg ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {items.filter(it => it.package === pkg).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tabela de itens */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {tabItems.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm">Nenhum item cadastrado para este pacote.</p>
                <button onClick={openNewItem} className="mt-2 text-xs text-amber-600 hover:underline">Adicionar primeiro item</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Descrição</th>
                      <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Categoria</th>
                      <th className="text-center px-4 py-3 text-xs text-slate-500 font-medium w-20">Qtd</th>
                      <th className="text-right px-4 py-3 text-xs text-slate-500 font-medium">Custo Unit.</th>
                      <th className="text-right px-4 py-3 text-xs text-slate-500 font-medium">Total</th>
                      <th className="px-4 py-3 w-16" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {Object.entries(byCategory).map(([cat, catItems]) => (
                      <>
                        <tr key={`cat-${cat}`} className="bg-slate-50/60">
                          <td colSpan={6} className="px-4 py-1.5">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{cat}</span>
                          </td>
                        </tr>
                        {catItems.map(it => (
                          <tr key={it.id} className="hover:bg-slate-50/40 group">
                            <td className="px-4 py-2.5 text-slate-700 text-sm">{it.description}</td>
                            <td className="px-4 py-2.5 text-xs text-slate-400">{it.category || "—"}</td>
                            <td className="px-4 py-2.5 text-center">
                              {editingInlineId === it.id ? (
                                <Input
                                  type="number" min={0} step={0.01}
                                  value={inlineForm.quantity ?? it.quantity}
                                  onChange={e => setInlineForm(f => ({ ...f, quantity: parseFloat(e.target.value) || 0 }))}
                                  className="h-7 w-16 mx-auto text-center text-xs"
                                />
                              ) : (
                                <span className="text-xs text-slate-600">{it.quantity}</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              {editingInlineId === it.id ? (
                                <Input
                                  type="number" min={0} step={0.01}
                                  value={inlineForm.unitCost ?? it.unitCost}
                                  onChange={e => setInlineForm(f => ({ ...f, unitCost: parseFloat(e.target.value) || 0 }))}
                                  className="h-7 w-28 ml-auto text-right text-xs"
                                />
                              ) : (
                                <span className="text-xs text-slate-600">{formatCurrency(it.unitCost)}</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-right font-medium text-slate-700 text-xs">
                              {formatCurrency(it.quantity * it.unitCost)}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1 justify-end">
                                {editingInlineId === it.id ? (
                                  <>
                                    <button onClick={() => saveInlineEdit(it.id)} className="text-[10px] px-2 py-1 rounded bg-amber-500 text-white hover:bg-amber-600 font-medium">OK</button>
                                    <button onClick={() => setEditingInlineId(null)} className="text-[10px] px-2 py-1 rounded border border-slate-200 text-slate-500 hover:bg-slate-50">✕</button>
                                  </>
                                ) : (
                                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                    <button onClick={() => startInlineEdit(it)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"><Pencil className="h-3 w-3" /></button>
                                    <button onClick={() => openEditItem(it)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"><ChevronDown className="h-3 w-3" /></button>
                                    <button onClick={() => delItem(it.id)} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </>
                    ))}

                    {/* Linha de total */}
                    <tr className="bg-slate-50 border-t-2 border-slate-200">
                      <td colSpan={4} className="px-4 py-3 font-semibold text-slate-700 text-sm">Custo Total do Pacote</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrency(tabCost)}</td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Cards de margem */}
          {tabCost > 0 && (activePrice1 || activePrice2) && activeTab !== "Pacote Personalizado" && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[{ bed: "1 dormitório", price: activePrice1, margin: margin1, cost: tabCost1 }, { bed: "2 dormitórios", price: activePrice2, margin: margin2, cost: tabCost2 }].map(({ bed, price, margin, cost }) => (
                price ? (
                  <div key={bed} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">{bed}</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{formatCurrency(price.price)} venda</p>
                      <p className="text-xs text-slate-400">Custo: {formatCurrency(cost)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-0.5">Margem bruta</p>
                      <p className={`text-2xl font-black ${margin !== null && margin >= 30 ? "text-emerald-600" : margin !== null && margin >= 15 ? "text-amber-500" : "text-red-500"}`}>
                        {margin !== null ? `${margin.toFixed(1)}%` : "—"}
                      </p>
                      <p className="text-xs text-slate-400">{formatCurrency(price.price - cost)} lucro bruto</p>
                    </div>
                  </div>
                ) : null
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de preço */}
      <Dialog open={priceOpen} onOpenChange={(v) => { if (!v && !priceLoading) setPriceOpen(false) }}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-md">
          <DialogHeader>
            <DialogTitle>{priceEditId ? "Editar Preço" : "Novo Preço de Pacote"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Pacote</Label>
                <select value={priceForm.package} onChange={e => setPriceForm({ ...priceForm, package: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none">
                  {PACKAGES_CONFIG.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <Label>Dormitórios</Label>
                <select value={priceForm.bedroom} onChange={e => setPriceForm({ ...priceForm, bedroom: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none">
                  {BEDROOMS_CONFIG.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label>Preço por unidade (R$)</Label>
              <Input type="number" min={0} step={0.01} value={priceForm.price || ""} onChange={e => setPriceForm({ ...priceForm, price: parseFloat(e.target.value) || 0 })} className="mt-1" placeholder="0,00" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Início da vigência *</Label>
                <Input type="date" value={priceForm.startDate} onChange={e => setPriceForm({ ...priceForm, startDate: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Fim da vigência</Label>
                <Input type="date" value={priceForm.endDate} onChange={e => setPriceForm({ ...priceForm, endDate: e.target.value })} className="mt-1" />
                <p className="text-[10px] text-slate-400 mt-1">Deixe em branco para manter vigente</p>
              </div>
            </div>
            <div>
              <Label>Observação (motivo do reajuste)</Label>
              <Input value={priceForm.notes} onChange={e => setPriceForm({ ...priceForm, notes: e.target.value })} className="mt-1" placeholder="Ex: Reajuste jan/2026 — aumento de custo de MO" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPriceOpen(false)}>Cancelar</Button>
            <Button onClick={savePrice} disabled={!priceForm.startDate || !priceForm.price || priceLoading}>
              {priceLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de item */}
      <Dialog open={itemOpen} onOpenChange={(v) => { if (!v && !itemLoading) setItemOpen(false) }}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-md">
          <DialogHeader>
            <DialogTitle>{itemEditId ? "Editar Item" : "Novo Item do Pacote"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Pacote</Label>
              <select value={itemForm.package} onChange={e => setItemForm({ ...itemForm, package: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none">
                {ALL_PACKAGES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <Label>Descrição *</Label>
              <Input value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} className="mt-1" placeholder="Ex: Geladeira 400L Frost Free" />
            </div>
            <div>
              <Label>Categoria</Label>
              <select value={itemForm.category} onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none">
                <option value="">— Sem categoria —</option>
                {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Quantidade</Label>
                <Input type="number" min={0} step={0.01} value={itemForm.quantity || ""} onChange={e => setItemForm({ ...itemForm, quantity: parseFloat(e.target.value) || 0 })} className="mt-1" placeholder="1" />
              </div>
              <div>
                <Label>Custo unitário (R$)</Label>
                <Input type="number" min={0} step={0.01} value={itemForm.unitCost || ""} onChange={e => setItemForm({ ...itemForm, unitCost: parseFloat(e.target.value) || 0 })} className="mt-1" placeholder="0,00" />
              </div>
            </div>
            {itemForm.quantity > 0 && itemForm.unitCost > 0 && (
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-slate-500">Custo total deste item</span>
                <span className="text-sm font-bold text-slate-800">{formatCurrency(itemForm.quantity * itemForm.unitCost)}</span>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setItemOpen(false)}>Cancelar</Button>
            <Button onClick={saveItem} disabled={!itemForm.description || itemLoading}>
              {itemLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
