"use client"
import { useEffect, useState } from "react"
import { Plus, Search, Car, Pencil, Trash2 } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDateInput } from "@/lib/utils"

interface Project { id: string; name: string }

interface Asset {
  id: string; description: string; assetType?: string; assignedValue: number
  purpose: string; status: string
  acquisitionDate?: string; disposalDate?: string; disposalValue?: number
  transferDoc?: string; notes?: string
  project?: { id: string; name: string }
}

const PURPOSE_LABEL: Record<string, { label: string; color: string }> = {
  uso:   { label: "Uso da Empresa",       color: "bg-blue-100 text-blue-700" },
  venda: { label: "Disponível p/ Venda",  color: "bg-amber-100 text-amber-700" },
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  em_posse: { label: "Em Posse", color: "bg-slate-100 text-slate-600" },
  vendido:  { label: "Vendido",  color: "bg-green-100 text-green-700" },
  baixado:  { label: "Baixado",  color: "bg-red-100 text-red-600" },
}

const empty = (): Partial<Asset & { projectId: string }> => ({
  description: "", assetType: "", assignedValue: 0, purpose: "uso", status: "em_posse",
  acquisitionDate: "", disposalDate: "", disposalValue: undefined, transferDoc: "", notes: "", projectId: "",
})

export default function AtivosPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState("")
  const [purposeFilter, setPurposeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty())
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const load = () => Promise.all([
    fetch("/api/assets").then(r => r.json()).then(setAssets),
    fetch("/api/projects").then(r => r.json()).then(setProjects),
  ])
  useEffect(() => { load() }, [])

  const filtered = assets.filter(a => {
    const matchSearch = !search || [a.description, a.assetType, a.project?.name].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    const matchPurpose = purposeFilter === "all" || a.purpose === purposeFilter
    const matchStatus = statusFilter === "all" || a.status === statusFilter
    return matchSearch && matchPurpose && matchStatus
  })

  const openNew = () => { setForm(empty()); setEditId(null); setSaveError(null); setOpen(true) }
  const openEdit = (a: Asset) => {
    setForm({
      description: a.description, assetType: a.assetType ?? "", assignedValue: a.assignedValue,
      purpose: a.purpose, status: a.status,
      acquisitionDate: a.acquisitionDate ?? "", disposalDate: a.disposalDate ?? "",
      disposalValue: a.disposalValue, transferDoc: a.transferDoc ?? "", notes: a.notes ?? "",
      projectId: a.project?.id ?? "",
    })
    setEditId(a.id); setSaveError(null); setOpen(true)
  }

  const save = async () => {
    if (!form.description?.trim()) { setSaveError("Descrição é obrigatória"); return }
    setLoading(true)
    setSaveError(null)
    const body = {
      description: form.description,
      assetType: form.assetType || null,
      assignedValue: parseFloat(String(form.assignedValue)) || 0,
      purpose: form.purpose || "uso",
      status: form.status || "em_posse",
      acquisitionDate: form.acquisitionDate || null,
      disposalDate: form.status === "vendido" ? (form.disposalDate || null) : null,
      disposalValue: form.status === "vendido" ? (form.disposalValue ?? null) : null,
      transferDoc: form.transferDoc || null,
      notes: form.notes || null,
      projectId: form.projectId || null,
    }
    const res = editId
      ? await fetch(`/api/assets/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch("/api/assets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setSaveError(err?.error ?? "Erro ao salvar")
      setLoading(false)
      return
    }
    await load()
    setOpen(false)
    setLoading(false)
  }

  const del = async (id: string) => {
    if (!confirm("Excluir este bem?")) return
    await fetch(`/api/assets/${id}`, { method: "DELETE" })
    await load()
  }

  return (
    <>
      <Topbar title="Bens / Ativos" description={`${assets.length} bens cadastrados`}
        action={<Button onClick={openNew}><Plus className="h-4 w-4" />Novo Bem</Button>} />
      <div className="p-6 space-y-4">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Buscar bem..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[{ v: "all", l: "Todos" }, { v: "uso", l: "Uso da Empresa" }, { v: "venda", l: "Disponível p/ Venda" }].map(({ v, l }) => (
              <button key={v} onClick={() => setPurposeFilter(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${purposeFilter === v ? "bg-amber-500 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                {l}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {[{ v: "all", l: "Qualquer status" }, { v: "em_posse", l: "Em Posse" }, { v: "vendido", l: "Vendido" }, { v: "baixado", l: "Baixado" }].map(({ v, l }) => (
              <button key={v} onClick={() => setStatusFilter(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${statusFilter === v ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(a => (
            <Card key={a.id} className="hover:border-amber-300 hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      <Car className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{a.description}</p>
                      {a.assetType && <p className="text-xs text-slate-500">{a.assetType}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(a)}><Pencil className="h-3.5 w-3.5 text-slate-500" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del(a.id)}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-slate-600">Valor atribuído: <span className="font-medium">{formatCurrency(a.assignedValue)}</span></p>
                  {a.project && <p className="text-xs text-slate-500">Projeto: {a.project.name}</p>}
                  {a.status === "vendido" && a.disposalValue != null && (
                    <p className="text-xs text-green-600">Vendido por {formatCurrency(a.disposalValue)}</p>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <Badge className={PURPOSE_LABEL[a.purpose]?.color ?? "bg-slate-100 text-slate-600"}>{PURPOSE_LABEL[a.purpose]?.label ?? a.purpose}</Badge>
                  <Badge className={STATUS_LABEL[a.status]?.color ?? "bg-slate-100 text-slate-600"}>{STATUS_LABEL[a.status]?.label ?? a.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="col-span-full text-center text-slate-400 py-12">Nenhum bem encontrado</p>}
        </div>
      </div>

      <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) setOpen(false) }}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? "Editar Bem" : "Novo Bem"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Descrição *</Label><Input value={form.description ?? ""} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1" placeholder="Ex: Fiat Strada 2020 placa ABC-1234" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tipo do Bem</Label><Input value={form.assetType ?? ""} onChange={e => setForm({ ...form, assetType: e.target.value })} className="mt-1" placeholder="Ex: Veículo" /></div>
              <div><Label>Valor Atribuído (R$)</Label><Input type="number" value={form.assignedValue ?? 0} onChange={e => setForm({ ...form, assignedValue: parseFloat(e.target.value) })} className="mt-1" /></div>
            </div>
            <div>
              <Label>Finalidade</Label>
              <div className="mt-1 flex rounded-lg border border-slate-200 overflow-hidden">
                {(["uso", "venda"] as const).map(p => (
                  <button key={p} type="button" onClick={() => setForm({ ...form, purpose: p })}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors border-l first:border-l-0 border-slate-200 ${form.purpose === p ? "bg-amber-500 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                    {PURPOSE_LABEL[p].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select value={form.status ?? "em_posse"} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="em_posse">Em Posse</SelectItem>
                    <SelectItem value="vendido">Vendido</SelectItem>
                    <SelectItem value="baixado">Baixado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Projeto (opcional)</Label>
                <Select value={(form as Record<string, string>).projectId ?? ""} onValueChange={v => setForm({ ...form, projectId: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent><SelectItem value="">—</SelectItem>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Data de Aquisição</Label><Input type="date" value={formatDateInput(form.acquisitionDate)} onChange={e => setForm({ ...form, acquisitionDate: e.target.value })} className="mt-1" /></div>
              <div><Label>Documento de Transferência</Label><Input value={form.transferDoc ?? ""} onChange={e => setForm({ ...form, transferDoc: e.target.value })} className="mt-1" placeholder="Ex: nº do DUT" /></div>
            </div>
            {form.status === "vendido" && (
              <div className="rounded-lg border border-green-200 bg-green-50/50 p-3 grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-green-700">Data da Venda</Label><Input type="date" value={formatDateInput(form.disposalDate)} onChange={e => setForm({ ...form, disposalDate: e.target.value })} className="mt-1 h-8 text-xs bg-white" /></div>
                <div><Label className="text-xs text-green-700">Valor de Venda (R$)</Label><Input type="number" value={form.disposalValue ?? ""} onChange={e => setForm({ ...form, disposalValue: parseFloat(e.target.value) })} className="mt-1 h-8 text-xs bg-white" /></div>
              </div>
            )}
            <div><Label>Observações</Label><Textarea value={form.notes ?? ""} onChange={e => setForm({ ...form, notes: e.target.value })} className="mt-1" rows={2} /></div>
          </div>
          {saveError && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-2 mx-4 mb-2">{saveError}</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!form.description || loading}>{loading ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
