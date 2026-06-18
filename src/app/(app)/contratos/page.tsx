"use client"
import { useEffect, useState } from "react"
import { Plus, FileText, Trash2, Download, CheckCircle2, ChevronDown, ChevronRight, Tag } from "lucide-react"
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
  {
    label: "Pacote Essencial",
    value: 31350,
    color: "border-blue-200 bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    items: [
      "Eletrodomésticos básicos (geladeira, fogão, microondas, depurador)",
      "Móveis básicos (cama casal, guarda-roupas 6 portas, rack TV)",
      "Piso vinílico em manta (área de estar)",
      "Pintura completa (PVA + acabamento)",
      "Instalação elétrica completa",
      "Box banheiro em vidro + acessórios",
      "Limpeza final pós-obra",
    ],
  },
  {
    label: "Pacote Premium",
    value: 44960,
    color: "border-amber-200 bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    items: [
      "Tudo do Pacote Essencial +",
      "TV Smart 50\" Philips 4K Google TV",
      "Máquina Lava e Seca 11kg",
      "Ar Condicionado 9.000 BTU Inverter",
      "Sofá retrátil e reclinável 2 lugares",
      "Mesa de jantar 4 lugares",
      "Cabeceira modular 140cm + mesas de cabeceira",
      "Planejados cozinha completo (gabinete + armários)",
      "Gabinete banheiro suspenso",
      "Torneira gourmet monocomando",
      "Fechadura digital Intelbras",
      "Tapete sala + kit almofadas + quadros",
    ],
  },
  {
    label: "Pacote Personalizado",
    value: 0,
    color: "border-slate-200 bg-slate-50",
    badge: "bg-slate-100 text-slate-600",
    items: ["Itens e valores definidos conforme necessidade do cliente"],
  },
]

const PAYMENT_TERMS = [
  "50% entrada + 50% na entrega",
  "100% à vista (5% de desconto)",
  "30% entrada + 70% na entrega",
  "3x no cartão de crédito",
  "6x no cartão de crédito",
  "12x no cartão de crédito",
  "Parcelado 18x no cartão",
  "Personalizado",
]

