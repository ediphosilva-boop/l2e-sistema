"use client"
import { useEffect, useState } from "react"
import { Plus, Search, Pencil, Trash2, Package, Wrench, Upload, Download } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

const PROD_CATEGORIES = ["Eletrodomésticos", "Móveis", "Acabamentos", "Elétrica", "Personalização", "Decoração"]
const SVC_CATEGORIES = ["Elétrica", "Pintura", "Montagem", "Instalação", "Acabamentos"]

interface Product { id: string; name: string; category: string; description?: string; marketPrice: number; costPrice: number; unit: string; imageUrl?: string; active: boolean }
interface Service { id: string; name: string; category: string; description?: string; laborCost: number; notes?: string; active: boolean }

const emptyProduct = (): Omit<Product, "id"> => ({ name: "", category: "", description: "", marketPrice: 0, costPrice: 0, unit: "un", imageUrl: "", active: true })
const emptyService = (): Omit<Service, "id"> => ({ name: "", category: "", description: "", laborCost: 0, notes: "", active: true })

const CAT_COLOR: Record<string, string> = {
  "Eletrodomésticos": "bg-purple-100 text-purple-700",
  "Móveis":           "bg-blue-100 text-blue-700",
  "Acabamentos":      "bg-orange-100 text-orange-700",
  "Elétrica":         "bg-yellow-100 text-yellow-700",
  "Personalização":   "bg-pink-100 text-pink-700",
  "Decoração":        "bg-green-100 text-green-700",
  "Pintura":          "bg-red-100 text-red-700",
  "Montagem":         "bg-cyan-100 text-cyan-700",
  "Instalação":       "bg-indigo-100 text-indigo-700",
}

const PROD_CSV_TEMPLATE = `Nome,Categoria,Descrição,Valor Mercado,Custo,Unidade,URL Imagem
Geladeira Electrolux,Eletrodomésticos,Frost Free 400L,2899.90,2100.00,un,`

const SVC_CSV_TEMPLATE = `Nome,Categoria,Descrição,Custo MO,Observações
Instalação Elétrica,Elétrica,Instalação completa,1200.00,Por apartamento`

