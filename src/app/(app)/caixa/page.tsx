"use client"
import { useEffect, useState, useCallback } from "react"
import { Plus, TrendingUp, TrendingDown, Wallet, AlertTriangle, CheckCircle2, Clock, Search, Trash2, Pencil } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, formatDateInput, TRANSACTION_STATUS, getDueDateAlert } from "@/lib/utils"

const CATEGORIES = ["Recebimento", "Pagamento Fornecedor", "Material", "Mão de Obra", "Despesa Operacional", "Outros"]

interface Transaction {
  id: string; type: string; category?: string; description: string
  amount: number; dueDate?: string; paidDate?: string; status: string
  invoiceNumber?: string; notes?: string
  project?: { id: string; name: string }
  supplier?: { id: string; name: string }
  client?: { id: string; name: string }
}

interface Project { id: string; name: string }
interface Supplier { id: string; name: string }
interface Client { id: string; name: string }

const emptyForm = (): Partial<Transaction & { projectId: string; supplierId: string; clientId: string }> => ({
  type: "entrada", category: "", description: "", amount: 0, status: "pendente", projectId: "", supplierId: "", clientId: "", notes: ""
})

const ALERT_STYLE: Record<string, string> = {
  vencido: "bg-red-50 border-red-200 text-red-700",
  hoje:    "bg-orange-50 border-orange-200 text-orange-700",
  "3dias": "bg-yellow-50 border-yellow-200 text-yellow-700",
  "7dias": "bg-blue-50 border-blue-200 text-blue-700",
}

