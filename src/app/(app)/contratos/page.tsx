"use client"
import { useEffect, useState } from "react"
import { Plus, FileText, Trash2, Download, CheckCircle2, ChevronDown, ChevronRight, Tag, Pencil } from "lucide-react"
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
interface Client { id: string; name: string }

const PACKAGES = [
  {
    label: "Pacote Essencial",
    short: "Essencial",
    color: "border-blue-200 bg-blue-50",
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
    short: "Premium",
    color: "border-amber-200 bg-amber-50",
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
    short: "Personalizado",
    color: "border-slate-200 bg-slate-50",
    items: ["Itens e valores definidos conforme necessidade do cliente"],
  },
]

const BEDROOMS = [
  { value: "1", label: "1 dormitório" },
  { value: "2", label: "2 dormitórios" },
]

interface ComboEntry {
  bedroom: string   // "1" | "2"
  pkgIndex: number  // 0=Essencial, 1=Premium, 2=Personalizado
  price: number
  units: number
}

// Default prices — user edits per row as needed
const DEFAULT_PRICES: Record<string, number[]> = {
  "1": [31350, 44960, 0],
  "2": [31350, 44960, 0],
}

const buildDefaultCombos = (): ComboEntry[] =>
  BEDROOMS.flatMap(b =>
    PACKAGES.map((_, pi) => ({
      bedroom: b.value,
      pkgIndex: pi,
      price: DEFAULT_PRICES[b.value][pi],
      units: 0,
    }))
  )

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
  const [clients, setClients] = useState<Client[]>([])
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandedDetails, setExpandedDetails] = useState(false)

  const [form, setForm] = useState({
    type: "proposta", title: "", clientId: "", status: "rascunho",
    paymentTerms: "", customPaymentTerms: "",
    discountType: "valor" as "valor" | "percentual",
    discount: 0, notes: "",
  })
  const [combos, setCombos] = useState<ComboEntry[]>(buildDefaultCombos())

  const load = () => Promise.all([
    fetch("/api/contracts").then(r => r.json()).then(setContracts),
    fetch("/api/clients").then(r => r.json()).then(setClients),
  ])
  useEffect(() => { load() }, [])

  const updateCombo = (i: number, field: "price" | "units", value: number) =>
    setCombos(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c))

  const totalUnits = combos.reduce((s, c) => s + c.units, 0)
  const subtotal = combos.reduce((s, c) => s + c.units * c.price, 0)
  const discountAmount = form.discountType === "percentual"
    ? subtotal * (form.discount / 100)
    : form.discount
  const totalValue = subtotal - discountAmount

  const save = async () => {
    setLoading(true)
    const paymentTerms = form.paymentTerms === "Personalizado" ? form.customPaymentTerms : form.paymentTerms
    const activeCombos = combos.filter(c => c.units > 0).map(c => ({
      bedroom: c.bedroom,
      pkg: PACKAGES[c.pkgIndex].label,
      price: c.price,
      units: c.units,
      subtotal: c.units * c.price,
    }))
    const contentJson = JSON.stringify({
      combos: activeCombos,
      totalUnits,
      subtotal,
      discount: discountAmount,
      discountPct: form.discountType === "percentual" ? form.discount : 0,
      totalValue,
      paymentTerms,
      notes: form.notes,
    })
    const body = {
      type: form.type, title: form.title, status: form.status, contentJson,
      clientId: form.clientId || null,
    }
    if (editId) await fetch(`/api/contracts/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    else await fetch("/api/contracts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    await load(); setOpen(false); setLoading(false)
  }

  const del = async (id: string) => { if (!confirm("Excluir?")) return; await fetch(`/api/contracts/${id}`, { method: "DELETE" }); await load() }

  const markSigned = async (c: Contract) => {
    await fetch(`/api/contracts/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "assinado", signedAt: new Date().toISOString() }),
    })

    if (!c.project) {
      const content = (() => { try { return JSON.parse(c.contentJson) } catch { return {} } })()
      // support: new combos[] format, previous packages[] format, and old package string format
      const units = content.totalUnits || content.units || 1
      const projRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: c.title,
          clientId: c.client?.id ?? null,
          status: "contrato",
          totalValue: content.totalValue ?? 0,
          unitCount: units,
        }),
      })
      if (projRes.ok) {
        const proj = await projRes.json()
        await fetch(`/api/contracts/${c.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId: proj.id }),
        })
        // create apartments with bedroom + plan info from combos
        if (content.combos?.length) {
          let aptNum = 1
          for (const combo of content.combos as Array<{bedroom:string;pkg:string;price:number;units:number}>) {
            for (let i = 0; i < combo.units; i++) {
              await fetch("/api/apartments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  projectId: proj.id,
                  number: String(aptNum++),
                  bedrooms: combo.bedroom,
                  plan: combo.pkg,
                  totalValue: combo.price,
                }),
              })
            }
          }
        } else {
          // fallback for older format
          const valuePerUnit = (content.totalValue ?? 0) / units
          const firstPkg = content.packages?.find((p: {units:number}) => p.units > 0)?.label || content.package || ""
          for (let i = 1; i <= units; i++) {
            await fetch("/api/apartments", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ projectId: proj.id, number: String(i), plan: firstPkg, totalValue: valuePerUnit }),
            })
          }
        }
      }
    }
    await load()
  }

  const printContract = (c: Contract) => {
    const content = (() => { try { return JSON.parse(c.contentJson) } catch { return {} } })()
    const combosData: Array<{bedroom:string;pkg:string;price:number;units:number;subtotal:number}> = content.combos ?? []
    // fallback to old packages[] format
    const oldPkgs: Array<{label:string;units:number;pricePerUnit:number;subtotal:number}> = content.packages ?? []
    const oldPkg = PACKAGES.find(p => p.label === content.package)

    const html = `
      <html><head><title>${c.title}</title>
      <style>
        body{font-family:Arial,sans-serif;max-width:820px;margin:40px auto;color:#111;line-height:1.6;font-size:14px}
        h1{color:#111;border-bottom:3px solid #f59e0b;padding-bottom:10px;margin-bottom:6px}
        h2{color:#333;margin-top:28px;font-size:16px}
        .label{color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px}
        .value{font-weight:600;margin-bottom:14px}
        table{width:100%;border-collapse:collapse;margin:8px 0 16px}
        th{background:#f8fafc;padding:8px 12px;text-align:left;font-size:12px;color:#64748b;border-bottom:2px solid #e2e8f0;border-top:1px solid #e2e8f0}
        td{padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px}
        .total-row td{background:#f8fafc;font-weight:bold;border-top:2px solid #e2e8f0}
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
        <img src="${window.location.origin}/logo-l2e.png" style="height:48px;object-fit:contain" alt="L2E Prime Solutions" />
        <div><div style="font-size:20px;font-weight:bold">L2E Prime Solutions</div>
        <div style="color:#666;font-size:13px">Acabamento Completo de Apartamentos</div></div>
      </div>
      <h1>${c.title}</h1>
      <p style="color:#9ca3af;font-size:12px">Emitido em: ${formatDate(c.createdAt)}</p>
      ${c.client ? `<div class="label">Cliente</div><div class="value">${c.client.name}</div>` : ""}
      <h2>Escopo do Serviço</h2>
      ${combosData.length > 0 ? `
        <table>
          <thead><tr>
            <th>Dormitórios</th><th>Pacote</th>
            <th style="text-align:center">Qtd</th>
            <th style="text-align:right">Preço/un</th>
            <th style="text-align:right">Subtotal</th>
          </tr></thead>
          <tbody>
            ${combosData.map(r => `<tr>
              <td>${r.bedroom} dorm.</td>
              <td>${r.pkg.replace("Pacote ","")}</td>
              <td style="text-align:center">${r.units} un.</td>
              <td style="text-align:right">${formatCurrency(r.price)}</td>
              <td style="text-align:right">${formatCurrency(r.subtotal)}</td>
            </tr>`).join("")}
            <tr class="total-row">
              <td colspan="2">Total</td>
              <td style="text-align:center">${content.totalUnits} un.</td>
              <td></td>
              <td style="text-align:right">${formatCurrency(content.subtotal ?? 0)}</td>
            </tr>
          </tbody>
        </table>
        ${[...new Set(combosData.map(r => r.pkg))].map(pkgLabel => {
          const pkg = PACKAGES.find(p => p.label === pkgLabel)
          return pkg ? `<div style="margin-bottom:12px"><div class="label">${pkgLabel} — itens incluídos</div>${pkg.items.map(i => `<div class="pkg-item">${i}</div>`).join("")}</div>` : ""
        }).join("")}
      ` : oldPkgs.length > 0 ? `
        <table>
          <thead><tr><th>Pacote</th><th style="text-align:center">Qtd</th><th style="text-align:right">Preço/un</th><th style="text-align:right">Subtotal</th></tr></thead>
          <tbody>
            ${oldPkgs.map(p => `<tr><td>${p.label}</td><td style="text-align:center">${p.units}</td><td style="text-align:right">${formatCurrency(p.pricePerUnit)}</td><td style="text-align:right">${formatCurrency(p.subtotal)}</td></tr>`).join("")}
            <tr class="total-row"><td colspan="2">Total</td><td style="text-align:center">${content.totalUnits}</td><td></td><td style="text-align:right">${formatCurrency(content.subtotal??0)}</td></tr>
          </tbody>
        </table>
      ` : `
        <div class="label">Pacote</div><div class="value">${content.package || "—"}</div>
        ${oldPkg ? oldPkg.items.map(i => `<div class="pkg-item">${i}</div>`).join("") : ""}
        <div class="label">Unidades</div><div class="value">${content.units ?? 1} un.</div>
      `}
      <h2>Valores</h2>
      ${(content.discount ?? 0) > 0 ? `<div class="label">Desconto${(content.discountPct??0) > 0 ? ` (${content.discountPct}%)` : ""}</div><div class="value" style="color:#dc2626">- ${formatCurrency(content.discount)}</div>` : ""}
      <div class="total-box">
        <div class="total-label">Valor Total do Contrato</div>
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

  const resetForm = () => {
    setForm({ type: "proposta", title: "", clientId: "", status: "rascunho", paymentTerms: "", customPaymentTerms: "", discountType: "valor", discount: 0, notes: "" })
    setCombos(buildDefaultCombos())
  }

  const openEdit = (c: Contract) => {
    const content = (() => { try { return JSON.parse(c.contentJson) } catch { return {} } })()

    // Reconstrói a matriz de combos a partir do contentJson salvo
    const newCombos = buildDefaultCombos()
    if (content.combos?.length) {
      for (const saved of content.combos as Array<{bedroom:string;pkg:string;price:number;units:number}>) {
        const bi = BEDROOMS.findIndex(b => b.value === saved.bedroom)
        const pi = PACKAGES.findIndex(p => p.label === saved.pkg)
        if (bi >= 0 && pi >= 0) {
          const idx = bi * PACKAGES.length + pi
          newCombos[idx].units = saved.units
          newCombos[idx].price = saved.price
        }
      }
    }

    const discountPct = content.discountPct ?? 0
    const discountType: "valor" | "percentual" = discountPct > 0 ? "percentual" : "valor"
    const discount = discountPct > 0 ? discountPct : (content.discount ?? 0)

    const pt = content.paymentTerms ?? ""
    const isCustom = pt !== "" && !PAYMENT_TERMS.filter(p => p !== "Personalizado").includes(pt)

    setForm({
      type: c.type,
      title: c.title,
      clientId: c.client?.id ?? "",
      status: c.status,
      paymentTerms: isCustom ? "Personalizado" : pt,
      customPaymentTerms: isCustom ? pt : "",
      discountType,
      discount,
      notes: content.notes ?? "",
    })
    setCombos(newCombos)
    setEditId(c.id)
    setExpandedDetails(false)
    setOpen(true)
  }

  return (
    <>
      <Topbar
        title="Propostas"
        subtitle="Gerador de propostas comerciais"
        action={<Button onClick={() => { resetForm(); setEditId(null); setOpen(true) }}><Plus className="h-4 w-4" />Nova Proposta</Button>}
      />
      <div className="p-3 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contracts.map(c => {
            const cs = CONTRACT_STATUS[c.status]
            const content = (() => { try { return JSON.parse(c.contentJson) } catch { return {} } })()
            const activeCombos: Array<{bedroom:string;pkg:string;units:number}> = content.combos ?? []
            // fallback display for older formats
            const oldPkgs: Array<{label:string;units:number}> = content.packages ?? []
            return (
              <Card key={c.id} className="hover:border-amber-300 hover:shadow-md transition-all">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-amber-600 shrink-0" />
                      <p className="font-semibold text-slate-900 text-sm leading-snug">{c.title}</p>
                    </div>
                    <Badge className={`${cs?.color} shrink-0 text-[10px]`}>{cs?.label}</Badge>
                  </div>
                  {c.client && <p className="text-xs text-slate-600 mb-1">Cliente: {c.client.name}</p>}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeCombos.length > 0
                      ? activeCombos.map((r, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                            <Tag className="h-3 w-3" />{r.units}× {r.bedroom}d {r.pkg.replace("Pacote ","")}
                          </span>
                        ))
                      : oldPkgs.filter(p => p.units > 0).map(p => (
                          <span key={p.label} className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                            <Tag className="h-3 w-3" />{p.units}× {p.label.replace("Pacote ","")}
                          </span>
                        ))
                    }
                    {activeCombos.length === 0 && oldPkgs.length === 0 && content.package && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                        <Tag className="h-3 w-3" />{content.package}
                      </span>
                    )}
                  </div>
                  {content.totalValue > 0 && <p className="text-base font-bold text-amber-600 mt-2">{formatCurrency(content.totalValue)}</p>}
                  {content.paymentTerms && <p className="text-xs text-slate-400 mt-0.5">{content.paymentTerms}</p>}
                  {c.signedAt && <p className="text-xs text-emerald-600 mt-1 font-medium">✓ Assinado em {formatDate(c.signedAt)}</p>}
                  <div className="flex gap-1.5 mt-3">
                    <Button size="sm" variant="outline" onClick={() => printContract(c)}>
                      <Download className="h-3.5 w-3.5" />PDF
                    </Button>
                    {c.status !== "assinado" && (
                      <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50" onClick={() => openEdit(c)}>
                        <Pencil className="h-3.5 w-3.5" />Editar
                      </Button>
                    )}
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

      {/* Modal */}
      <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) setOpen(false) }}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Editar Proposta" : "Nova Proposta Comercial"}</DialogTitle>
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
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1" placeholder="Ex: Proposta RED 73 | João Silva" />
            </div>

            {/* Cliente */}
            <div>
              <Label>Cliente</Label>
              <Select value={form.clientId} onValueChange={v => setForm({ ...form, clientId: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">—</SelectItem>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-slate-500 bg-blue-50 border border-blue-200 rounded p-2">
              O projeto e apartamentos serão criados automaticamente ao assinar, com os dormitórios e pacotes preenchidos abaixo.
            </p>

            {/* Matriz Dormitórios × Pacotes */}
            <div>
              <Label className="mb-2 block">Combinações — Dormitórios × Pacote</Label>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium">Dorm.</th>
                        <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium">Pacote</th>
                        <th className="text-right px-3 py-2 text-xs text-slate-500 font-medium">Preço/un</th>
                        <th className="text-center px-3 py-2 text-xs text-slate-500 font-medium">Qtd</th>
                        <th className="text-right px-3 py-2 text-xs text-slate-500 font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BEDROOMS.map((bed, bi) => (
                        <>
                          {/* Separator row between bedroom groups */}
                          {bi > 0 && (
                            <tr key={`sep-${bi}`} className="bg-slate-50/50">
                              <td colSpan={5} className="px-3 py-1 border-t border-slate-200" />
                            </tr>
                          )}
                          {PACKAGES.map((pkg, pi) => {
                            const idx = bi * PACKAGES.length + pi
                            const combo = combos[idx]
                            const rowSubtotal = combo.units * combo.price
                            return (
                              <tr key={`${bed.value}-${pi}`} className="border-b border-slate-50 last:border-0">
                                <td className="px-3 py-2 text-xs text-slate-500 whitespace-nowrap">
                                  {pi === 0 ? bed.label : ""}
                                </td>
                                <td className="px-3 py-2 text-xs font-medium text-slate-700 whitespace-nowrap">
                                  {pkg.short}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <Input
                                    type="number" min={0}
                                    value={combo.price || ""}
                                    onChange={e => updateCombo(idx, "price", parseFloat(e.target.value) || 0)}
                                    className="h-7 text-right w-28 ml-auto text-xs"
                                    placeholder="R$ 0"
                                  />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <Input
                                    type="number" min={0}
                                    value={combo.units || ""}
                                    onChange={e => updateCombo(idx, "units", parseInt(e.target.value) || 0)}
                                    className="h-7 text-center w-14 mx-auto text-xs"
                                  />
                                </td>
                                <td className="px-3 py-2 text-right text-xs font-medium text-slate-600 whitespace-nowrap">
                                  {rowSubtotal > 0 ? formatCurrency(rowSubtotal) : "—"}
                                </td>
                              </tr>
                            )
                          })}
                        </>
                      ))}
                      <tr className="bg-amber-50 border-t-2 border-amber-200">
                        <td className="px-3 py-2 font-semibold text-amber-800 text-xs" colSpan={3}>Total</td>
                        <td className="px-3 py-2 text-center font-bold text-amber-800 text-xs">{totalUnits} un.</td>
                        <td className="px-3 py-2 text-right font-bold text-amber-700 text-xs">{formatCurrency(subtotal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Detalhes dos pacotes */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedDetails(!expandedDetails)}
                className="flex items-center gap-2 w-full px-4 py-3 text-left bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                {expandedDetails ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                <span className="text-sm font-medium text-slate-700">O que está incluído em cada pacote?</span>
              </button>
              {expandedDetails && (
                <div className="divide-y divide-slate-100">
                  {PACKAGES.filter(p => p.label !== "Pacote Personalizado").map(p => (
                    <div key={p.label} className={`p-4 ${p.color}`}>
                      <p className="text-xs font-bold text-slate-700 mb-2">{p.label}</p>
                      <ul className="space-y-1">
                        {p.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
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

            {/* Resumo total */}
            {subtotal > 0 && (
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
                <div className="space-y-1 text-sm mb-3">
                  {combos.filter(c => c.units > 0).map((c, i) => {
                    const bed = BEDROOMS.find(b => b.value === c.bedroom)
                    const pkg = PACKAGES[c.pkgIndex]
                    return (
                      <div key={i} className="flex justify-between text-slate-600 text-xs">
                        <span>{c.units}× {bed?.label} — {pkg.short}</span>
                        <span className="font-medium">{formatCurrency(c.units * c.price)}</span>
                      </div>
                    )
                  })}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-red-500 text-xs">
                      <span>Desconto {form.discountType === "percentual" ? `(${form.discount}%)` : ""}</span>
                      <span className="font-medium">− {formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center border-t-2 border-amber-200 pt-3">
                  <span className="text-sm font-bold text-amber-800">TOTAL ({totalUnits} un.)</span>
                  <span className="text-2xl font-black text-amber-600">{formatCurrency(totalValue)}</span>
                </div>
                {totalUnits > 1 && (
                  <p className="text-xs text-amber-700 mt-1 text-right">
                    {formatCurrency(totalValue / totalUnits)}/unidade média
                  </p>
                )}
              </div>
            )}

            {/* Condição de Pagamento */}
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
