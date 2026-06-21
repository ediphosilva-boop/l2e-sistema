"use client"
import { useEffect, useState } from "react"
import { Plus, Wrench, Trash2, Pencil, CheckCircle2 } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, formatDateInput } from "@/lib/utils"

interface Project { id: string; name: string }
interface Supplier { id: string; name: string }

interface ServiceEntry {
  id: string; description: string; projectId?: string; supplierId?: string
  amount: number; dueDate?: string; notes?: string
  status: string
  project?: { name: string }; supplier?: { name: string }
}

const SERVICES = [
  "Elétrica", "Pintura", "Acabamentos", "Montagem de Móveis",
  "Instalação Eletrodomésticos", "Limpeza", "Gesso", "Outros",
]

export default function ServicosMOPage() {
  const [entries, setEntries] = useState<ServiceEntry[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    description: "", projectId: "", supplierId: "",
    amount: 0, paymentDate: "", startDate: "", notes: "",
  })

  const load = async () => {
    const [trans, projs, supps] = await Promise.all([
      fetch("/api/transactions?category=Mão de Obra").then(r => r.json()),
      fetch("/api/projects").then(r => r.json()),
      fetch("/api/suppliers").then(r => r.json()),
    ])
    setEntries(trans.filter((t: ServiceEntry) => t.status !== "cancelado"))
    setProjects(projs)
    setSuppliers(supps)
  }
  useEffect(() => { load() }, [])

  const resetForm = () => setForm({
    description: "", projectId: "", supplierId: "",
    amount: 0, paymentDate: "", startDate: "", notes: "",
  })

  const openNew = () => { resetForm(); setEditId(null); setOpen(true) }

  const openEdit = (e: ServiceEntry) => {
    setForm({
      description: e.description,
      projectId: e.projectId ?? "",
      supplierId: e.supplierId ?? "",
      amount: e.amount,
      paymentDate: e.dueDate ? formatDateInput(e.dueDate) : "",
      startDate: "",
      notes: e.notes ?? "",
    })
    setEditId(e.id)
    setOpen(true)
  }

  const save = async () => {
    setLoading(true)
    const body = {
      type: "saida",
      category: "Mão de Obra",
      description: form.description,
      amount: parseFloat(String(form.amount)) || 0,
      status: "pendente",
      dueDate: form.paymentDate || null,
      projectId: form.projectId || null,
      supplierId: form.supplierId || null,
      notes: form.notes ? `Início: ${form.startDate || "—"}\n${form.notes}` : `Início: ${form.startDate || "—"}`,
    }
    if (editId) {
      await fetch(`/api/transactions/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    } else {
      await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    }
    await load()
    setOpen(false)
    setLoading(false)
  }

  const del = async (id: string) => {
    if (!confirm("Excluir este serviço de MO?")) return
    await fetch(`/api/transactions/${id}`, { method: "DELETE" })
    await load()
  }

  const totalPrevisto = entries.reduce((s, e) => s + e.amount, 0)
  const totalPago = entries.filter(e => e.status === "pago").reduce((s, e) => s + e.amount, 0)
  const totalPendente = totalPrevisto - totalPago

  return (
    <>
      <Topbar
        title="Serviços de Mão de Obra"
        subtitle="Cadastro de início de serviço com lançamento automático no caixa"
        action={<Button onClick={openNew}><Plus className="h-4 w-4" />Novo Serviço</Button>}
      />
      <div className="p-3 sm:p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Previsto</p>
              <p className="text-lg font-bold text-slate-700">{formatCurrency(totalPrevisto)}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Pago</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalPago)}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Pendente</p>
              <p className="text-lg font-bold text-amber-600">{formatCurrency(totalPendente)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Serviço</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Projeto</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Prestador</th>
                <th className="text-center px-3 py-3 text-xs text-slate-500 font-medium">Pgto Previsto</th>
                <th className="text-right px-4 py-3 text-xs text-slate-500 font-medium">Valor</th>
                <th className="text-center px-3 py-3 text-xs text-slate-500 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-800">{e.description}</p>
                    {e.notes && <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">{e.notes}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{e.project?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{e.supplier?.name ?? "—"}</td>
                  <td className="px-3 py-3 text-center text-xs text-slate-500">{e.dueDate ? formatDate(e.dueDate) : "—"}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-red-600">{formatCurrency(e.amount)}</td>
                  <td className="px-3 py-3 text-center">
                    {e.status === "pago" ? (
                      <Badge className="bg-emerald-50 text-emerald-700 text-[10px]"><CheckCircle2 className="h-3 w-3 mr-0.5" />Pago</Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-700 text-[10px]">Pendente</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(e)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => del(e.id)}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center">
                  <Wrench className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm text-slate-400">Nenhum serviço de MO cadastrado</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={v => { if (!v && !loading) setOpen(false) }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? "Editar Serviço de MO" : "Novo Serviço de Mão de Obra"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Serviço *</Label>
              <Input list="service-types" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1" placeholder="Ex: Pintura apto 301" />
              <datalist id="service-types">
                {SERVICES.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Projeto</Label>
                <Select value={form.projectId} onValueChange={v => setForm({ ...form, projectId: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent><SelectItem value="">—</SelectItem>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prestador</Label>
                <Select value={form.supplierId} onValueChange={v => setForm({ ...form, supplierId: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent><SelectItem value="">—</SelectItem>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Valor Previsto (R$) *</Label><Input type="number" value={form.amount || ""} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} className="mt-1" /></div>
              <div><Label>Data Início</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="mt-1" /></div>
            </div>
            <div>
              <Label>Data Prevista de Pagamento *</Label>
              <Input type="date" value={form.paymentDate} onChange={e => setForm({ ...form, paymentDate: e.target.value })} className="mt-1" />
            </div>
            <div><Label>Observações</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="mt-1" rows={2} /></div>
            {!editId && (
              <p className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded p-2">
                Ao salvar, um lançamento de saída será criado automaticamente na Gestão de Caixa com status pendente.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!form.description || !form.amount || loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