type BulkProduct = Omit<Product, "id">
type BulkService = Omit<Service, "id">

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState("all")
  const [openProd, setOpenProd] = useState(false)
  const [openSvc, setOpenSvc] = useState(false)
  const [openBulkProd, setOpenBulkProd] = useState(false)
  const [openBulkSvc, setOpenBulkSvc] = useState(false)
  const [formP, setFormP] = useState(emptyProduct())
  const [formS, setFormS] = useState(emptyService())
  const [editPId, setEditPId] = useState<string | null>(null)
  const [editSId, setEditSId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [csvProd, setCsvProd] = useState("")
  const [csvSvc, setCsvSvc] = useState("")
  const [previewProd, setPreviewProd] = useState<BulkProduct[]>([])
  const [previewSvc, setPreviewSvc] = useState<BulkService[]>([])
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkResult, setBulkResult] = useState<string | null>(null)

  const loadAll = () => Promise.all([
    fetch("/api/products").then(r => r.json()).then(setProducts),
    fetch("/api/services").then(r => r.json()).then(setServices),
  ])
  useEffect(() => { loadAll() }, [])

  const filteredP = products.filter(p => {
    const s = [p.name, p.category, p.description].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    return s && (catFilter === "all" || p.category === catFilter)
  })
  const filteredS = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

  const saveProduct = async () => {
    setLoading(true)
    if (editPId) await fetch(`/api/products/${editPId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formP) })
    else await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formP) })
    await loadAll(); setOpenProd(false); setLoading(false)
  }

  const saveService = async () => {
    setLoading(true)
    if (editSId) await fetch(`/api/services/${editSId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formS) })
    else await fetch("/api/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formS) })
    await loadAll(); setOpenSvc(false); setLoading(false)
  }

  const delProduct = async (id: string) => { if (!confirm("Excluir produto?")) return; await fetch(`/api/products/${id}`, { method: "DELETE" }); await loadAll() }
  const delService = async (id: string) => { if (!confirm("Excluir serviço?")) return; await fetch(`/api/services/${id}`, { method: "DELETE" }); await loadAll() }

  const parseProdCSV = (text: string) => {
    const lines = text.trim().split("\n").filter(l => l.trim())
    const data = lines[0]?.toLowerCase().startsWith("nome") ? lines.slice(1) : lines
    const parsed: BulkProduct[] = data.map(l => {
      const c = l.split(",").map(v => v.trim().replace(/^"|"$/g, ""))
      return { name: c[0] ?? "", category: c[1] ?? "", description: c[2] ?? "", marketPrice: parseFloat(c[3] ?? "0") || 0, costPrice: parseFloat(c[4] ?? "0") || 0, unit: c[5] || "un", imageUrl: c[6] ?? "", active: true }
    }).filter(r => r.name)
    setPreviewProd(parsed)
  }

  const parseSvcCSV = (text: string) => {
    const lines = text.trim().split("\n").filter(l => l.trim())
    const data = lines[0]?.toLowerCase().startsWith("nome") ? lines.slice(1) : lines
    const parsed: BulkService[] = data.map(l => {
      const c = l.split(",").map(v => v.trim().replace(/^"|"$/g, ""))
      return { name: c[0] ?? "", category: c[1] ?? "", description: c[2] ?? "", laborCost: parseFloat(c[3] ?? "0") || 0, notes: c[4] ?? "", active: true }
    }).filter(r => r.name)
    setPreviewSvc(parsed)
  }

  const importProd = async () => {
    setBulkLoading(true); let ok = 0, err = 0
    for (const row of previewProd) {
      try { await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(row) }); ok++ }
      catch { err++ }
    }
    await loadAll()
    setBulkResult(`✅ ${ok} produtos importados${err > 0 ? `, ❌ ${err} com erro` : ""}`)
    setBulkLoading(false)
  }

  const importSvc = async () => {
    setBulkLoading(true); let ok = 0, err = 0
    for (const row of previewSvc) {
      try { await fetch("/api/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(row) }); ok++ }
      catch { err++ }
    }
    await loadAll()
    setBulkResult(`✅ ${ok} serviços importados${err > 0 ? `, ❌ ${err} com erro` : ""}`)
    setBulkLoading(false)
  }

  const downloadTemplate = (csv: string, filename: string) => {
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = filename; a.click()
  }

  return (
    <>
      <Topbar title="Produtos e Serviços" description="Catálogo de produtos e mão de obra" />
      <div className="p-6">
        <Tabs defaultValue="produtos">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <TabsList>
              <TabsTrigger value="produtos"><Package className="h-3.5 w-3.5 mr-1.5" />Produtos ({products.length})</TabsTrigger>
              <TabsTrigger value="servicos"><Wrench className="h-3.5 w-3.5 mr-1.5" />Mão de Obra ({services.length})</TabsTrigger>
            </TabsList>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar..." className="pl-9 w-48" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {/* Produtos — Moodboard */}
          <TabsContent value="produtos">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex gap-2 flex-wrap">
                {["all", ...PROD_CATEGORIES].map(c => (
                  <button key={c} onClick={() => setCatFilter(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${catFilter === c ? "bg-amber-500 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    {c === "all" ? "Todos" : c}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setOpenBulkProd(true); setCsvProd(""); setPreviewProd([]); setBulkResult(null) }}>
                  <Upload className="h-4 w-4" />Importar em Massa
                </Button>
                <Button size="sm" onClick={() => { setFormP(emptyProduct()); setEditPId(null); setOpenProd(true) }}>
                  <Plus className="h-4 w-4" />Novo Produto
                </Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredP.map(p => (
                <Card key={p.id} className="overflow-hidden hover:border-amber-300 hover:shadow-md transition-all group">
                  <div className="aspect-video bg-slate-100 flex items-center justify-center relative">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="h-10 w-10 text-slate-300" />
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setFormP({ name: p.name, category: p.category, description: p.description ?? "", marketPrice: p.marketPrice, costPrice: p.costPrice, unit: p.unit, imageUrl: p.imageUrl ?? "", active: p.active }); setEditPId(p.id); setOpenProd(true) }} className="p-1.5 rounded bg-white/90 text-slate-600 hover:text-slate-900 shadow-sm"><Pencil className="h-3 w-3" /></button>
                      <button onClick={() => delProduct(p.id)} className="p-1.5 rounded bg-white/90 text-red-400 hover:text-red-600 shadow-sm"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <Badge className={`${CAT_COLOR[p.category] ?? "bg-slate-100 text-slate-600"} mb-2 text-[10px]`}>{p.category}</Badge>
                    <p className="text-sm font-semibold text-slate-900 leading-tight">{p.name}</p>
                    {p.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{p.description}</p>}
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400">Mercado</p>
                        <p className="text-sm font-bold text-amber-600">{formatCurrency(p.marketPrice)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400">Custo</p>
                        <p className="text-sm text-slate-500">{formatCurrency(p.costPrice)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredP.length === 0 && <p className="col-span-full text-center text-slate-400 py-12">Nenhum produto encontrado</p>}
            </div>
          </TabsContent>

          {/* Serviços — Tabela */}
          <TabsContent value="servicos">
            <div className="flex justify-end mb-4 gap-2">
              <Button variant="outline" size="sm" onClick={() => { setOpenBulkSvc(true); setCsvSvc(""); setPreviewSvc([]); setBulkResult(null) }}>
                <Upload className="h-4 w-4" />Importar em Massa
              </Button>
              <Button size="sm" onClick={() => { setFormS(emptyService()); setEditSId(null); setOpenSvc(true) }}>
                <Plus className="h-4 w-4" />Novo Serviço
              </Button>
            </div>
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Serviço</th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Categoria</th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Descrição</th>
                    <th className="text-right px-4 py-3 text-slate-600 font-medium">Custo MO</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredS.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">{s.name}</td>
                      <td className="px-4 py-3"><Badge className={`${CAT_COLOR[s.category] ?? "bg-slate-100 text-slate-600"} text-[10px]`}>{s.category}</Badge></td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{s.description ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-bold text-amber-600">{formatCurrency(s.laborCost)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => { setFormS({ name: s.name, category: s.category, description: s.description ?? "", laborCost: s.laborCost, notes: s.notes ?? "", active: s.active }); setEditSId(s.id); setOpenSvc(true) }}><Pencil className="h-3.5 w-3.5 text-slate-400" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => delService(s.id)}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredS.length === 0 && <tr><td colSpan={5} className="text-center text-slate-400 py-10">Nenhum serviço encontrado</td></tr>}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Produto individual */}
      <Dialog open={openProd} onOpenChange={setOpenProd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editPId ? "Editar Produto" : "Novo Produto"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome *</Label><Input value={formP.name} onChange={e => setFormP({ ...formP, name: e.target.value })} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Categoria *</Label>
                <Select value={formP.category} onValueChange={v => setFormP({ ...formP, category: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{PROD_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Unidade</Label><Input value={formP.unit} onChange={e => setFormP({ ...formP, unit: e.target.value })} className="mt-1" placeholder="un, m², kit" /></div>
            </div>
            <div><Label>Descrição</Label><Textarea value={formP.description} onChange={e => setFormP({ ...formP, description: e.target.value })} className="mt-1" rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Valor Mercado (R$)</Label><Input type="number" value={formP.marketPrice} onChange={e => setFormP({ ...formP, marketPrice: parseFloat(e.target.value) || 0 })} className="mt-1" /></div>
              <div><Label>Custo (R$)</Label><Input type="number" value={formP.costPrice} onChange={e => setFormP({ ...formP, costPrice: parseFloat(e.target.value) || 0 })} className="mt-1" /></div>
            </div>
            <div><Label>URL da Imagem</Label><Input value={formP.imageUrl} onChange={e => setFormP({ ...formP, imageUrl: e.target.value })} className="mt-1" placeholder="https://..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenProd(false)}>Cancelar</Button>
            <Button onClick={saveProduct} disabled={!formP.name || !formP.category || loading}>{loading ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Serviço individual */}
      <Dialog open={openSvc} onOpenChange={setOpenSvc}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editSId ? "Editar Serviço" : "Novo Serviço"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome *</Label><Input value={formS.name} onChange={e => setFormS({ ...formS, name: e.target.value })} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Categoria *</Label>
                <Select value={formS.category} onValueChange={v => setFormS({ ...formS, category: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{SVC_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Custo MO (R$)</Label><Input type="number" value={formS.laborCost} onChange={e => setFormS({ ...formS, laborCost: parseFloat(e.target.value) || 0 })} className="mt-1" /></div>
            </div>
            <div><Label>Descrição</Label><Textarea value={formS.description} onChange={e => setFormS({ ...formS, description: e.target.value })} className="mt-1" rows={2} /></div>
            <div><Label>Observações</Label><Textarea value={formS.notes} onChange={e => setFormS({ ...formS, notes: e.target.value })} className="mt-1" rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenSvc(false)}>Cancelar</Button>
            <Button onClick={saveService} disabled={!formS.name || !formS.category || loading}>{loading ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal importação em massa — Produtos */}
      <Dialog open={openBulkProd} onOpenChange={setOpenBulkProd}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-amber-500" />Importar Produtos em Massa</DialogTitle>
            <DialogDescription>Colunas: Nome, Categoria, Descrição, Valor Mercado, Custo, Unidade, URL Imagem</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => downloadTemplate(PROD_CSV_TEMPLATE, "modelo_produtos.csv")}><Download className="h-3.5 w-3.5" />Baixar Modelo</Button>
            </div>
            <Textarea
              placeholder={`Nome,Categoria,Descrição,Valor Mercado,Custo,Unidade\nGeladeira Frost Free,Eletrodomésticos,400L,2899.90,2100.00,un`}
              value={csvProd}
              onChange={e => { setCsvProd(e.target.value); parseProdCSV(e.target.value); setBulkResult(null) }}
              rows={5} className="font-mono text-xs"
            />
            {previewProd.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-700 mb-2">Preview — {previewProd.length} produtos:</p>
                <div className="rounded-lg border border-slate-200 overflow-auto max-h-44">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-slate-50 border-b">{["Nome","Categoria","Mercado","Custo","Un"].map(h => <th key={h} className="text-left px-3 py-2 text-slate-600 font-medium">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewProd.map((r, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1.5 font-medium text-slate-800">{r.name}</td>
                          <td className="px-3 py-1.5">{r.category ? <Badge className={CAT_COLOR[r.category] ?? "bg-slate-100 text-slate-600"}>{r.category}</Badge> : "—"}</td>
                          <td className="px-3 py-1.5 text-amber-600 font-semibold">{formatCurrency(r.marketPrice)}</td>
                          <td className="px-3 py-1.5 text-slate-500">{formatCurrency(r.costPrice)}</td>
                          <td className="px-3 py-1.5 text-slate-500">{r.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {bulkResult && <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{bulkResult}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenBulkProd(false)}>Fechar</Button>
            <Button onClick={importProd} disabled={!previewProd.length || bulkLoading}>
              <Upload className="h-4 w-4" />{bulkLoading ? "Importando..." : `Importar ${previewProd.length}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal importação em massa — Serviços */}
      <Dialog open={openBulkSvc} onOpenChange={setOpenBulkSvc}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-amber-500" />Importar Serviços em Massa</DialogTitle>
            <DialogDescription>Colunas: Nome, Categoria, Descrição, Custo MO, Observações</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => downloadTemplate(SVC_CSV_TEMPLATE, "modelo_servicos.csv")}><Download className="h-3.5 w-3.5" />Baixar Modelo</Button>
            </div>
            <Textarea
              placeholder={`Nome,Categoria,Descrição,Custo MO,Observações\nInstalação Elétrica,Elétrica,Instalação completa,1200.00,Por apartamento`}
              value={csvSvc}
              onChange={e => { setCsvSvc(e.target.value); parseSvcCSV(e.target.value); setBulkResult(null) }}
              rows={5} className="font-mono text-xs"
            />
            {previewSvc.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-700 mb-2">Preview — {previewSvc.length} serviços:</p>
                <div className="rounded-lg border border-slate-200 overflow-auto max-h-44">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-slate-50 border-b">{["Nome","Categoria","Custo MO"].map(h => <th key={h} className="text-left px-3 py-2 text-slate-600 font-medium">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewSvc.map((r, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1.5 font-medium text-slate-800">{r.name}</td>
                          <td className="px-3 py-1.5">{r.category ? <Badge className={CAT_COLOR[r.category] ?? "bg-slate-100 text-slate-600"}>{r.category}</Badge> : "—"}</td>
                          <td className="px-3 py-1.5 text-amber-600 font-semibold">{formatCurrency(r.laborCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {bulkResult && <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{bulkResult}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenBulkSvc(false)}>Fechar</Button>
            <Button onClick={importSvc} disabled={!previewSvc.length || bulkLoading}>
              <Upload className="h-4 w-4" />{bulkLoading ? "Importando..." : `Importar ${previewSvc.length}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
