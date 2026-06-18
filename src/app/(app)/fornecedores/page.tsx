"use client"
import { useEffect, useState } from "react"
import { Plus, Search, Truck, Phone, Mail, Pencil, Trash2, Upload, Download } from "lucide-react"
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

const CATEGORIES = ["Móveis", "Eletrodomésticos", "Material de Construção", "Mão de Obra", "Outros"]

interface Supplier {
  id: string; name: string; cnpj?: string; contactName?: string
  phone?: string; email?: string; category?: string; paymentTerms?: string; notes?: string
  _count?: { transactions: number }
}

const empty = (): Omit<Supplier, "id" | "_count"> => ({
  name: "", cnpj: "", contactName: "", phone: "", email: "", category: "", paymentTerms: "", notes: "",
})

const CATEGORY_COLORS: Record<string, string> = {
  "Móveis": "bg-blue-100 text-blue-700",
  "Eletrodomésticos": "bg-purple-100 text-purple-700",
  "Material de Construção": "bg-orange-100 text-orange-700",
  "Mão de Obra": "bg-green-100 text-green-700",
  "Outros": "bg-slate-100 text-slate-600",
}

const CSV_TEMPLATE = `Nome,CNPJ,Contato,Telefone,E-mail,Categoria,Condição Pgto
Leo Madeiras,12.345.678/0001-90,Leonardo,,(11) 3000-1234,Móveis,30/60/90 dias`