export default function ContratosPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [open, setOpen] = useState(false)
  const [openPreview, setOpenPreview] = useState(false)
  const [previewContract, setPreviewContract] = useState<Contract | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandedPackage, setExpandedPackage] = useState(false)

  const [form, setForm] = useState({
    type: "proposta", title: "", projectId: "", clientId: "", status: "rascunho",
    package: "", paymentTerms: "", units: 1,
    discountType: "valor" as "valor" | "percentual",
    discount: 0, customValue: 0, notes: "", customPaymentTerms: "",
  })

  const load = () => Promise.all([
    fetch("/api/contracts").then(r => r.json()).then(setContracts),
    fetch("/api/projects").then(r => r.json()).then(setProjects),
    fetch("/api/clients").then(r => r.json()).then(setClients),
  ])
  useEffect(() => { load() }, [])

  const selectedPackage = PACKAGES.find(p => p.label === form.package)
  const baseValue = form.package === "Pacote Personalizado" ? form.customValue : (selectedPackage?.value ?? 0)
  const subtotal = baseValue * form.units
  const discountAmount = form.discountType === "percentual"
    ? subtotal * (form.discount / 100)
    : form.discount
  const totalValue = subtotal - discountAmount

  const save = async () => {
    setLoading(true)
    const paymentTerms = form.paymentTerms === "Personalizado" ? form.customPaymentTerms : form.paymentTerms
    const contentJson = JSON.stringify({
      package: form.package, paymentTerms, units: form.units,
      baseValue, discount: discountAmount, discountPct: form.discountType === "percentual" ? form.discount : 0,
      totalValue, notes: form.notes,
    })
    const body = {
      type: form.type, title: form.title, status: form.status, contentJson,
      projectId: form.projectId || null, clientId: form.clientId || null,
    }
    if (editId) await fetch(`/api/contracts/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    else await fetch("/api/contracts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    await load(); setOpen(false); setLoading(false)
  }

  const del = async (id: string) => { if (!confirm("Excluir?")) return; await fetch(`/api/contracts/${id}`, { method: "DELETE" }); await load() }

  const markSigned = async (c: Contract) => {
    await fetch(`/api/contracts/${c.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "assinado", signedAt: new Date().toISOString() }) })
    await load()
  }

  const printContract = (c: Contract) => {
    const content = (() => { try { return JSON.parse(c.contentJson) } catch { return {} } })()
    const pkg = PACKAGES.find(p => p.label === content.package)
    const html = `
      <html><head><title>${c.title}</title>
      <style>
        body{font-family:Arial,sans-serif;max-width:820px;margin:40px auto;color:#111;line-height:1.6;font-size:14px}
        h1{color:#111;border-bottom:3px solid #f59e0b;padding-bottom:10px;margin-bottom:6px}
        h2{color:#333;margin-top:28px;font-size:16px}
        .label{color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px}
        .value{font-weight:600;margin-bottom:14px}
        .total-box{background:#fffbeb;border:2px solid #f59e0b;border-radius:8px;padding:16px 20px;margin-top:12px}
        .total-label{font-size:12px;color:#92400e;text-transform:uppercase;letter-spacing:0.05em}
        .total-value{font-size:28px;font-weight:bold;color:#d97706}
        .pkg-item{padding:4px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151}
        .pkg-item:before{content:"✓ ";color:#10b981;font-weight:bold}
        .sign-box{margin-top:80px;display:flex;gap:60px}
        .sign-line{flex:1;border-top:1px solid #999;padding-top:8px;text-align:center;font-size:12px;color:#666}
        .footer{margin-top:50px;border-top:1px solid #e5e7eb;padding-top:16px;color:#9ca3af;font-size:11px;text-align:center}
        @media print{body{margin:20px}}
      </style></head><body>
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
        <div style="width:48px;height:48px;background:#f59e0b;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;color:black;font-size:18px">L2</div>
        <div><div style="font-size:20px;font-weight:bold">L2E Prime Solutions</div><div style="color:#666;font-size:13px">Acabamento Completo de Apartamentos</div></div>
      </div>
      <h1>${c.title}</h1>
      <p style="color:#9ca3af;font-size:12px">Emitido em: ${formatDate(c.createdAt)}</p>
      ${c.client ? `<div class="label">Cliente</div><div class="value">${c.client.name}</div>` : ""}
      ${c.project ? `<div class="label">Projeto</div><div class="value">${c.project.name}</div>` : ""}
      <h2>Escopo do Serviço</h2>
      <div class="label">Pacote selecionado</div><div class="value">${content.package || "—"}</div>
      ${pkg ? `<div style="margin:8px 0 16px">${pkg.items.map(i => `<div class="pkg-item">${i}</div>`).join("")}</div>` : ""}
      <h2>Valores</h2>
      <div class="label">Quantidade de unidades</div><div class="value">${content.units ?? 1} un.</div>
      <div class="label">Valor por unidade</div><div class="value">${formatCurrency(content.baseValue ?? 0)}</div>
      <div class="label">Subtotal</div><div class="value">${formatCurrency((content.baseValue ?? 0) * (content.units ?? 1))}</div>
      ${content.discount > 0 ? `<div class="label">Desconto${content.discountPct > 0 ? ` (${content.discountPct}%)` : ""}</div><div class="value" style="color:#dc2626">- ${formatCurrency(content.discount)}</div>` : ""}
      <div class="total-box">
        <div class="total-label">Valor Total</div>
        <div class="total-value">${formatCurrency(content.totalValue ?? 0)}</div>
      </div>
      <h2>Condições de Pagamento</h2>
      <p style="font-weight:600">${content.paymentTerms || "—"}</p>
      ${content.notes ? `<h2>Observações</h2><p>${content.notes}</p>` : ""}
      <h2>Prazo de Entrega</h2>
      <p>A entrega será realizada em até <strong>30 dias corridos</strong> após assinatura e confirmação da entrada.</p>
      <h2>Garantia</h2>
      <p><strong>90 dias</strong> contra defeitos de instalação e montagem em todos os produtos e serviços.</p>
      <div class="sign-box">
        <div class="sign-line">L2E Prime Solutions<br>Lucas Souza — Responsável</div>
        <div class="sign-line">Cliente<br>${c.client?.name ?? "____________________"}</div>
      </div>
      <div class="footer">L2E Prime Solutions · l2eprimesolutions@gmail.com · (11) 94717-0797</div>
      </body></html>`
    const w = window.open("", "_blank")
    if (w) { w.document.write(html); w.document.close(); w.print() }
  }

  const resetForm = () => setForm({
    type: "proposta", title: "", projectId: "", clientId: "", status: "rascunho",
    package: "", paymentTerms: "", units: 1, discountType: "valor",
    discount: 0, customValue: 0, notes: "", customPaymentTerms: "",
  })

  return (
    <>
      <Topbar
        title="Propostas"
        subtitle="Gerador de propostas comerciais"
        action={<Button onClick={() => { resetForm(); setEditId(null); setOpen(true) }}><Plus className="h-4 w-4" />Nova Proposta</Button>}
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
                  {c.client && <p className="text-xs text-slate-600 mb-0.5">Cliente: {c.client.name}</p>}
                  {c.project && <p className="text-xs text-slate-500 mb-0.5">Projeto: {c.project.name}</p>}
                  {content.package && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full mt-1">
                      <Tag className="h-3 w-3" />{content.package}
                    </span>
                  )}
                  {content.totalValue > 0 && <p className="text-base font-bold text-amber-600 mt-2">{formatCurrency(content.totalValue)}</p>}
                  {content.paymentTerms && <p className="text-xs text-slate-400 mt-0.5">{content.paymentTerms}</p>}
                  {c.signedAt && <p className="text-xs text-emerald-600 mt-1 font-medium">✓ Assinado em {formatDate(c.signedAt)}</p>}
                  <div className="flex gap-1.5 mt-3">
                    <Button size="sm" variant="outline" onClick={() => printContract(c)}>
                      <Download className="h-3.5 w-3.5" />PDF
                    </Button>
                    {c.status !== "assinado" && (
                      <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50" onClick={() => markSigned(c)}>
                        <CheckCircle2 className="h-3.5 w-3.5" />Assinar
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="ml-auto" onClick={() => del(c.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {contracts.length === 0 && (
            <div className="col-span-full text-center py-16 text-slate-400">
              <FileText className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">Nenhuma proposta criada</p>
              <p className="text-xs mt-1">Clique em "Nova Proposta" para começar</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nova Proposta */}
      <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) setOpen(false) }}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Proposta Comercial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">

            {/* Tipo + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proposta">Proposta Comercial</SelectItem>
                    <SelectItem value="contrato">Contrato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONTRACT_STATUS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Título */}
            <div>
              <Label>Título *</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1" placeholder="Ex: Proposta — Apto 101 | João Silva" />
            </div>

            {/* Projeto + Cliente */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Projeto</Label>
                <Select value={form.projectId} onValueChange={v => {
                  const p = projects.find(p => p.id === v)
                  setForm({ ...form, projectId: v, clientId: p?.client?.id ?? form.clientId })
                }}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">—</SelectItem>
                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cliente</Label>
                <Select value={form.clientId} onValueChange={v => setForm({ ...form, clientId: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">—</SelectItem>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Seleção de Pacote */}
            <div>
              <Label className="mb-2 block">Pacote</Label>
              <div className="grid grid-cols-3 gap-2">
                {PACKAGES.map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setForm({ ...form, package: p.label })}
                    className={`rounded-xl border-2 p-3 text-left transition-all ${
                      form.package === p.label
                        ? "border-amber-400 bg-amber-50 ring-2 ring-amber-400/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-800 leading-tight">{p.label}</p>
                    {p.value > 0 && <p className="text-xs font-semibold text-amber-600 mt-0.5">{formatCurrency(p.value)}/un</p>}
                    {p.value === 0 && <p className="text-xs text-slate-400 mt-0.5">Valor sob consulta</p>}
                  </button>
                ))}
              </div>
            </div>

            {/* Conteúdo do pacote */}
            {selectedPackage && (
              <div className={`rounded-xl border p-4 ${selectedPackage.color}`}>
                <button
                  type="button"
                  onClick={() => setExpandedPackage(!expandedPackage)}
                  className="flex items-center gap-2 w-full text-left"
                >
                  {expandedPackage ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                  <span className="text-sm font-semibold text-slate-700">O que está incluído no {selectedPackage.label}</span>
                </button>
                {expandedPackage && (
                  <ul className="mt-3 space-y-1.5 pl-6">
                    {selectedPackage.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Valor personalizado */}
            {form.package === "Pacote Personalizado" && (
              <div>
                <Label>Valor por unidade (R$)</Label>
                <Input type="number" value={form.customValue || ""} onChange={e => setForm({ ...form, customValue: parseFloat(e.target.value) || 0 })} className="mt-1" placeholder="0,00" />
              </div>
            )}

            {/* Quantidade */}
            <div>
              <Label>Quantidade de unidades (apartamentos)</Label>
              <Input type="number" value={form.units} onChange={e => setForm({ ...form, units: parseInt(e.target.value) || 1 })} className="mt-1" min={1} />
            </div>

            {/* Desconto */}
            <div>
              <Label>Desconto</Label>
              <div className="flex gap-2 mt-1">
                <div className="flex rounded-lg border border-slate-300 overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, discountType: "valor", discount: 0 })}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${form.discountType === "valor" ? "bg-amber-500 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                  >R$</button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, discountType: "percentual", discount: 0 })}
                    className={`px-3 py-2 text-sm font-medium transition-colors border-l border-slate-300 ${form.discountType === "percentual" ? "bg-amber-500 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                  >%</button>
                </div>
                <Input
                  type="number"
                  value={form.discount || ""}
                  onChange={e => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })}
                  placeholder={form.discountType === "percentual" ? "Ex: 5" : "Ex: 1000"}
                  min={0}
                  max={form.discountType === "percentual" ? 100 : undefined}
                />
              </div>
            </div>

            {/* Total em destaque */}
            {baseValue > 0 && (
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
                <div className="space-y-1.5 text-sm mb-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Valor unitário</span>
                    <span className="font-medium">{formatCurrency(baseValue)}</span>
                  </div>
                  {form.units > 1 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal ({form.units} unidades)</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>Desconto {form.discountType === "percentual" ? `(${form.discount}%)` : ""}</span>
                      <span className="font-medium">− {formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center border-t-2 border-amber-200 pt-3">
                  <span className="text-sm font-bold text-amber-800">TOTAL</span>
                  <span className="text-2xl font-black text-amber-600">{formatCurrency(totalValue)}</span>
                </div>
                {form.units > 1 && (
                  <p className="text-xs text-amber-700 mt-1 text-right">
                    {formatCurrency(totalValue / form.units)}/unidade
                  </p>
                )}
              </div>
            )}

            {/* Forma de pagamento */}
            <div>
              <Label>Condição de Pagamento</Label>
              <Select value={form.paymentTerms} onValueChange={v => setForm({ ...form, paymentTerms: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              {form.paymentTerms === "Personalizado" && (
                <Input
                  value={form.customPaymentTerms}
                  onChange={e => setForm({ ...form, customPaymentTerms: e.target.value })}
                  className="mt-2"
                  placeholder="Descreva a condição de pagamento..."
                />
              )}
            </div>

            {/* Observações */}
            <div>
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="mt-1" rows={2} placeholder="Informações adicionais, prazo especial, condições específicas..." />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!form.title || loading}>
              {loading ? "Salvando..." : "Salvar Proposta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