export default function CaixaPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const load = useCallback(() => Promise.all([
    fetch("/api/transactions").then(r => r.json()).then(setTransactions),
    fetch("/api/projects").then(r => r.json()).then(setProjects),
    fetch("/api/suppliers").then(r => r.json()).then(setSuppliers),
    fetch("/api/clients").then(r => r.json()).then(setClients),
  ]), [])

  useEffect(() => { load() }, [load])

  const all = transactions
  const entradas = all.filter(t => t.type === "entrada")
  const saidas = all.filter(t => t.type === "saida")

  const saldoAtual = all.reduce((s, t) => t.status === "pago" ? s + (t.type === "entrada" ? t.amount : -t.amount) : s, 0)
  const aReceber = entradas.filter(t => t.status === "pendente").reduce((s, t) => s + t.amount, 0)
  const aPagar = saidas.filter(t => t.status === "pendente").reduce((s, t) => s + t.amount, 0)
  const vencidos = all.filter(t => t.status === "pendente" && getDueDateAlert(t.dueDate) === "vencido").length

  const vencimentos = all
    .filter(t => t.status === "pendente" && t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())

  const filteredEntradas = entradas.filter(t => [t.description, t.client?.name, t.project?.name].some(v => v?.toLowerCase().includes(search.toLowerCase())))
  const filteredSaidas = saidas.filter(t => [t.description, t.supplier?.name, t.project?.name].some(v => v?.toLowerCase().includes(search.toLowerCase())))

  const openNew = (type = "entrada") => { setForm({ ...emptyForm(), type }); setEditId(null); setSaveError(null); setOpen(true) }
  const openEdit = (t: Transaction) => {
    setForm({
      type: t.type, category: t.category ?? "", description: t.description,
      amount: t.amount, status: t.status, notes: t.notes ?? "",
      invoiceNumber: t.invoiceNumber ?? "",
      dueDate: t.dueDate ?? "", paidDate: t.paidDate ?? "",
      projectId: t.project?.id ?? "", supplierId: t.supplier?.id ?? "", clientId: t.client?.id ?? "",
    })
    setEditId(t.id); setSaveError(null); setOpen(true)
  }

  const save = async () => {
    setLoading(true)
    setSaveError(null)
    const body = {
      type: form.type, category: form.category || null,
      description: form.description, notes: form.notes || null,
      invoiceNumber: (form as Record<string, unknown>).invoiceNumber || null,
      amount: parseFloat(String(form.amount)) || 0,
      status: form.status,
      dueDate: (form as Record<string, unknown>).dueDate || null,
      paidDate: (form as Record<string, unknown>).paidDate || null,
      projectId: (form as Record<string, unknown>).projectId || null,
      supplierId: (form as Record<string, unknown>).supplierId || null,
      clientId: (form as Record<string, unknown>).clientId || null,
    }
    try {
      const res = editId
        ? await fetch(`/api/transactions/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
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

  const markPaid = async (t: Transaction) => {
    await fetch(`/api/transactions/${t.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "pago", paidDate: new Date().toISOString() }) })
    await load()
  }

  const del = async (id: string) => { if (!confirm("Excluir?")) return; await fetch(`/api/transactions/${id}`, { method: "DELETE" }); await load() }

  const TransactionRow = ({ t }: { t: Transaction }) => {
    const ts = TRANSACTION_STATUS[t.status]
    const alert = t.status === "pendente" ? getDueDateAlert(t.dueDate) : null
    return (
      <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
        <td className="px-4 py-3">
          <div>
            <p className="text-sm text-slate-900 font-medium">{t.description}</p>
            <p className="text-xs text-slate-500">{t.category}{t.project && ` · ${t.project.name}`}</p>
          </div>
        </td>
        <td className="px-4 py-3 text-xs text-slate-500">{t.supplier?.name ?? t.client?.name ?? "—"}</td>
        <td className="px-4 py-3">
          {t.dueDate && (
            <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border ${alert ? ALERT_STYLE[alert] : "text-slate-500 border-slate-200"}`}>
              {alert === "vencido" ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {formatDate(t.dueDate)}
            </div>
          )}
        </td>
        <td className="px-4 py-3 text-right">
          <p className={`text-sm font-bold ${t.type === "entrada" ? "text-green-600" : "text-red-600"}`}>
            {t.type === "entrada" ? "+" : "-"}{formatCurrency(t.amount)}
          </p>
        </td>
        <td className="px-4 py-3">
          <Badge className={`${ts?.color} text-[10px]`}>{ts?.label}</Badge>
        </td>
        <td className="px-4 py-3">
          <div className="flex justify-end gap-1">
            {t.status === "pendente" && <Button size="icon" variant="ghost" title="Marcar como pago" onClick={() => markPaid(t)}><CheckCircle2 className="h-3.5 w-3.5 text-green-400" /></Button>}
            <Button size="icon" variant="ghost" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
            <Button size="icon" variant="ghost" onClick={() => del(t.id)}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <>
      <Topbar title="Gestão de Caixa" description="Entradas, saídas e vencimentos" />
      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50"><Wallet className="h-5 w-5 text-amber-600" /></div>
              <div><p className="text-xs text-slate-500 font-medium">Saldo em Caixa</p><p className={`text-lg font-bold truncate ${saldoAtual >= 0 ? "text-slate-900" : "text-red-600"}`}>{formatCurrency(saldoAtual)}</p></div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50"><TrendingUp className="h-5 w-5 text-green-600" /></div>
              <div><p className="text-xs text-slate-500 font-medium">A Receber</p><p className="text-lg font-bold text-green-600 truncate">{formatCurrency(aReceber)}</p></div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50"><TrendingDown className="h-5 w-5 text-red-600" /></div>
              <div><p className="text-xs text-slate-500 font-medium">A Pagar</p><p className="text-lg font-bold text-red-600 truncate">{formatCurrency(aPagar)}</p></div>
            </CardContent>
          </Card>
          <Card className={`border-l-4 ${vencidos > 0 ? "border-l-orange-500" : "border-l-slate-300"}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${vencidos > 0 ? "bg-orange-50" : "bg-slate-50"}`}><AlertTriangle className={`h-5 w-5 ${vencidos > 0 ? "text-orange-600" : "text-slate-400"}`} /></div>
              <div><p className="text-xs text-slate-500 font-medium">Vencidos</p><p className={`text-lg font-bold ${vencidos > 0 ? "text-orange-600" : "text-slate-400"}`}>{vencidos}</p></div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="entradas">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <TabsList>
              <TabsTrigger value="entradas"><TrendingUp className="h-3.5 w-3.5 mr-1.5 text-green-400" />Entradas</TabsTrigger>
              <TabsTrigger value="saidas"><TrendingDown className="h-3.5 w-3.5 mr-1.5 text-red-400" />Saídas</TabsTrigger>
              <TabsTrigger value="vencimentos"><AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-orange-400" />Vencimentos ({vencimentos.length})</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Buscar..." className="pl-9 w-48" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Button size="sm" onClick={() => openNew("entrada")} variant="outline" className="border-green-300 text-green-700 hover:bg-green-50"><Plus className="h-4 w-4" />Entrada</Button>
              <Button size="sm" onClick={() => openNew("saida")} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50"><Plus className="h-4 w-4" />Saída</Button>
            </div>
          </div>

          <TabsContent value="entradas">
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-200 bg-slate-50"><th className="text-left px-4 py-3 text-slate-600 font-medium">Descrição</th><th className="text-left px-4 py-3 text-slate-600 font-medium">Cliente/Projeto</th><th className="text-left px-4 py-3 text-slate-600 font-medium">Vencimento</th><th className="text-right px-4 py-3 text-slate-600 font-medium">Valor</th><th className="px-4 py-3 text-slate-600 font-medium">Status</th><th className="px-4 py-3"></th></tr></thead>
                <tbody>
                  {filteredEntradas.map(t => <TransactionRow key={t.id} t={t} />)}
                </tbody>
              </table>
              {filteredEntradas.length === 0 && <p className="text-center text-slate-400 py-8">Nenhuma entrada encontrada</p>}
            </div>
          </TabsContent>

          <TabsContent value="saidas">
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-200 bg-slate-50"><th className="text-left px-4 py-3 text-slate-600 font-medium">Descrição</th><th className="text-left px-4 py-3 text-slate-600 font-medium">Fornecedor</th><th className="text-left px-4 py-3 text-slate-600 font-medium">Vencimento</th><th className="text-right px-4 py-3 text-slate-600 font-medium">Valor</th><th className="px-4 py-3 text-slate-600 font-medium">Status</th><th className="px-4 py-3"></th></tr></thead>
                <tbody>
                  {filteredSaidas.map(t => <TransactionRow key={t.id} t={t} />)}
                </tbody>
              </table>
              {filteredSaidas.length === 0 && <p className="text-center text-slate-400 py-8">Nenhuma saída encontrada</p>}
            </div>
          </TabsContent>

          <TabsContent value="vencimentos">
            <div className="space-y-2">
              {vencimentos.length === 0 && <p className="text-center text-slate-400 py-8">Nenhum vencimento pendente</p>}
              {vencimentos.map(t => {
                const alert = getDueDateAlert(t.dueDate)
                const style = alert ? ALERT_STYLE[alert] : "bg-white border-slate-200 text-slate-700"
                return (
                  <div key={t.id} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${style}`}>
                    <div className="flex items-center gap-3">
                      {alert === "vencido" ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <Clock className="h-4 w-4 shrink-0" />}
                      <div>
                        <p className="font-semibold text-sm">{t.description}</p>
                        <p className="text-xs opacity-70">{t.supplier?.name ?? t.client?.name ?? t.project?.name ?? "—"} · {t.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`font-bold text-sm ${t.type === "entrada" ? "text-green-600" : "text-red-600"}`}>{t.type === "entrada" ? "+" : "-"}{formatCurrency(t.amount)}</p>
                        <p className="text-xs opacity-70">{formatDate(t.dueDate)}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => markPaid(t)} className="border-green-300 text-green-700 hover:bg-green-50">
                        <CheckCircle2 className="h-4 w-4" />Pago
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) setOpen(false) }}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? "Editar Lançamento" : form.type === "entrada" ? "Nova Entrada" : "Nova Saída"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="entrada">Entrada</SelectItem><SelectItem value="saida">Saída</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.category ?? ""} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Descrição *</Label><Input value={form.description ?? ""} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Valor (R$) *</Label><Input type="number" value={form.amount ?? 0} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) })} className="mt-1" /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status ?? "pendente"} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="pendente">Pendente</SelectItem><SelectItem value="pago">Pago</SelectItem><SelectItem value="cancelado">Cancelado</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vencimento</Label><Input type="date" value={formatDateInput(form.dueDate)} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="mt-1" /></div>
              <div><Label>Data Pgto</Label><Input type="date" value={formatDateInput(form.paidDate)} onChange={e => setForm({ ...form, paidDate: e.target.value })} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Projeto</Label>
                <Select value={(form as Record<string, string>).projectId ?? ""} onValueChange={v => setForm({ ...form, projectId: v })}>
                  <SelectTrigger className="mt-1 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent><SelectItem value="">—</SelectItem>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fornecedor</Label>
                <Select value={(form as Record<string, string>).supplierId ?? ""} onValueChange={v => setForm({ ...form, supplierId: v })}>
                  <SelectTrigger className="mt-1 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent><SelectItem value="">—</SelectItem>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cliente</Label>
                <Select value={(form as Record<string, string>).clientId ?? ""} onValueChange={v => setForm({ ...form, clientId: v })}>
                  <SelectTrigger className="mt-1 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent><SelectItem value="">—</SelectItem>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
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