export default function FornecedoresPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState("all")
  const [open, setOpen] = useState(false)
  const [openBulk, setOpenBulk] = useState(false)
  const [form, setForm] = useState(empty())
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [csvText, setCsvText] = useState("")
  const [csvPreview, setCsvPreview] = useState<Omit<Supplier, "id" | "_count">[]>([])
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkResult, setBulkResult] = useState<string | null>(null)

  const load = () => fetch("/api/suppliers").then(r => r.json()).then(setSuppliers)
  useEffect(() => { load() }, [])

  const filtered = suppliers.filter(s => {
    const match = [s.name, s.cnpj, s.contactName, s.phone].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    return match && (catFilter === "all" || s.category === catFilter)
  })

  const openNew = () => { setForm(empty()); setEditId(null); setOpen(true) }
  const openEdit = (s: Supplier) => {
    setForm({ name: s.name, cnpj: s.cnpj ?? "", contactName: s.contactName ?? "", phone: s.phone ?? "", email: s.email ?? "", category: s.category ?? "", paymentTerms: s.paymentTerms ?? "", notes: s.notes ?? "" })
    setEditId(s.id); setOpen(true)
  }

  const save = async () => {
    setLoading(true)
    if (editId) await fetch(`/api/suppliers/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    else await fetch("/api/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    await load(); setOpen(false); setLoading(false)
  }

  const del = async (id: string) => { if (!confirm("Excluir?")) return; await fetch(`/api/suppliers/${id}`, { method: "DELETE" }); await load() }

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n").filter(l => l.trim())
    const dataLines = lines[0]?.toLowerCase().startsWith("nome") ? lines.slice(1) : lines
    const parsed = dataLines.map(line => {
      const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""))
      return { name: cols[0] ?? "", cnpj: cols[1] ?? "", contactName: cols[2] ?? "", phone: cols[3] ?? "", email: cols[4] ?? "", category: cols[5] ?? "", paymentTerms: cols[6] ?? "", notes: cols[7] ?? "" }
    }).filter(r => r.name)
    setCsvPreview(parsed)
  }

  const importBulk = async () => {
    if (!csvPreview.length) return
    setBulkLoading(true)
    let ok = 0, err = 0
    for (const row of csvPreview) {
      try { await fetch("/api/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(row) }); ok++ }
      catch { err++ }
    }
    await load()
    setBulkResult(`✅ ${ok} importados${err > 0 ? `, ❌ ${err} com erro` : ""}`)
    setBulkLoading(false)
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob)
    a.download = "modelo_fornecedores.csv"; a.click()
  }

  return (
    <>
      <Topbar
        title="Fornecedores"
        description={`${suppliers.length} fornecedores cadastrados`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setOpenBulk(true); setCsvText(""); setCsvPreview([]); setBulkResult(null) }}>
              <Upload className="h-4 w-4" />Importar em Massa
            </Button>
            <Button onClick={openNew}><Plus className="h-4 w-4" />Novo Fornecedor</Button>
          </div>
        }
      />
      <div className="p-6 space-y-4">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Buscar fornecedor..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", ...CATEGORIES].map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${catFilter === c ? "bg-amber-500 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                {c === "all" ? "Todos" : c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(s => (
            <Card key={s.id} className="hover:border-amber-300 hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{s.name}</p>
                      {s.cnpj && <p className="text-xs text-slate-500">{s.cnpj}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5 text-slate-500" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del(s.id)}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {s.contactName && <p className="text-xs text-slate-600">Contato: {s.contactName}</p>}
                  {s.phone && <p className="flex items-center gap-2 text-xs text-slate-600"><Phone className="h-3 w-3 text-slate-400" />{s.phone}</p>}
                  {s.email && <p className="flex items-center gap-2 text-xs text-slate-600"><Mail className="h-3 w-3 text-slate-400" />{s.email}</p>}
                  {s.paymentTerms && <p className="text-xs text-slate-500">Pgto: {s.paymentTerms}</p>}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {s.category && <Badge className={CATEGORY_COLORS[s.category] ?? "bg-slate-100 text-slate-600"}>{s.category}</Badge>}
                  {(s._count?.transactions ?? 0) > 0 && <span className="text-xs text-slate-400">{s._count?.transactions} transações</span>}
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="col-span-full text-center text-slate-400 py-12">Nenhum fornecedor encontrado</p>}
        </div>
      </div>

      {/* Modal individual */}
      <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) setOpen(false) }}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>CNPJ</Label><Input value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} className="mt-1" /></div>
              <div><Label>Contato</Label><Input value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Telefone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-1" /></div>
              <div><Label>E-mail</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Condição de Pgto</Label><Input value={form.paymentTerms} onChange={e => setForm({ ...form, paymentTerms: e.target.value })} className="mt-1" placeholder="Ex: 30/60 dias" /></div>
            </div>
            <div><Label>Observações</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="mt-1" rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!form.name || loading}>{loading ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal importação em massa */}
      <Dialog open={openBulk} onOpenChange={setOpenBulk}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-amber-500" />Importar Fornecedores em Massa</DialogTitle>
            <DialogDescription>Cole os dados em CSV. Colunas: Nome, CNPJ, Contato, Telefone, E-mail, Categoria, Condição Pgto</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={downloadTemplate}><Download className="h-3.5 w-3.5" />Baixar Modelo</Button>
            </div>
            <Textarea
              placeholder={`Nome,CNPJ,Contato,Telefone,E-mail,Categoria,Condição Pgto\nLeo Madeiras,12.345.678/0001-90,Leonardo,(11)3000-1234,,Móveis,30/60 dias`}
              value={csvText}
              onChange={e => { setCsvText(e.target.value); parseCSV(e.target.value); setBulkResult(null) }}
              rows={5} className="font-mono text-xs"
            />
            {csvPreview.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-700 mb-2">Preview — {csvPreview.length} registros:</p>
                <div className="rounded-lg border border-slate-200 overflow-auto max-h-44">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-slate-50 border-b">{["Nome","CNPJ","Contato","Telefone","Categoria"].map(h => <th key={h} className="text-left px-3 py-2 text-slate-600 font-medium">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {csvPreview.map((r, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1.5 font-medium text-slate-800">{r.name}</td>
                          <td className="px-3 py-1.5 text-slate-600">{r.cnpj || "—"}</td>
                          <td className="px-3 py-1.5 text-slate-600">{r.contactName || "—"}</td>
                          <td className="px-3 py-1.5 text-slate-600">{r.phone || "—"}</td>
                          <td className="px-3 py-1.5">{r.category ? <Badge className={CATEGORY_COLORS[r.category] ?? "bg-slate-100 text-slate-600"}>{r.category}</Badge> : "—"}</td>
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
            <Button variant="outline" onClick={() => setOpenBulk(false)}>Fechar</Button>
            <Button onClick={importBulk} disabled={!csvPreview.length || bulkLoading}>
              <Upload className="h-4 w-4" />{bulkLoading ? "Importando..." : `Importar ${csvPreview.length}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
