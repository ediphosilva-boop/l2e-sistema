"use client"
import { useEffect, useState } from "react"
import { Plus, FileText, Pencil, Trash2, Download, CheckCircle2 } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, CONTRACT_STATUS } from "@/lib/utils"

interface Contract {
  id: string; type: string; title: string; status: string
  signedAt?: string; createdAt: string; contentJson: string
  project?: { id: string; name: string }
  client?: { id: string; name: string }
}

interface Project { id: string; name: string; totalValue: number; client?: { id: string; name: string } }
interface Client { id: string; name: string; address?: string; phone?: string; email?: string }

const PACKAGES = [
  { label: "Pacote Essencial", value: 31350 },
  { label: "Pacote Premium", value: 44960 },
  { label: "Pacote Personalizado", value: 0 },
]

const PAYMENT_TERMS = ["50% entrada + 50% entrega", "100% à vista (5% desconto)", "3x no cartão", "Parcelado 18x cartão"]

export default function ContratosPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [open, setOpen] = useState(false)
  const [openPreview, setOpenPreview] = useState(false)
  const [previewContract, setPreviewContract] = useState<Contract | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    type: "proposta", title: "", projectId: "", clientId: "", status: "rascunho",
    package: "", paymentTerms: "", units: 1, discount: 0, customValue: 0, notes: "",
  })

  const load = () => Promise.all([
    fetch("/api/contracts").then(r => r.json()).then(setContracts),
    fetch("/api/projects").then(r => r.json()).then(setProjects),
    fetch("/api/clients").then(r => r.json()).then(setClients),
  ])
  useEffect(() => { load() }, [])

  const selectedProject = projects.find(p => p.id === form.projectId)
  const selectedClient = clients.find(c => c.id === form.clientId)
  const selectedPackage = PACKAGES.find(p => p.label === form.package)
  const baseValue = form.package === "Pacote Personalizado" ? form.customValue : (selectedPackage?.value ?? 0)
  const totalValue = (baseValue * form.units) - form.discount

  const save = async () => {
    setLoading(true)
    const contentJson = JSON.stringify({
      package: form.package, paymentTerms: form.paymentTerms,
      units: form.units, baseValue, discount: form.discount, totalValue, notes: form.notes,
    })
    const body = {
      type: form.type, title: form.title, status: form.status, contentJson,
      projectId: form.projectId || null, clientId: form.clientId || null,
    }
    if (editId) await fetch(`/api/contracts/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    else await fetch("/api/contracts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    await load(); setOpen(false); setLoading(false)
  }

  const del = async (id: string) => { if (!confirm("Excluir contrato?")) return; await fetch(`/api/contracts/${id}`, { method: "DELETE" }); await load() }

  const markSigned = async (c: Contract) => {
    await fetch(`/api/contracts/${c.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "assinado", signedAt: new Date().toISOString() }) })
    await load()
  }

  const preview = (c: Contract) => { setPreviewContract(c); setOpenPreview(true) }

  const printContract = () => {
    if (!previewContract) return
    const content = JSON.parse(previewContract.contentJson)
    const html = `
      <html><head><title>${previewContract.title}</title>
      <style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;color:#111;line-height:1.6}h1{color:#111;border-bottom:3px solid #f59e0b;padding-bottom:10px}h2{color:#333;margin-top:30px}.label{color:#666;font-size:12px;text-transform:uppercase;margin-bottom:4px}.value{font-weight:bold;margin-bottom:16px}.total{font-size:24px;font-weight:bold;color:#f59e0b;margin-top:8px}.footer{margin-top:60px;border-top:1px solid #ddd;padding-top:20px;color:#666;font-size:12px}.sign-box{margin-top:80px;display:flex;gap:60px}.sign-line{flex:1;border-top:1px solid #999;padding-top:8px;text-align:center;font-size:12px;color:#666}</style>
      </head><body>
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px"><div style="width:48px;height:48px;background:#f59e0b;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;color:black;font-size:18px">L2</div><div><div style="font-size:20px;font-weight:bold">L2E Prime Solutions</div><div style="color:#666;font-size:13px">Acabamento Completo de Apartamentos</div></div></div>
      <h1>${previewContract.title}</h1>
      <p style="color:#666;font-size:13px">Emitido em: ${formatDate(previewContract.createdAt)}</p>
      ${previewContract.client ? `<div class="label">Cliente</div><div class="value">${previewContract.client.name}</div>` : ""}
      ${previewContract.project ? `<div class="label">Projeto</div><div class="value">${previewContract.project.name}</div>` : ""}
      <h2>Escopo e Valores</h2>
      <div class="label">Pacote</div><div class="value">${content.package || "—"}</div>
      <div class="label">Unidades</div><div class="value">${content.units ?? 1}</div>
      <div class="label">Valor unitário</div><div class="value">${formatCurrency(content.baseValue ?? 0)}</div>
      ${content.discount > 0 ? `<div class="label">Desconto</div><div class="value" style="color:#dc2626">- ${formatCurrency(content.discount)}</div>` : ""}
      <div class="label">Valor Total</div><div class="total">${formatCurrency(content.totalValue ?? 0)}</div>
      <h2>Condições de Pagamento</h2>
      <p>${content.paymentTerms || "—"}</p>
      ${content.notes ? `<h2>Observações</h2><p>${content.notes}</p>` : ""}
      <h2>Prazo de Entrega</h2>
      <p>A entrega será realizada em até <strong>30 dias corridos</strong> após a assinatura do contrato e confirmação do pagamento da entrada.</p>
      <h2>Garantia</h2>
      <p>Todos os produtos e serviços possuem garantia de <strong>90 dias</strong> contra defeitos de instalação e montagem.</p>
      <div class="sign-box">
        <div class="sign-line">L2E Prime Solutions<br>Lucas Souza — Responsável</div>
        <div class="sign-line">Cliente<br>${previewContract.client?.name ?? "____________________"}</div>
      </div>
      <div class="footer"><p>L2E Prime Solutions · l2eprimesolutions@gmail.com · (11) 94717-0797</p></div>
      </body></html>`
    const w = window.open("", "_blank")
    if (w) { w.document.write(html); w.document.close(); w.print() }
  }

  return (
    <>
      <Topbar
        title="Contratos"
        description="Propostas e contratos"
        action={<Button onClick={() => { setForm({ type: "proposta", title: "", projectId: "", clientId: "", status: "rascunho", package: "", paymentTerms: "", units: 1, discount: 0, customValue: 0, notes: "" }); setEditId(null); setOpen(true) }}><Plus className="h-4 w-4" />Novo</Button>}
      />
      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contracts.map(c => {
            const cs = CONTRACT_STATUS[c.status]
            const content = (() => { try { return JSON.parse(c.contentJson) } catch { return {} } })()
            return (
              <Card key={c.id} className="hover:border-amber-300 hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-amber-600 shrink-0" />
                      <p className="font-semibold text-slate-900 text-sm leading-snug">{c.title}</p>
                    </div>
                    <Badge className={`${cs?.color} shrink-0 text-[10px]`}>{cs?.label}</Badge>
                  </div>
                  {c.client && <p className="text-xs text-slate-600 mb-1">Cliente: {c.client.name}</p>}
                  {c.project && <p className="text-xs text-slate-500 mb-1">Projeto: {c.project.name}</p>}
                  {content.totalValue > 0 && <p className="text-sm font-bold text-amber-600 mt-2">{formatCurrency(content.totalValue)}</p>}
                  {content.paymentTerms && <p className="text-xs text-slate-500 mt-1">{content.paymentTerms}</p>}
                  {c.signedAt && <p className="text-xs text-green-600 mt-1">Assinado em {formatDate(c.signedAt)}</p>}
                  <div className="flex gap-1 mt-3">
                    <Button size="sm" variant="outline" onClick={() => preview(c)}><Download className="h-3.5 w-3.5" />PDF</Button>
                    {c.status !== "assinado" && (
                      <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50" onClick={() => markSigned(c)}>
                        <CheckCircle2 className="h-3.5 w-3.5" />Assinar
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => del(c.id)}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {contracts.length === 0 && <p className="col-span-full text-center text-slate-400 py-12">Nenhum contrato criado</p>}
        </div>
      </div>

      {/* Modal novo contrato */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nova Proposta / Contrato</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="proposta">Proposta Comercial</SelectItem><SelectItem value="contrato">Contrato</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(CONTRACT_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Título *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1" placeholder="Ex: Proposta Comercial — Apto 101" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Projeto</Label>
                <Select value={form.projectId} onValueChange={v => {
                  const p = projects.find(p => p.id === v)
                  setForm({ ...form, projectId: v, clientId: p?.client?.id ?? form.clientId })
                }}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent><SelectItem value="">—</SelectItem>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cliente</Label>
                <Select value={form.clientId} onValueChange={v => setForm({ ...form, clientId: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent><SelectItem value="">—</SelectItem>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Pacote</Label>
                <Select value={form.package} onValueChange={v => setForm({ ...form, package: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{PACKAGES.map(p => <SelectItem key={p.label} value={p.label}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Condição de Pgto</Label>
                <Select value={form.paymentTerms} onValueChange={v => setForm({ ...form, paymentTerms: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{PAYMENT_TERMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Unidades</Label><Input type="number" value={form.units} onChange={e => setForm({ ...form, units: parseInt(e.target.value) || 1 })} className="mt-1" min={1} /></div>
              <div><Label>Desconto (R$)</Label><Input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })} className="mt-1" /></div>
              {form.package === "Pacote Personalizado" && <div><Label>Valor Unit. (R$)</Label><Input type="number" value={form.customValue} onChange={e => setForm({ ...form, customValue: parseFloat(e.target.value) || 0 })} className="mt-1" /></div>}
            </div>
            {baseValue > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
                <div className="flex justify-between text-slate-600"><span>Subtotal ({form.units}x {formatCurrency(baseValue)})</span><span>{formatCurrency(baseValue * form.units)}</span></div>
                {form.discount > 0 && <div className="flex justify-between text-red-600"><span>Desconto</span><span>- {formatCurrency(form.discount)}</span></div>}
                <div className="flex justify-between text-amber-700 font-bold mt-1 pt-1 border-t border-amber-200"><span>Total</span><span>{formatCurrency(totalValue)}</span></div>
              </div>
            )}
            <div><Label>Observações</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="mt-1" rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!form.title || loading}>{loading ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Preview PDF */}
      <Dialog open={openPreview} onOpenChange={setOpenPreview}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Preview — {previewContract?.title}</DialogTitle></DialogHeader>
          {previewContract && (() => {
            const content = (() => { try { return JSON.parse(previewContract.contentJson) } catch { return {} } })()
            const cs = CONTRACT_STATUS[previewContract.status]
            return (
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm">
                  <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                    <div className="w-8 h-8 bg-amber-500 rounded-md flex items-center justify-center font-bold text-white text-sm">L2</div>
                    <div><p className="font-bold text-slate-900">L2E Prime Solutions</p><p className="text-xs text-slate-500">Acabamento Completo de Apartamentos</p></div>
                    <Badge className={`ml-auto ${cs?.color} text-[10px]`}>{cs?.label}</Badge>
                  </div>
                  {previewContract.client && <p className="text-slate-700"><span className="text-slate-500">Cliente:</span> {previewContract.client.name}</p>}
                  {previewContract.project && <p className="text-slate-700"><span className="text-slate-500">Projeto:</span> {previewContract.project.name}</p>}
                  <p className="text-slate-700"><span className="text-slate-500">Pacote:</span> {content.package || "—"}</p>
                  {content.units > 1 && <p className="text-slate-700"><span className="text-slate-500">Unidades:</span> {content.units}</p>}
                  <p className="text-slate-700"><span className="text-slate-500">Pagamento:</span> {content.paymentTerms || "—"}</p>
                  {content.discount > 0 && <p className="text-red-600"><span className="text-slate-500">Desconto:</span> - {formatCurrency(content.discount)}</p>}
                  <p className="text-amber-600 text-lg font-bold">Total: {formatCurrency(content.totalValue ?? 0)}</p>
                  {content.notes && <p className="text-slate-500 text-xs">{content.notes}</p>}
                </div>
              </div>
            )
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPreview(false)}>Fechar</Button>
            <Button onClick={printContract}><Download className="h-4 w-4" />Imprimir / Salvar PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
