"use client"
import { useEffect, useState } from "react"
import { Plus, Search, Building2, MapPin, Calendar, Pencil, Trash2, ChevronDown, ChevronRight, Home, Upload, Download } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, formatDateInput, PROJECT_STATUS, STEP_STATUS, calcStepCompletion } from "@/lib/utils"

const PLANS = ["Pacote Essencial", "Pacote Premium", "Pacote Personalizado"]

interface Project {
  id: string; name: string; address?: string; status: string
  totalValue: number; startDate?: string; deliveryDate?: string; notes?: string
  clientId?: string; unitCount: number
  client?: { id: string; name: string }
}

interface Apartment {
  id: string; projectId: string; number: string; area?: number; bedrooms?: number
  plan?: string; totalValue: number; notes?: string
  stepEletrica: string; stepPintura: string; stepAcabamentos: string
  stepMoveis: string; stepEletrodomesticos: string; stepPersonalizacao: string
}

interface Client { id: string; name: string }

const emptyAptForm = () => ({
  number: "", area: "" as string | number, bedrooms: "" as string | number,
  plan: "", totalValue: 0, notes: "",
})

export default function ProjetosPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // project modal
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // bulk import
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkCsv, setBulkCsv] = useState("")
  const [bulkPreview, setBulkPreview] = useState<Array<{ project: string; address: string; client: string; status: string; totalValue: number; number: string; area: string; bedrooms: string; plan: string; aptValue: number }>>([])
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkResult, setBulkResult] = useState<string | null>(null)

  // apartment modal
  const [aptOpen, setAptOpen] = useState(false)
  const [aptEditId, setAptEditId] = useState<string | null>(null)
  const [aptProjectId, setAptProjectId] = useState<string | null>(null)
  const [aptForm, setAptForm] = useState(emptyAptForm())
  const [aptLoading, setAptLoading] = useState(false)
  const [aptError, setAptError] = useState<string | null>(null)

  const load = () => Promise.all([
    fetch("/api/projects").then(r => r.json()).then(setProjects),
    fetch("/api/clients").then(r => r.json()).then(setClients),
    fetch("/api/apartments").then(r => r.json()).then(setApartments),
  ])
  useEffect(() => { load() }, [])

  const filtered = projects.filter(p => {
    const m = [p.name, p.address, p.client?.name].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    return m && (statusFilter === "all" || p.status === statusFilter)
  })

  const aptsOf = (projectId: string) => apartments.filter(a => a.projectId === projectId)

  const avgCompletion = (projectId: string) => {
    const apts = aptsOf(projectId)
    if (apts.length === 0) return 0
    return Math.round(apts.reduce((acc, a) => acc + calcStepCompletion(a), 0) / apts.length)
  }

  // --- Project CRUD ---
  const openNew = () => {
    setForm({ name: "", address: "", status: "orcamento", totalValue: 0, unitCount: 1 })
    setEditId(null); setSaveError(null); setOpen(true)
  }

  const openEdit = (p: Project) => {
    setForm({
      name: p.name, address: p.address ?? "", status: p.status,
      totalValue: p.totalValue, notes: p.notes ?? "",
      startDate: p.startDate ?? "", deliveryDate: p.deliveryDate ?? "",
      clientId: p.client?.id ?? p.clientId ?? "",
      unitCount: p.unitCount ?? 1,
    })
    setEditId(p.id); setSaveError(null); setOpen(true)
  }

  const saveProject = async () => {
    setLoading(true); setSaveError(null)
    const toIso = (d: unknown) => d && String(d) ? new Date(String(d)).toISOString() : null
    const body = {
      name: form.name, address: form.address || null, status: form.status,
      totalValue: parseFloat(String(form.totalValue)) || 0,
      notes: form.notes || null,
      startDate: toIso(form.startDate), deliveryDate: toIso(form.deliveryDate),
      clientId: form.clientId || null,
      unitCount: parseInt(String(form.unitCount)) || 1,
    }
    try {
      const res = editId
        ? await fetch(`/api/projects/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setSaveError(err?.error ?? `Erro ${res.status}`); setLoading(false); return
      }
      const saved = await res.json()
      // auto-create apartments for new projects
      if (!editId && body.unitCount > 0) {
        for (let i = 1; i <= body.unitCount; i++) {
          await fetch("/api/apartments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId: saved.id, number: String(i), totalValue: body.totalValue / body.unitCount }),
          })
        }
        setExpandedId(saved.id)
      }
      await load(); setOpen(false)
    } catch (e) { setSaveError(String(e)) }
    setLoading(false)
  }

  const delProject = async (id: string) => {
    if (!confirm("Excluir projeto e todos os apartamentos?")) return
    await fetch(`/api/projects/${id}`, { method: "DELETE" }); await load()
  }

  // --- Apartment CRUD ---
  const openNewApt = (projectId: string) => {
    setAptForm(emptyAptForm()); setAptEditId(null); setAptProjectId(projectId); setAptError(null); setAptOpen(true)
  }

  const openEditApt = (a: Apartment) => {
    setAptForm({
      number: a.number, area: a.area ?? "", bedrooms: a.bedrooms ?? "",
      plan: a.plan ?? "", totalValue: a.totalValue, notes: a.notes ?? "",
    })
    setAptEditId(a.id); setAptProjectId(a.projectId); setAptError(null); setAptOpen(true)
  }

  const saveApt = async () => {
    setAptLoading(true); setAptError(null)
    const body = {
      projectId: aptProjectId,
      number: aptForm.number,
      area: aptForm.area !== "" ? parseFloat(String(aptForm.area)) : null,
      bedrooms: aptForm.bedrooms !== "" ? parseInt(String(aptForm.bedrooms)) : null,
      plan: aptForm.plan || null,
      totalValue: parseFloat(String(aptForm.totalValue)) || 0,
      notes: aptForm.notes || null,
    }
    try {
      const res = aptEditId
        ? await fetch(`/api/apartments/${aptEditId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/apartments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setAptError(err?.error ?? `Erro ${res.status}`); setAptLoading(false); return
      }
      await load(); setAptOpen(false)
    } catch (e) { setAptError(String(e)) }
    setAptLoading(false)
  }

  const delApt = async (id: string) => {
    if (!confirm("Excluir apartamento?")) return
    await fetch(`/api/apartments/${id}`, { method: "DELETE" }); await load()
  }

  const parseBulkCsv = (text: string) => {
    const lines = text.trim().split("\n").filter(l => l.trim())
    const data = lines[0]?.toLowerCase().startsWith("projeto") ? lines.slice(1) : lines
    const parsed = data.map(line => {
      const c = line.split(",").map(s => s.trim().replace(/^"|"$/g, ""))
      return { project: c[0] ?? "", address: c[1] ?? "", client: c[2] ?? "", status: c[3] ?? "orcamento", totalValue: parseFloat(c[4]) || 0, number: c[5] ?? "", area: c[6] ?? "", bedrooms: c[7] ?? "", plan: c[8] ?? "", aptValue: parseFloat(c[9]) || 0 }
    }).filter(r => r.project)
    setBulkPreview(parsed)
  }

  const importBulk = async () => {
    if (!bulkPreview.length) return
    setBulkLoading(true)
    let ok = 0, err = 0
    const projectMap: Record<string, string> = {}
    for (const row of bulkPreview) {
      try {
        if (!projectMap[row.project]) {
          const clientRes = await fetch("/api/clients").then(r => r.json()) as Client[]
          const client = clientRes.find((c: Client) => c.name.toLowerCase() === row.client.toLowerCase())
          const projRes = await fetch("/api/projects", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: row.project, address: row.address || null, clientId: client?.id || null, status: row.status || "orcamento", totalValue: row.totalValue }),
          })
          const proj = await projRes.json()
          projectMap[row.project] = proj.id
        }
        await fetch("/api/apartments", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId: projectMap[row.project], number: row.number, area: row.area ? parseFloat(row.area) : null, bedrooms: row.bedrooms ? parseInt(row.bedrooms) : null, plan: row.plan || null, totalValue: row.aptValue }),
        })
        ok++
      } catch { err++ }
    }
    await load()
    setBulkResult(`${ok} apartamentos importados${err > 0 ? `, ${err} com erro` : ""}`)
    setBulkLoading(false)
  }

  const CSV_TEMPLATE = `Projeto,Endereço,Cliente,Status,ValorTotal,NumApto,Metragem,Dormitórios,Plano,ValorApto
RED 73,Rua Exemplo 100,João Silva,execucao,200000,101,45,2,Pacote Premium,25000
RED 73,Rua Exemplo 100,João Silva,execucao,200000,102,50,3,Pacote Premium,30000`

  return (
    <>
      <Topbar
        title="Projetos"
        description={`${projects.length} projetos`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setBulkOpen(true); setBulkCsv(""); setBulkPreview([]); setBulkResult(null) }}>
              <Upload className="h-4 w-4" />Importar CSV
            </Button>
            <Button onClick={openNew}><Plus className="h-4 w-4" />Novo Projeto</Button>
          </div>
        }
      />
      <div className="p-6 space-y-4">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Buscar projeto, cliente, endereço..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[{ value: "all", label: "Todos" }, ...Object.entries(PROJECT_STATUS).map(([k, v]) => ({ value: k, label: v.label }))].map(({ value, label }) => (
              <button key={value} onClick={() => setStatusFilter(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === value ? "bg-amber-500 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map(p => {
            const apts = aptsOf(p.id)
            const completion = avgCompletion(p.id)
            const st = PROJECT_STATUS[p.status]
            const isExpanded = expandedId === p.id

            return (
              <Card key={p.id} className="hover:border-amber-200 transition-all">
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{p.name}</p>
                        {p.client && <p className="text-xs text-slate-500">{p.client.name}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={st?.color ?? ""}>{st?.label}</Badge>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => delProject(p.id)}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button>
                    </div>
                  </div>

                  {/* Info row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
                    {p.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.address}</span>}
                    {p.deliveryDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Entrega: {formatDate(p.deliveryDate)}</span>}
                    <span className="flex items-center gap-1"><Home className="h-3 w-3" />{p.unitCount ?? 1} unidade{(p.unitCount ?? 1) !== 1 ? "s" : ""}</span>
                  </div>

                  {/* Progress + value */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-slate-500">Progresso médio</span>
                        <span className="text-xs font-semibold text-slate-700">{completion}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200">
                        <div className="h-1.5 rounded-full bg-amber-500 transition-all" style={{ width: `${completion}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-500">Valor total</p>
                      <p className="text-sm font-bold text-amber-600">{formatCurrency(p.totalValue)}</p>
                    </div>
                  </div>

                  {/* Apartments toggle */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-amber-600 transition-colors w-full"
                  >
                    {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    Apartamentos ({apts.length})
                  </button>

                  {/* Apartments list */}
                  {isExpanded && (
                    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                      {apts.map(a => {
                        const pct = calcStepCompletion(a)
                        return (
                          <div key={a.id} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-600 text-xs font-bold">
                              {a.number || "—"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-medium text-slate-800">Apto {a.number || "s/n"}</span>
                                {a.plan && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{a.plan}</Badge>}
                                {a.area && <span className="text-[10px] text-slate-500">{a.area}m²</span>}
                                {a.bedrooms && <span className="text-[10px] text-slate-500">{a.bedrooms} dorm.</span>}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1 rounded-full bg-slate-200">
                                  <div className="h-1 rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-[10px] text-slate-500 shrink-0">{pct}%</span>
                                {a.totalValue > 0 && <span className="text-[10px] font-medium text-amber-600 shrink-0">{formatCurrency(a.totalValue)}</span>}
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openEditApt(a)}><Pencil className="h-3 w-3" /></Button>
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => delApt(a.id)}><Trash2 className="h-3 w-3 text-red-400" /></Button>
                            </div>
                          </div>
                        )
                      })}
                      <button
                        onClick={() => openNewApt(p.id)}
                        className="flex items-center gap-2 text-xs text-amber-600 hover:text-amber-700 font-medium px-3 py-1.5 rounded-lg border border-dashed border-amber-300 hover:border-amber-400 transition-colors w-full"
                      >
                        <Plus className="h-3.5 w-3.5" /> Adicionar apartamento
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
          {filtered.length === 0 && <p className="text-center text-slate-400 py-12">Nenhum projeto encontrado</p>}
        </div>
      </div>

      {/* Project modal */}
      <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) setOpen(false) }}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Editar Projeto" : "Novo Projeto"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome *</Label><Input value={String(form.name ?? "")} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
            <div><Label>Endereço</Label><Input value={String(form.address ?? "")} onChange={e => setForm({ ...form, address: e.target.value })} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Cliente</Label>
                <Select value={String(form.clientId ?? "")} onValueChange={v => setForm({ ...form, clientId: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={String(form.status ?? "orcamento")} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(PROJECT_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Qtd. Unidades</Label>
                <Input type="number" min={1} value={String(form.unitCount ?? 1)} onChange={e => setForm({ ...form, unitCount: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Valor Total (R$)</Label>
                <Input type="number" value={String(form.totalValue ?? 0)} onChange={e => setForm({ ...form, totalValue: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Início</Label><Input type="date" value={formatDateInput(form.startDate as string)} onChange={e => setForm({ ...form, startDate: e.target.value })} className="mt-1" /></div>
              <div><Label>Entrega</Label><Input type="date" value={formatDateInput(form.deliveryDate as string)} onChange={e => setForm({ ...form, deliveryDate: e.target.value })} className="mt-1" /></div>
            </div>
            <div><Label>Observações</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm({ ...form, notes: e.target.value })} className="mt-1" rows={2} /></div>
            {!editId && (
              <p className="text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded p-2">
                Ao salvar, serão criados automaticamente {parseInt(String(form.unitCount)) || 1} apartamento(s) para preenchimento.
              </p>
            )}
          </div>
          {saveError && <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-2">{saveError}</div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={saveProject} disabled={!form.name || loading}>{loading ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk import modal */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-amber-500" />Importar Projetos em Massa</DialogTitle>
            <DialogDescription>
              Cole os dados em CSV. Uma linha por apartamento. Projetos com mesmo nome são agrupados automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => {
                const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" })
                const a = document.createElement("a"); a.href = URL.createObjectURL(blob)
                a.download = "modelo_projetos.csv"; a.click()
              }}><Download className="h-3.5 w-3.5" />Baixar Modelo</Button>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs font-mono text-slate-600 overflow-x-auto">
              Colunas: <strong>Projeto, Endereço, Cliente, Status, ValorTotal, NumApto, Metragem, Dormitórios, Plano, ValorApto</strong>
            </div>
            <Textarea
              placeholder={CSV_TEMPLATE}
              value={bulkCsv}
              onChange={e => { setBulkCsv(e.target.value); parseBulkCsv(e.target.value); setBulkResult(null) }}
              rows={5} className="font-mono text-xs"
            />
            {bulkPreview.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-700 mb-2">Preview — {bulkPreview.length} apartamentos:</p>
                <div className="rounded-lg border border-slate-200 overflow-auto max-h-48">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-slate-50 border-b">{["Projeto","Cliente","Apto","M²","Dorm","Plano","Valor"].map(h => <th key={h} className="text-left px-3 py-2 text-slate-600 font-medium">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {bulkPreview.map((r, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1.5 font-medium text-slate-800">{r.project}</td>
                          <td className="px-3 py-1.5 text-slate-600">{r.client || "—"}</td>
                          <td className="px-3 py-1.5">{r.number}</td>
                          <td className="px-3 py-1.5">{r.area || "—"}</td>
                          <td className="px-3 py-1.5">{r.bedrooms || "—"}</td>
                          <td className="px-3 py-1.5">{r.plan || "—"}</td>
                          <td className="px-3 py-1.5">{r.aptValue > 0 ? `R$ ${r.aptValue.toLocaleString("pt-BR")}` : "—"}</td>
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
            <Button variant="outline" onClick={() => setBulkOpen(false)}>Fechar</Button>
            <Button onClick={importBulk} disabled={!bulkPreview.length || bulkLoading}>
              <Upload className="h-4 w-4" />{bulkLoading ? "Importando..." : `Importar ${bulkPreview.length} apartamentos`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apartment modal */}
      <Dialog open={aptOpen} onOpenChange={(v) => { if (!v && !aptLoading) setAptOpen(false) }}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-md">
          <DialogHeader><DialogTitle>{aptEditId ? "Editar Apartamento" : "Novo Apartamento"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Número/ID</Label>
                <Input value={aptForm.number} onChange={e => setAptForm({ ...aptForm, number: e.target.value })} className="mt-1" placeholder="Ex: 101" />
              </div>
              <div>
                <Label>Metragem (m²)</Label>
                <Input type="number" value={String(aptForm.area)} onChange={e => setAptForm({ ...aptForm, area: e.target.value })} className="mt-1" placeholder="Ex: 45" />
              </div>
              <div>
                <Label>Dormitórios</Label>
                <Input type="number" value={String(aptForm.bedrooms)} onChange={e => setAptForm({ ...aptForm, bedrooms: e.target.value })} className="mt-1" placeholder="Ex: 2" />
              </div>
            </div>
            <div>
              <Label>Plano escolhido</Label>
              <Select value={aptForm.plan} onValueChange={v => setAptForm({ ...aptForm, plan: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione o plano" /></SelectTrigger>
                <SelectContent>
                  {PLANS.map(pl => <SelectItem key={pl} value={pl}>{pl}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valor do apartamento (R$)</Label>
              <Input type="number" value={String(aptForm.totalValue)} onChange={e => setAptForm({ ...aptForm, totalValue: parseFloat(e.target.value) || 0 })} className="mt-1" />
            </div>
            <div><Label>Observações</Label><Textarea value={aptForm.notes} onChange={e => setAptForm({ ...aptForm, notes: e.target.value })} className="mt-1" rows={2} /></div>
          </div>
          {aptError && <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-2">{aptError}</div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAptOpen(false)}>Cancelar</Button>
            <Button onClick={saveApt} disabled={aptLoading}>{aptLoading ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
