"use client"
import React, { useEffect, useState } from "react"
import { Plus, FileText, Trash2, Download, CheckCircle2, Tag, Pencil, ScrollText } from "lucide-react"
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
import { addBusinessDays } from "@/lib/packageItems"

interface Contract {
  id: string; type: string; title: string; status: string
  signedAt?: string; createdAt: string; contentJson: string
  project?: { id: string; name: string }
  client?: { id: string; name: string }
}
interface Client { id: string; name: string }
interface PkgPrice { id: string; package: string; bedroom: string; price: number; startDate: string; endDate?: string | null }
interface PkgItem { id: string; package: string; category?: string | null; description: string; quantity: number; unitCost: number; order: number }

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

function isPkgPriceActive(p: PkgPrice): boolean {
  const today = new Date()
  const start = new Date(p.startDate)
  const end = p.endDate ? new Date(p.endDate) : null
  return start <= today && (!end || end >= today)
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

const buildCombosWithPrices = (pkgPrices: PkgPrice[]): ComboEntry[] =>
  BEDROOMS.flatMap(b =>
    PACKAGES.map((pkg, pi) => {
      let price = DEFAULT_PRICES[b.value][pi]
      if (pi !== 2) {
        const active = pkgPrices.find(p => p.package === pkg.label && p.bedroom === b.value && isPkgPriceActive(p))
        if (active) price = active.price
      }
      return { bedroom: b.value, pkgIndex: pi, price, units: 0 }
    })
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
  const [pkgPrices, setPkgPrices] = useState<PkgPrice[]>([])
  const [pkgItemsData, setPkgItemsData] = useState<PkgItem[]>([])
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // personalizadoSelected: comboIdx → array of selected PkgItem IDs
  const [personalizadoSelected, setPersonalizadoSelected] = useState<Record<number, string[]>>({})

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
    fetch("/api/package-prices").then(r => r.json()).then(setPkgPrices),
    fetch("/api/package-items").then(r => r.json()).then(setPkgItemsData),
  ])
  useEffect(() => { load() }, [])

  const togglePersonalizadoItem = (comboIdx: number, itemId: string) => {
    setPersonalizadoSelected(prev => {
      const current = prev[comboIdx] ?? []
      const next = current.includes(itemId)
        ? current.filter(id => id !== itemId)
        : [...current, itemId]
      const totalCost = next.reduce((sum, id) => {
        const it = pkgItemsData.find(p => p.id === id)
        return sum + (it ? it.quantity * it.unitCost : 0)
      }, 0)
      setCombos(prev2 => prev2.map((c, i) =>
        i === comboIdx ? { ...c, price: totalCost > 0 ? Math.round(totalCost * 1.4) : c.price } : c
      ))
      return { ...prev, [comboIdx]: next }
    })
  }

  const updateCombo = (i: number, field: "price" | "units", value: number) =>
    setCombos(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c))

  const totalUnits = combos.reduce((s, c) => s + c.units, 0)
  const subtotal = combos.reduce((s, c) => s + c.units * c.price, 0)
  const discountAmount = form.discountType === "percentual"
    ? subtotal * (form.discount / 100)
    : form.discount
  const totalValue = subtotal - discountAmount

  // Custo total baseado nos itens do pacote (para exibição interna, não vai para o PDF)
  const totalCusto = combos.filter(c => c.units > 0).reduce((sum, c) => {
    const pkg = PACKAGES[c.pkgIndex]
    const isPersonalizado = c.pkgIndex === 2
    const selected = personalizadoSelected[combos.indexOf(c)] ?? []
    let items = pkgItemsData.filter(p => p.package === pkg.label)
    if (c.bedroom === "1") items = items.filter(p => !p.description.toLowerCase().includes("solteiro"))
    if (isPersonalizado && selected.length > 0) items = items.filter(p => selected.includes(p.id))
    const custoPorUnidade = items.reduce((s, it) => s + it.quantity * it.unitCost, 0)
    return sum + custoPorUnidade * c.units
  }, 0)
  const totalLucro = totalValue - totalCusto
  const margemPct = totalValue > 0 ? (totalLucro / totalValue * 100) : 0

  const save = async () => {
    setLoading(true)
    const paymentTerms = form.paymentTerms === "Personalizado" ? form.customPaymentTerms : form.paymentTerms
    const activeCombos = combos
      .map((c, idx) => ({ ...c, idx }))
      .filter(c => c.units > 0)
      .map(c => ({
        bedroom: c.bedroom,
        pkg: PACKAGES[c.pkgIndex].label,
        price: c.price,
        units: c.units,
        subtotal: c.units * c.price,
        ...(c.pkgIndex === 2 ? { selectedItemIds: personalizadoSelected[c.idx] ?? [] } : {}),
      }))
    const contentJson = JSON.stringify({
      combos: activeCombos,
      totalUnits,
      subtotal,
      discount: discountAmount,
      discountPct: form.discountType === "percentual" ? form.discount : (subtotal > 0 ? parseFloat((discountAmount / subtotal * 100).toFixed(2)) : 0),
      totalValue,
      paymentTerms,
      notes: form.notes,
    })
    const body = {
      type: form.type, title: form.title, status: form.status, contentJson,
      clientId: form.clientId || null,
    }
    const res = editId
      ? await fetch(`/api/contracts/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch("/api/contracts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (!res.ok) { alert("Erro ao salvar proposta"); setLoading(false); return }
    await load(); setOpen(false); setLoading(false)
  }

  const del = async (id: string) => {
    if (!confirm("Excluir?")) return
    const res = await fetch(`/api/contracts/${id}`, { method: "DELETE" })
    if (!res.ok) alert("Erro ao excluir proposta")
    await load()
  }

  const markSigned = async (c: Contract) => {
    const signRes = await fetch(`/api/contracts/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "assinado", signedAt: new Date().toISOString() }),
    })
    if (!signRes.ok) { alert("Erro ao assinar contrato"); await load(); return }

    if (!c.project) {
      const content = (() => { try { return JSON.parse(c.contentJson) } catch { return {} } })()
      const units = content.totalUnits || content.units || 1
      const signedAt = new Date()
      const deliveryDate = addBusinessDays(signedAt, 30)

      const projRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: c.title,
          clientId: c.client?.id ?? null,
          status: "contrato",
          totalValue: content.totalValue ?? 0,
          unitCount: units,
          startDate: signedAt.toISOString(),
          deliveryDate: deliveryDate.toISOString(),
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
          for (const combo of content.combos as Array<{bedroom:string;pkg:string;price:number;units:number;selectedItemIds?:string[]}>) {
            for (let i = 0; i < combo.units; i++) {
              const aptRes = await fetch("/api/apartments", {
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
              if (aptRes.ok) {
                const apt = await aptRes.json()
                // Use initFromPlan (API will fetch from DB PackageItem)
                await fetch("/api/apartment-items", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    initFromPlan: true,
                    apartmentId: apt.id,
                    plan: combo.pkg,
                    bedrooms: combo.bedroom,
                    selectedItemIds: combo.selectedItemIds ?? [],
                  }),
                })
              }
            }
          }
        } else {
          // fallback for older format
          const valuePerUnit = (content.totalValue ?? 0) / units
          const firstPkg = content.packages?.find((p: {units:number}) => p.units > 0)?.label || content.package || "Pacote Essencial"
          for (let i = 1; i <= units; i++) {
            const aptRes = await fetch("/api/apartments", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ projectId: proj.id, number: String(i), plan: firstPkg, totalValue: valuePerUnit }),
            })
            if (aptRes.ok) {
              const apt = await aptRes.json()
              await fetch("/api/apartment-items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ initFromPlan: true, apartmentId: apt.id, plan: firstPkg }),
              })
            }
          }
        }

        // Auto-generate payment transactions based on paymentTerms
        const projId = proj.id
        const tv = content.totalValue ?? 0
        const pt = content.paymentTerms ?? ""
        const clientIdVal = c.client?.id ?? null

        if (tv > 0 && projId) {
          let parcelas: Array<{ amount: number; dueDate: string; desc: string }> = []
          const today = new Date()

          if (pt.includes("50%") && pt.includes("50%")) {
            parcelas = [
              { amount: tv * 0.5, dueDate: today.toISOString(), desc: `${c.title} — Entrada (50%)` },
              { amount: tv * 0.5, dueDate: deliveryDate.toISOString(), desc: `${c.title} — Entrega (50%)` },
            ]
          } else if (pt.includes("30%") && pt.includes("70%")) {
            parcelas = [
              { amount: tv * 0.3, dueDate: today.toISOString(), desc: `${c.title} — Entrada (30%)` },
              { amount: tv * 0.7, dueDate: deliveryDate.toISOString(), desc: `${c.title} — Entrega (70%)` },
            ]
          } else if (pt.includes("100%") || pt.includes("à vista")) {
            parcelas = [{ amount: tv, dueDate: today.toISOString(), desc: `${c.title} — Pgto à vista` }]
          } else {
            const match = pt.match(/(\d+)x/)
            const n = match ? parseInt(match[1]) : 2
            const valor = Math.round((tv / n) * 100) / 100
            for (let i = 0; i < n; i++) {
              const d = new Date(today)
              d.setMonth(d.getMonth() + i)
              parcelas.push({
                amount: i === n - 1 ? Math.round((tv - valor * (n - 1)) * 100) / 100 : valor,
                dueDate: d.toISOString(),
                desc: `${c.title} — Parcela ${i + 1}/${n}`,
              })
            }
          }

          for (const p of parcelas) {
            await fetch("/api/transactions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "entrada",
                category: "Recebimento",
                description: p.desc,
                amount: p.amount,
                dueDate: p.dueDate,
                status: "pendente",
                projectId: projId,
                clientId: clientIdVal,
              }),
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
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:Arial,sans-serif;max-width:800px;margin:28px auto;color:#111;line-height:1.45;font-size:12px}
        .header{display:flex;align-items:center;justify-content:space-between;padding-bottom:10px;border-bottom:3px solid #f59e0b;margin-bottom:14px}
        .header-left{display:flex;align-items:center;gap:12px}
        .header-right{text-align:right;font-size:10px;color:#64748b}
        h1{font-size:17px;font-weight:bold;color:#111;margin-bottom:2px}
        .subtitle{color:#64748b;font-size:11px;margin-bottom:10px}
        .info-row{display:flex;gap:24px;margin-bottom:10px;padding:8px 10px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0}
        .info-cell .lbl{font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;font-weight:600}
        .info-cell .val{font-size:12px;font-weight:600;color:#1e293b;margin-top:1px}
        h2{font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;margin:14px 0 6px;padding-bottom:4px;border-bottom:1px solid #e2e8f0}
        table{width:100%;border-collapse:collapse;margin-bottom:10px;font-size:11px}
        th{background:#f8fafc;padding:5px 8px;text-align:left;font-size:10px;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0;border-top:1px solid #e2e8f0;text-transform:uppercase;letter-spacing:0.04em}
        td{padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#334155}
        .total-row td{background:#fffbeb;font-weight:700;border-top:2px solid #f59e0b;color:#92400e}
        .items-block{margin-bottom:10px;page-break-inside:avoid}
        .items-block-title{font-size:10px;font-weight:700;color:#475569;background:#f1f5f9;padding:4px 8px;border-radius:4px;margin-bottom:6px;border-left:3px solid #f59e0b}
        .cat-label{font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin:6px 0 3px}
        .items-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px 16px}
        .pkg-item{font-size:11px;color:#374151;padding:2px 0;display:flex;align-items:baseline;gap:4px}
        .pkg-item:before{content:"✓";color:#10b981;font-weight:700;font-size:10px;flex-shrink:0}
        .value-row{display:flex;align-items:center;gap:16px;margin-bottom:8px;flex-wrap:wrap}
        .total-box{flex:1;min-width:180px;background:#fffbeb;border:2px solid #f59e0b;border-radius:8px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between}
        .total-box-label{font-size:10px;color:#92400e;text-transform:uppercase;letter-spacing:0.05em;font-weight:600}
        .total-box-value{font-size:22px;font-weight:800;color:#d97706}
        .discount-box{flex:0 0 auto;background:#fef2f2;border:1px solid #fca5a5;border-radius:6px;padding:8px 12px}
        .discount-label{font-size:9px;color:#b91c1c;text-transform:uppercase;font-weight:600}
        .discount-value{font-size:14px;font-weight:700;color:#dc2626;margin-top:1px}
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}
        .info-card{border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px;page-break-inside:avoid}
        .info-card .lbl{font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;margin-bottom:2px}
        .info-card .val{font-size:12px;color:#1e293b}
        .sign-box{margin-top:32px;display:flex;gap:40px;page-break-inside:avoid}
        .sign-line{flex:1;border-top:1px solid #94a3b8;padding-top:6px;text-align:center;font-size:10px;color:#475569}
        .footer{margin-top:20px;border-top:1px solid #e5e7eb;padding-top:8px;color:#9ca3af;font-size:9px;text-align:center}
        @media print{body{margin:12px;max-width:100%} @page{margin:12mm}}
      </style></head><body>

      <div class="header">
        <div class="header-left">
          <img src="${window.location.origin}/logo-l2e.png" style="height:40px;object-fit:contain" alt="L2E" />
          <div>
            <div style="font-size:15px;font-weight:800;color:#111">L2E Prime Solutions</div>
            <div style="color:#64748b;font-size:11px">Acabamento Completo de Apartamentos</div>
          </div>
        </div>
        <div class="header-right">
          <div style="font-size:13px;font-weight:700;color:#111">${c.type === "contrato" ? "CONTRATO" : "PROPOSTA COMERCIAL"}</div>
          <div style="margin-top:2px">Emitido em ${formatDate(c.createdAt)}</div>
          ${c.signedAt ? `<div style="color:#16a34a;font-weight:600;margin-top:2px">✓ Assinado em ${formatDate(c.signedAt)}</div>` : ""}
        </div>
      </div>

      <h1>${c.title}</h1>
      ${c.client ? `<div class="subtitle">Cliente: <strong>${c.client.name}</strong></div>` : ""}

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
          const combo = combosData.find(r => r.pkg === pkgLabel)
          const isPersonalizado = pkgLabel === "Pacote Personalizado"
          const bedroom = combo?.bedroom
          let itemsToShow: PkgItem[] = []
          const comboAny = combo as unknown as {selectedItemIds?:string[]}
          if (isPersonalizado && combo && comboAny.selectedItemIds?.length) {
            itemsToShow = pkgItemsData.filter(i => i.package === pkgLabel && comboAny.selectedItemIds!.includes(i.id)).sort((a,b) => a.order - b.order)
          } else if (!isPersonalizado) {
            itemsToShow = pkgItemsData.filter(i => i.package === pkgLabel).sort((a,b) => a.order - b.order)
          }
          if (bedroom === "1") itemsToShow = itemsToShow.filter(i => !i.description.toLowerCase().includes("solteiro"))
          if (!itemsToShow.length) return ""
          const cats = [...new Set(itemsToShow.map(i => i.category ?? "Outros"))]
          return `<div class="items-block">
            <div class="items-block-title">${pkgLabel} — itens incluídos</div>
            ${cats.map(cat => {
              const catItems = itemsToShow.filter(i => (i.category ?? "Outros") === cat)
              return `<div>
                <div class="cat-label">${cat}</div>
                <div class="items-grid">
                  ${catItems.map(i => `<div class="pkg-item">${i.description}</div>`).join("")}
                </div>
              </div>`
            }).join("")}
          </div>`
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
        <div class="items-block-title">${content.package || "Pacote"}</div>
        ${oldPkg ? `<div class="items-grid" style="margin-top:6px">${oldPkg.items.map(i => `<div class="pkg-item">${i}</div>`).join("")}</div>` : ""}
        <p style="margin-top:6px;font-size:11px"><strong>${content.units ?? 1} unidade(s)</strong></p>
      `}

      <h2>Valores</h2>
      <div class="value-row">
        ${(content.discount ?? 0) > 0 ? `
          <div class="discount-box">
            <div class="discount-label">Desconto${(content.discountPct??0) > 0 ? ` (${content.discountPct}%)` : ""}</div>
            <div class="discount-value">− ${formatCurrency(content.discount)}</div>
          </div>
        ` : ""}
        <div class="total-box">
          <div class="total-box-label">Valor Total do Contrato</div>
          <div class="total-box-value">${formatCurrency(content.totalValue ?? 0)}</div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-card">
          <div class="lbl">Condição de Pagamento</div>
          <div class="val" style="font-weight:600">${content.paymentTerms || "—"}</div>
        </div>
        <div class="info-card">
          <div class="lbl">Prazo de Entrega</div>
          <div class="val">Até <strong>30 dias úteis</strong> após assinatura e entrada</div>
        </div>
        <div class="info-card">
          <div class="lbl">Garantia</div>
          <div class="val"><strong>90 dias</strong> contra defeitos de instalação e montagem</div>
        </div>
        ${content.notes ? `
        <div class="info-card">
          <div class="lbl">Observações</div>
          <div class="val">${content.notes}</div>
        </div>` : ""}
      </div>

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
    setCombos(buildCombosWithPrices(pkgPrices))
    setPersonalizadoSelected({})
  }

  const openEdit = (c: Contract) => {
    const content = (() => { try { return JSON.parse(c.contentJson) } catch { return {} } })()

    // Reconstrói a matriz de combos a partir do contentJson salvo
    const newCombos = buildCombosWithPrices(pkgPrices)
    if (content.combos?.length) {
      for (const saved of content.combos as Array<{bedroom:string;pkg:string;price:number;units:number}>) {
        const bi = BEDROOMS.findIndex(b => b.value === saved.bedroom)
        const pi = PACKAGES.findIndex(p => p.label === saved.pkg)
        if (bi >= 0 && pi >= 0) {
          const idx = bi * PACKAGES.length + pi
          newCombos[idx].units = saved.units
          if (pi === 2) newCombos[idx].price = saved.price // Personalizado: keep saved price
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

    // restore personalizado selected items
    const newSelected: Record<number, string[]> = {}
    if (content.combos?.length) {
      for (const saved of content.combos as Array<{bedroom:string;pkg:string;price:number;units:number;selectedItemIds?:string[]}>) {
        const bi = BEDROOMS.findIndex(b => b.value === saved.bedroom)
        const pi = PACKAGES.findIndex(p => p.label === saved.pkg)
        if (bi >= 0 && pi === 2 && saved.selectedItemIds?.length) {
          const idx = bi * PACKAGES.length + pi
          newSelected[idx] = saved.selectedItemIds
        }
      }
    }
    setPersonalizadoSelected(newSelected)

    setEditId(c.id)
    setOpen(true)
  }

  const printContrato = (c: Contract) => {
    const content = (() => { try { return JSON.parse(c.contentJson) } catch { return {} } })()
    const combosData: Array<{bedroom:string;pkg:string;price:number;units:number;subtotal:number}> = content.combos ?? []
    const clientName = c.client?.name ?? "____________________"
    const today = new Date().toLocaleDateString("pt-BR")
    const totalUnitsVal = content.totalUnits ?? combosData.reduce((s: number, r: {units:number}) => s + r.units, 0) ?? 1
    const deliveryDays = "30 (trinta) dias uteis"

    const itemsHtml = [...new Set(combosData.map((r: {pkg:string}) => r.pkg))].map(pkgLabel => {
      let itemsToShow = pkgItemsData.filter(i => i.package === pkgLabel).sort((a,b) => a.order - b.order)
      const combo = combosData.find((r: {pkg:string}) => r.pkg === pkgLabel)
      if (combo && combo.bedroom === "1") itemsToShow = itemsToShow.filter(i => !i.description.toLowerCase().includes("solteiro"))
      if (!itemsToShow.length) return ""
      const cats = [...new Set(itemsToShow.map(i => i.category ?? "Outros"))]
      return `<div style="margin:8px 0">
        <p style="font-weight:600;font-size:11px;margin-bottom:4px">${pkgLabel}:</p>
        ${cats.map(cat => {
          const ci = itemsToShow.filter(i => (i.category ?? "Outros") === cat)
          return `<span style="font-size:10px;color:#64748b">${cat}:</span> <span style="font-size:10px">${ci.map(i => i.description).join(", ")}</span><br/>`
        }).join("")}
      </div>`
    }).join("")

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
      <title>Contrato — ${c.title}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Times New Roman',Times,serif;color:#111;font-size:12px;padding:40px 60px;max-width:800px;margin:0 auto;line-height:1.7}
        h1{font-size:16px;text-align:center;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;font-weight:700}
        h2{font-size:11px;text-align:center;color:#666;margin-bottom:24px;font-weight:400}
        h3{font-size:13px;font-weight:700;margin:18px 0 8px;text-transform:uppercase;border-bottom:1px solid #ccc;padding-bottom:4px}
        p{margin-bottom:8px;text-align:justify}
        .header{text-align:center;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid #111}
        .clause{margin-bottom:14px}
        .clause-title{font-weight:700;margin-bottom:4px}
        table{width:100%;border-collapse:collapse;margin:8px 0;font-size:11px}
        th{background:#f0f0f0;padding:5px 8px;text-align:left;font-size:10px;border:1px solid #ccc;font-weight:600}
        td{padding:5px 8px;border:1px solid #ccc}
        .sign-area{margin-top:60px;display:flex;justify-content:space-between;gap:40px}
        .sign-block{flex:1;text-align:center;padding-top:8px}
        .sign-line{border-top:1px solid #111;padding-top:6px;font-size:11px}
        .sign-sub{font-size:10px;color:#666}
        .footer{margin-top:40px;text-align:center;font-size:9px;color:#999;border-top:1px solid #ddd;padding-top:8px}
        .highlight{background:#fffbeb;border:1px solid #f59e0b;border-radius:4px;padding:8px 12px;margin:8px 0}
        .witness{margin-top:40px;display:flex;justify-content:space-between;gap:40px}
        @media print{body{padding:20px 40px}@page{margin:15mm}}
      </style>
    </head><body>

      <div class="header">
        <img src="${window.location.origin}/logo-l2e.png" style="height:40px;margin-bottom:8px" alt="L2E"/>
        <h1>Contrato de Prestacao de Servicos</h1>
        <h2>Acabamento e Mobiliamento de Apartamento(s)</h2>
      </div>

      <p>Pelo presente instrumento particular, as partes abaixo qualificadas:</p>

      <h3>Das Partes</h3>

      <div class="clause">
        <p class="clause-title">CONTRATADA:</p>
        <p><strong>L2E PRIME SOLUTIONS LTDA</strong>, pessoa juridica de direito privado, inscrita no CNPJ sob n. __________________, com sede em Sao Paulo/SP, neste ato representada por seus socios administradores, doravante denominada simplesmente <strong>CONTRATADA</strong>.</p>
      </div>

      <div class="clause">
        <p class="clause-title">CONTRATANTE:</p>
        <p><strong>${clientName.toUpperCase()}</strong>, portador(a) do CPF/CNPJ n. __________________, residente e domiciliado(a) em __________________, doravante denominado(a) simplesmente <strong>CONTRATANTE</strong>.</p>
      </div>

      <p>As partes acima qualificadas tem entre si, justo e contratado, o presente instrumento, que se regera pelas clausulas e condicoes seguintes:</p>

      <h3>Clausula 1 - Do Objeto</h3>
      <div class="clause">
        <p>1.1. O presente contrato tem por objeto a prestacao de servicos de <strong>acabamento completo e mobiliamento</strong> de ${totalUnitsVal} (${totalUnitsVal === 1 ? "uma" : totalUnitsVal === 2 ? "duas" : totalUnitsVal}) unidade(s) habitacional(is), conforme especificacoes abaixo:</p>

        <table>
          <thead><tr>
            <th>Dormitorios</th><th>Pacote</th><th style="text-align:center">Qtd</th><th style="text-align:right">Valor/un</th><th style="text-align:right">Subtotal</th>
          </tr></thead>
          <tbody>
            ${combosData.map((r: {bedroom:string;pkg:string;units:number;price:number;subtotal:number}) => `<tr>
              <td>${r.bedroom} dorm.</td>
              <td>${r.pkg.replace("Pacote ","")}</td>
              <td style="text-align:center">${r.units}</td>
              <td style="text-align:right">${formatCurrency(r.price)}</td>
              <td style="text-align:right">${formatCurrency(r.subtotal)}</td>
            </tr>`).join("")}
          </tbody>
        </table>

        <p>1.2. Os itens incluidos em cada pacote sao:</p>
        ${itemsHtml}
      </div>

      <h3>Clausula 2 - Do Valor e Forma de Pagamento</h3>
      <div class="clause">
        <p>2.1. O valor total dos servicos objeto deste contrato e de <strong>${formatCurrency(content.totalValue ?? 0)}</strong> (${content.totalValue ? numberToWords(content.totalValue) : "zero"} reais).</p>
        ${(content.discount ?? 0) > 0 ? `<p>2.2. Desconto concedido: <strong>${formatCurrency(content.discount)}</strong>${(content.discountPct ?? 0) > 0 ? ` (${content.discountPct}%)` : ""}.</p>` : ""}
        <p>2.${(content.discount ?? 0) > 0 ? "3" : "2"}. A forma de pagamento acordada entre as partes e: <strong>${content.paymentTerms || "a definir"}</strong>.</p>
        <p>2.${(content.discount ?? 0) > 0 ? "4" : "3"}. O atraso no pagamento de qualquer parcela implicara em multa de 2% (dois por cento) sobre o valor da parcela em atraso, acrescido de juros de mora de 1% (um por cento) ao mes.</p>
      </div>

      <h3>Clausula 3 - Do Prazo de Execucao</h3>
      <div class="clause">
        <p>3.1. O prazo para execucao dos servicos e de <strong>${deliveryDays}</strong>, contados a partir da data de confirmacao do pagamento da entrada.</p>
        <p>3.2. O prazo podera ser prorrogado em caso de forca maior, caso fortuito ou atraso na liberacao do acesso ao imovel pelo CONTRATANTE.</p>
      </div>

      <h3>Clausula 4 - Das Obrigacoes da Contratada</h3>
      <div class="clause">
        <p>4.1. Executar os servicos descritos na Clausula 1 com qualidade e dentro do prazo estipulado.</p>
        <p>4.2. Fornecer todos os materiais, equipamentos e mao de obra necessarios para a execucao dos servicos.</p>
        <p>4.3. Manter o imovel limpo e organizado durante e apos a execucao dos servicos.</p>
        <p>4.4. Comunicar ao CONTRATANTE qualquer imprevisto que possa afetar o prazo ou a qualidade dos servicos.</p>
      </div>

      <h3>Clausula 5 - Das Obrigacoes do Contratante</h3>
      <div class="clause">
        <p>5.1. Efetuar os pagamentos nas datas e valores acordados.</p>
        <p>5.2. Garantir o acesso ao imovel para execucao dos servicos.</p>
        <p>5.3. Fornecer chaves, senhas de acesso e autorizacoes necessarias junto a administracao do condominio.</p>
        <p>5.4. Comunicar a CONTRATADA sobre quaisquer restricoes de horario ou regras do condominio.</p>
      </div>

      <h3>Clausula 6 - Da Garantia</h3>
      <div class="clause">
        <p>6.1. A CONTRATADA oferece garantia de <strong>90 (noventa) dias</strong> contra defeitos de instalacao e montagem em todos os produtos e servicos executados, contados a partir da data de entrega.</p>
        <p>6.2. A garantia nao cobre danos causados por mau uso, desgaste natural, acidentes ou intervencoes de terceiros.</p>
        <p>6.3. Eventuais garantias de fabricante dos produtos fornecidos seguem os termos e prazos do respectivo fabricante.</p>
      </div>

      <h3>Clausula 7 - Da Rescisao</h3>
      <div class="clause">
        <p>7.1. O presente contrato podera ser rescindido por qualquer das partes mediante comunicacao por escrito com antecedencia minima de 15 (quinze) dias.</p>
        <p>7.2. Em caso de rescisao por iniciativa do CONTRATANTE, sera devido o pagamento proporcional aos servicos ja executados e materiais ja adquiridos.</p>
        <p>7.3. Em caso de rescisao por iniciativa da CONTRATADA sem justa causa, esta devera restituir os valores pagos relativos a servicos nao executados.</p>
      </div>

      <h3>Clausula 8 - Das Disposicoes Gerais</h3>
      <div class="clause">
        <p>8.1. Qualquer alteracao no escopo dos servicos devera ser acordada por escrito entre as partes, podendo implicar em ajuste de valor e prazo.</p>
        <p>8.2. A CONTRATADA nao se responsabiliza por atrasos decorrentes de problemas estruturais do imovel, falta de energia, agua ou acesso.</p>
        <p>8.3. As partes elegem o foro da Comarca de Sao Paulo/SP para dirimir quaisquer duvidas oriundas do presente contrato.</p>
      </div>

      ${content.notes ? `<h3>Observacoes</h3><div class="clause"><p>${content.notes}</p></div>` : ""}

      <p style="text-align:center;margin-top:24px">E, por estarem assim justas e contratadas, as partes firmam o presente instrumento em 2 (duas) vias de igual teor e forma.</p>

      <p style="text-align:center;margin-top:16px">Sao Paulo, ${today}.</p>

      <div class="sign-area">
        <div class="sign-block">
          <div class="sign-line">L2E PRIME SOLUTIONS LTDA</div>
          <div class="sign-sub">CONTRATADA</div>
          <div class="sign-sub">Lucas Souza - Socio Administrador</div>
        </div>
        <div class="sign-block">
          <div class="sign-line">${clientName.toUpperCase()}</div>
          <div class="sign-sub">CONTRATANTE</div>
          <div class="sign-sub">CPF: ____________________</div>
        </div>
      </div>

      <div class="witness">
        <div class="sign-block">
          <div class="sign-line">Testemunha 1</div>
          <div class="sign-sub">Nome: ____________________</div>
          <div class="sign-sub">CPF: ____________________</div>
        </div>
        <div class="sign-block">
          <div class="sign-line">Testemunha 2</div>
          <div class="sign-sub">Nome: ____________________</div>
          <div class="sign-sub">CPF: ____________________</div>
        </div>
      </div>

      <div class="footer">L2E Prime Solutions · l2eprimesolutions.com · contato@l2eprimesolutions.com</div>
    </body></html>`

    const w = window.open("", "_blank")
    if (w) { w.document.write(html); w.document.close(); w.onload = () => { w.focus(); w.print() } }
  }

  // Helper: number to words (simplified for BRL)
  function numberToWords(n: number): string {
    if (n === 0) return "zero"
    const intPart = Math.floor(n)
    const units = ["", "um", "dois", "tres", "quatro", "cinco", "seis", "sete", "oito", "nove"]
    const teens = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"]
    const tens = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"]
    const hundreds = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"]
    if (intPart === 100) return "cem"
    if (intPart >= 1000000) return formatCurrency(n)
    const parts: string[] = []
    if (intPart >= 1000) {
      const t = Math.floor(intPart / 1000)
      if (t === 1) parts.push("mil")
      else if (t < 10) parts.push(units[t] + " mil")
      else if (t < 20) parts.push(teens[t - 10] + " mil")
      else { const d = Math.floor(t / 10); const u = t % 10; parts.push(tens[d] + (u ? " e " + units[u] : "") + " mil") }
    }
    const rem = intPart % 1000
    if (rem === 100) parts.push("cem")
    else if (rem > 0) {
      const h = Math.floor(rem / 100); const r = rem % 100
      if (h) parts.push(hundreds[h])
      if (r >= 10 && r < 20) parts.push(teens[r - 10])
      else if (r > 0) { const d = Math.floor(r / 10); const u = r % 10; if (d) parts.push(tens[d]); if (u) parts.push(units[u]) }
    }
    return parts.join(" e ")
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
                      <Download className="h-3.5 w-3.5" />Proposta
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-400 text-slate-700" onClick={() => printContrato(c)}>
                      <ScrollText className="h-3.5 w-3.5" />Contrato
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
                        <React.Fragment key={bed.value}>
                          {bi > 0 && (
                            <tr className="bg-slate-50/50">
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
                                  {pi !== 2 ? (
                                    <span className="text-xs text-slate-600 font-medium">
                                      {combo.price > 0 ? formatCurrency(combo.price) : <span className="italic text-slate-300">—</span>}
                                    </span>
                                  ) : (
                                    <Input
                                      type="number" min={0}
                                      value={combo.price || ""}
                                      onChange={e => updateCombo(idx, "price", parseFloat(e.target.value) || 0)}
                                      className="h-7 text-right w-28 ml-auto text-xs"
                                      placeholder="R$ 0"
                                    />
                                  )}
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
                        </React.Fragment>
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

            {/* Item list per active combo */}
            {combos.some(c => c.units > 0) && pkgItemsData.length > 0 && (
              <div className="space-y-2">
                <Label>Itens incluídos por pacote</Label>
                {combos
                  .map((c, idx) => ({ ...c, idx }))
                  .filter(c => c.units > 0)
                  .map(c => {
                    const pkg = PACKAGES[c.pkgIndex]
                    const items = pkgItemsData
                      .filter(p => p.package === pkg.label)
                      .filter(p => c.bedroom !== "1" || !p.description.toLowerCase().includes("solteiro"))
                      .sort((a, b) => a.order - b.order)
                    const categories = [...new Set(items.map(i => i.category ?? "Outros"))]
                    const isPersonalizado = c.pkgIndex === 2
                    const selected = personalizadoSelected[c.idx] ?? []
                    const selectedCost = selected.reduce((s, id) => {
                      const it = items.find(p => p.id === id)
                      return s + (it ? it.quantity * it.unitCost : 0)
                    }, 0)
                    return (
                      <div key={c.idx} className="rounded-lg border border-slate-200 overflow-hidden text-xs">
                        {/* Header compacto */}
                        <div className={`px-3 py-2 flex items-center justify-between gap-2 ${pkg.color}`}>
                          <span className="font-semibold text-slate-700 text-[11px]">
                            {c.bedroom} dorm. — {pkg.short}
                            <span className="ml-1 font-normal text-slate-500">({c.units} un.)</span>
                          </span>
                          {isPersonalizado && (
                            <span className="text-[10px] text-amber-700 font-medium shrink-0">
                              {selected.length > 0
                                ? `${selected.length} itens selecionados · ${formatCurrency(Math.round(selectedCost * 1.4))}`
                                : "Selecione os itens abaixo"}
                            </span>
                          )}
                          {!isPersonalizado && items.length > 0 && (
                            <span className="text-[10px] text-slate-400 shrink-0">{items.length} itens</span>
                          )}
                        </div>

                        {items.length > 0 ? (
                          <div className="bg-white px-3 py-2 space-y-2">
                            {categories.map(cat => {
                              const catItems = items.filter(i => (i.category ?? "Outros") === cat)
                              return (
                                <div key={cat}>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{cat}</p>
                                  <div className={`grid gap-x-4 gap-y-0 ${isPersonalizado ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
                                    {catItems.map(item => (
                                      isPersonalizado ? (
                                        <label key={item.id} className="flex items-center gap-1.5 cursor-pointer hover:bg-amber-50 rounded py-0.5 px-1 -mx-1">
                                          <input
                                            type="checkbox"
                                            checked={selected.includes(item.id)}
                                            onChange={() => togglePersonalizadoItem(c.idx, item.id)}
                                            className="rounded border-slate-300 accent-amber-500 shrink-0 h-3 w-3"
                                          />
                                          <span className="text-[11px] text-slate-700 leading-tight flex-1 truncate">{item.description}</span>
                                          <span className="text-[9px] text-slate-400 shrink-0 ml-1">{formatCurrency(item.quantity * item.unitCost)}</span>
                                        </label>
                                      ) : (
                                        <div key={item.id} className="flex items-center gap-1.5 py-0.5">
                                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                                          <span className="text-[11px] text-slate-600 leading-tight truncate">{item.description}</span>
                                        </div>
                                      )
                                    ))}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="px-3 py-2 text-[11px] text-slate-400 italic bg-white">
                            {isPersonalizado
                              ? "Selecione os itens para calcular o preço."
                              : "Sem itens cadastrados — carregue dados padrão em Preços de Pacotes."}
                          </p>
                        )}
                      </div>
                    )
                  })}
              </div>
            )}

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
                      <span>Desconto {
                        form.discountType === "percentual"
                          ? `(${form.discount}%)`
                          : subtotal > 0 ? `(${(discountAmount / subtotal * 100).toFixed(1)}%)` : ""
                      }</span>
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

                {/* Custo e Lucro — visível apenas na composição, não vai para impressão */}
                {totalCusto > 0 && (
                  <div className="mt-3 pt-3 border-t-2 border-amber-200 border-dashed space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Custo total (interno)</span>
                      <span className="font-bold text-slate-600">{formatCurrency(totalCusto)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className={totalLucro >= 0 ? "text-emerald-600" : "text-red-600"}>Lucro bruto</span>
                      <span className={`font-bold ${totalLucro >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(totalLucro)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Margem</span>
                      <span className={`font-bold ${margemPct >= 30 ? "text-emerald-600" : margemPct >= 15 ? "text-amber-600" : "text-red-600"}`}>{margemPct.toFixed(1)}%</span>
                    </div>
                  </div>
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
