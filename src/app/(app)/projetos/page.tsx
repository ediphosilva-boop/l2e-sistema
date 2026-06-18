"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Search, Building2, MapPin, Calendar, Pencil, Trash2 } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, formatDateInput, PROJECT_STATUS, STEP_STATUS, calcProjectCompletion } from "@/lib/utils"

interface Project {
  id: string; name: string; address?: string; status: string
  totalValue: number; startDate?: string; deliveryDate?: string; notes?: string
  clientId?: string
  stepEletrica: string; stepPintura: string; stepAcabamentos: string
  stepMoveis: string; stepEletrodomesticos: string; stepPersonalizacao: string
  client?: { id: string; name: string }
}

interface Client { id: string; name: string }

const STEPS = [
  { key: "stepEletrica", label: "Elétrica" },
  { key: "stepPintura", label: "Pintura" },
  { key: "stepAcabamentos", label: "Acabamentos" },
  { key: "stepMoveis", label: "Móveis" },
  { key: "stepEletrodomesticos", label: "Eletros" },
  { key: "stepPersonalizacao", label: "Personal." },
] as const

export default function ProjetosPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Project>>({})
  const [loading, setLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const load = () => Promise.all([
    fetch("/api/projects").then(r => r.json()).then(setProjects),
    fetch("/api/clients").then(r => r.json()).then(setClients),
  ])
  useEffect(() => { load() }, [])

  const filtered = projects.filter(p => {
    const m = [p.name, p.address, p.client?.name].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    return m && (statusFilter === "all" || p.status === statusFilter)
  })

  const openNew = () => {
    setForm({ name: "", address: "", status: "orcamento", totalValue: 0, stepEletrica: "pendente", stepPintura: "pendente", stepAcabamentos: "pendente", stepMoveis: "pendente", stepEletrodomesticos: "pendente", stepPersonalizacao: "pendente" })
    setEditId(null); setSaveError(null); setOpen(true)
  }

  const openEdit = (p: Project) => {
    setForm({
      name: p.name, address: p.address ?? "", status: p.status,
      totalValue: p.totalValue, notes: p.notes ?? "",
      startDate: p.startDate ?? "", deliveryDate: p.deliveryDate ?? "",
      clientId: p.client?.id ?? p.clientId ?? "",
      stepEletrica: p.stepEletrica, stepPintura: p.stepPintura,
      stepAcabamentos: p.stepAcabamentos, stepMoveis: p.stepMoveis,
      stepEletrodomesticos: p.stepEletrodomesticos, stepPersonalizacao: p.stepPersonalizacao,
    })
    setEditId(p.id); setSaveError(null); setOpen(true)
  }

  const save = async () => {
    setLoading(true)
    setSaveError(null)
    const toIso = (d: string | undefined) => d ? new Date(d).toISOString() : null
    const body = {
      name: form.name,
      address: form.address || null,
      status: form.status,
      totalValue: parseFloat(String(form.totalValue)) || 0,
      notes: form.notes || null,
      startDate: toIso(form.startDate as string | undefined),
      deliveryDate: toIso(form.deliveryDate as string | undefined),
      clientId: (form.clientId as string | undefined) || null,
      stepEletrica: form.stepEletrica,
      stepPintura: form.stepPintura,
      stepAcabamentos: form.stepAcabamentos,
      stepMoveis: form.stepMoveis,
      stepEletrodomesticos: form.stepEletrodomesticos,
      stepPersonalizacao: form.stepPersonalizacao,
    }
    try {
      const res = editId
        ? await fetch(`/api/projects/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setSaveError(err?.error ?? `Erro ${res.status}: ${res.statusText}`)
        setLoading(false)
        return
      }
      await load()
      setOpen(false)
    } catch (e) {
      setSaveError(String(e))
    }
    setLoading(false)
  }

  const del = async (id: string) => {
    if (!confirm("Excluir projeto?")) return
    await fetch(`/api/projects/${id}`, { method: "DELETE" }); await load()
  }

  return (
    <>
      <Topbar
        title="Projetos"
        description={`${projects.length} projetos`}
        action={<Button onClick={openNew}><Plus className="h-4 w-4" />Novo Projeto</Button>}
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => {
            const completion = calcProjectCompletion(p)
            const st = PROJECT_STATUS[p.status]
            return (
              <Card key={p.id} className="hover:border-amber-300 hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <Link href={`/projetos/${p.id}`} className="font-semibold text-slate-900 hover:text-amber-600 transition-colors text-sm">{p.name}</Link>
                        {p.client && <p className="text-xs text-slate-500">{p.client.name}</p>}
                      </div>
                    </div>
                    <Badge className={st?.color ?? ""}>{st?.label}</Badge>
                  </div>

                  {p.address && (
                    <p className="flex items-start gap-1.5 text-xs text-slate-500 mb-3">
                      <MapPin className="h-3 w-3 mt-0.5 shrink-0" />{p.address}
                    </p>
                  )}

                  {/* Progresso */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">Progresso</span>
                      <span className="text-xs font-semibold text-slate-700">{completion}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200">
                      <div className="h-1.5 rounded-full bg-amber-500 transition-all" style={{ width: `${completion}%` }} />
                    </div>
                  </div>

                  {/* Etapas */}
                  <div className="grid grid-cols-3 gap-1 mb-3">
                    {STEPS.map(({ key, label }) => {
                      const st = STEP_STATUS[p[key]] ?? STEP_STATUS.pendente
                      return (
                        <div key={key} className={`rounded px-1.5 py-0.5 text-center text-[9px] font-medium ${st.color}`}>
                          <div className="text-[8px] opacity-70">{label}</div>
                          {st.label}
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Valor total</p>
                      <p className="text-sm font-bold text-amber-600">{formatCurrency(p.totalValue)}</p>
                    </div>
                    {p.deliveryDate && (
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Entrega</p>
                        <p className="flex items-center gap-1 text-xs text-slate-700"><Calendar className="h-3 w-3" />{formatDate(p.deliveryDate)}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 mt-3 justify-end">
                    <Link href={`/projetos/${p.id}`}>
                      <Button size="sm" variant="outline">Ver detalhes</Button>
                    </Link>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del(p.id)}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {filtered.length === 0 && <p className="col-span-full text-center text-slate-400 py-12">Nenhum projeto encontrado</p>}
        </div>
      </div>

      <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) setOpen(false) }}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Editar Projeto" : "Novo Projeto"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome *</Label><Input value={form.name ?? ""} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
            <div><Label>Endereço</Label><Input value={form.address ?? ""} onChange={e => setForm({ ...form, address: e.target.value })} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Cliente</Label>
                <Select value={form.clientId ?? ""} onValueChange={v => setForm({ ...form, clientId: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status ?? "orcamento"} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(PROJECT_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Valor Total (R$)</Label><Input type="number" value={form.totalValue ?? 0} onChange={e => setForm({ ...form, totalValue: parseFloat(e.target.value) })} className="mt-1" /></div>
              <div><Label>Início</Label><Input type="date" value={formatDateInput(form.startDate)} onChange={e => setForm({ ...form, startDate: e.target.value })} className="mt-1" /></div>
              <div><Label>Entrega</Label><Input type="date" value={formatDateInput(form.deliveryDate)} onChange={e => setForm({ ...form, deliveryDate: e.target.value })} className="mt-1" /></div>
            </div>
            <div>
              <Label className="mb-2 block">Status das Etapas</Label>
              <div className="grid grid-cols-2 gap-2">
                {STEPS.map(({ key, label }) => (
                  <div key={key}>
                    <Label className="text-xs text-zinc-500">{label}</Label>
                    <Select value={(form as Record<string, string>)[key] ?? "pendente"} onValueChange={v => setForm({ ...form, [key]: v })}>
                      <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(STEP_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
            <div><Label>Observações</Label><Textarea value={form.notes ?? ""} onChange={e => setForm({ ...form, notes: e.target.value })} className="mt-1" rows={2} /></div>
          </div>
          {saveError && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-2 mx-4 mb-2">{saveError}</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!form.name || loading}>{loading ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
