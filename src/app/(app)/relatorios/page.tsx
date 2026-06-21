"use client"
import { useEffect, useState } from "react"
import { FileBarChart, Printer, Download } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, formatDateInput } from "@/lib/utils"

interface Supplier { id: string; name: string; cnpj?: string; phone?: string; email?: string; pixKey?: string; category?: string }
interface SupplierTransaction {
  id: string; type: string; category?: string; description: string
  amount: number; status: string; dueDate?: string; paidDate?: string
  paymentMethod?: string; invoiceNumber?: string
  project?: { name: string }
}

export default function RelatoriosPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [supplierId, setSupplierId] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [result, setResult] = useState<{
    supplier: Supplier
    transactions: SupplierTransaction[]
    totais: { totalPago: number; totalPendente: number; totalGeral: number }
  } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetch("/api/suppliers").then(r => r.json()).then(setSuppliers) }, [])

  const generate = async () => {
    if (!supplierId) return
    setLoading(true)
    const params = new URLSearchParams({ supplierId })
    if (dateFrom) params.set("from", dateFrom)
    if (dateTo) params.set("to", dateTo)
    const res = await fetch(`/api/extrato-fornecedor?${params}`)
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  const printExtrato = () => {
    if (!result) return
    const { supplier: s, transactions: trans, totais } = result
    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    const fmtD = (d?: string | null) => d ? new Date(d).toLocaleDateString("pt-BR") : "—"

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
      <title>Extrato — ${s.name}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:Arial,sans-serif;color:#1e293b;font-size:12px;padding:24px;max-width:860px;margin:0 auto}
        .header{display:flex;align-items:center;justify-content:space-between;padding-bottom:10px;border-bottom:3px solid #f59e0b;margin-bottom:16px}
        h1{font-size:16px;margin-bottom:2px}
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
        .info-box{border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px}
        .info-box .lbl{font-size:9px;color:#94a3b8;text-transform:uppercase;font-weight:600}
        .info-box .val{font-size:12px;color:#1e293b;margin-top:1px}
        .totals{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px}
        .total-card{border:1px solid #e2e8f0;border-radius:6px;padding:10px;text-align:center}
        table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:16px}
        th{background:#f8fafc;padding:5px 8px;text-align:left;font-size:10px;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0;text-transform:uppercase}
        td{padding:5px 8px;border-bottom:1px solid #f1f5f9}
        .paid{color:#16a34a;font-weight:600} .pending{color:#d97706;font-weight:600}
        .footer{margin-top:20px;border-top:1px solid #e5e7eb;padding-top:8px;text-align:center;font-size:9px;color:#94a3b8}
        @media print{body{padding:12px;max-width:100%} @page{margin:10mm}}
      </style>
    </head><body>
      <div class="header">
        <div style="display:flex;align-items:center;gap:10px">
          <img src="${window.location.origin}/logo-l2e.png" style="height:36px;object-fit:contain" alt="L2E" />
          <div><div style="font-size:14px;font-weight:800">L2E Prime Solutions</div><div style="font-size:10px;color:#64748b">Extrato do Fornecedor</div></div>
        </div>
        <div style="text-align:right;font-size:10px;color:#64748b">
          <div>Emitido em ${new Date().toLocaleDateString("pt-BR")}</div>
          ${dateFrom || dateTo ? `<div>Período: ${dateFrom ? fmtD(dateFrom) : "início"} a ${dateTo ? fmtD(dateTo) : "hoje"}</div>` : ""}
        </div>
      </div>

      <h1>${s.name}</h1>
      <div class="info-grid" style="margin-top:8px">
        ${s.cnpj ? `<div class="info-box"><div class="lbl">CNPJ</div><div class="val">${s.cnpj}</div></div>` : ""}
        ${s.phone ? `<div class="info-box"><div class="lbl">Telefone</div><div class="val">${s.phone}</div></div>` : ""}
        ${s.email ? `<div class="info-box"><div class="lbl">E-mail</div><div class="val">${s.email}</div></div>` : ""}
        ${s.pixKey ? `<div class="info-box"><div class="lbl">Chave PIX</div><div class="val">${s.pixKey}</div></div>` : ""}
      </div>

      <div class="totals">
        <div class="total-card"><div class="lbl" style="font-size:9px;color:#64748b">Total Geral</div><div style="font-size:16px;font-weight:bold">${fmt(totais.totalGeral)}</div></div>
        <div class="total-card" style="background:#f0fdf4;border-color:#bbf7d0"><div class="lbl" style="font-size:9px;color:#16a34a">Total Pago</div><div style="font-size:16px;font-weight:bold;color:#16a34a">${fmt(totais.totalPago)}</div></div>
        <div class="total-card" style="background:#fffbeb;border-color:#fde68a"><div class="lbl" style="font-size:9px;color:#d97706">Pendente</div><div style="font-size:16px;font-weight:bold;color:#d97706">${fmt(totais.totalPendente)}</div></div>
      </div>

      <table>
        <thead><tr>
          <th>Descrição</th><th>Projeto</th><th>Vencimento</th><th>Pgto</th><th>Forma</th><th style="text-align:right">Valor</th><th style="text-align:center">Status</th>
        </tr></thead>
        <tbody>
          ${trans.map(t => `<tr>
            <td>${t.description}</td>
            <td>${t.project?.name ?? "—"}</td>
            <td>${fmtD(t.dueDate)}</td>
            <td>${fmtD(t.paidDate)}</td>
            <td>${t.paymentMethod ?? "—"}</td>
            <td style="text-align:right;font-weight:600">${fmt(t.amount)}</td>
            <td style="text-align:center"><span class="${t.status === "pago" ? "paid" : "pending"}">${t.status === "pago" ? "Pago" : "Pendente"}</span></td>
          </tr>`).join("")}
          ${trans.length === 0 ? `<tr><td colspan="7" style="text-align:center;padding:16px;color:#94a3b8">Nenhum lançamento no período</td></tr>` : ""}
        </tbody>
      </table>

      <div class="footer">L2E Prime Solutions · Documento gerado em ${new Date().toLocaleString("pt-BR")}</div>
    </body></html>`

    const w = window.open("", "_blank")
    if (w) { w.document.write(html); w.document.close(); w.onload = () => { w.focus(); w.print() } }
  }

  return (
    <>
      <Topbar title="Relatórios" subtitle="Geração de relatórios e extratos" />
      <div className="p-3 sm:p-6 space-y-5">

        {/* Extrato do Fornecedor */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileBarChart className="h-5 w-5 text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-700">Extrato de Pagamento — Fornecedor</h2>
            </div>

            <div className="flex flex-wrap gap-3 items-end">
              <div className="min-w-[200px]">
                <Label className="text-xs">Fornecedor</Label>
                <select value={supplierId} onChange={e => { setSupplierId(e.target.value); setResult(null) }}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none">
                  <option value="">Selecione...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs">De</Label>
                <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="mt-1 h-9" />
              </div>
              <div>
                <Label className="text-xs">Até</Label>
                <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="mt-1 h-9" />
              </div>
              <Button onClick={generate} disabled={!supplierId || loading}>
                {loading ? "Carregando..." : "Gerar Extrato"}
              </Button>
              {result && (
                <Button variant="outline" onClick={printExtrato}>
                  <Printer className="h-4 w-4" />Imprimir
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        {result && (
          <div className="space-y-4">
            {/* Dados do fornecedor */}
            <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5">
              <h3 className="text-base font-bold">{result.supplier.name}</h3>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-300">
                {result.supplier.cnpj && <span>CNPJ: {result.supplier.cnpj}</span>}
                {result.supplier.phone && <span>Tel: {result.supplier.phone}</span>}
                {result.supplier.email && <span>{result.supplier.email}</span>}
                {result.supplier.pixKey && <span>PIX: {result.supplier.pixKey}</span>}
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Geral</p>
                  <p className="text-lg font-bold text-slate-700">{formatCurrency(result.totais.totalGeral)}</p>
                </CardContent>
              </Card>
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] text-emerald-600 uppercase font-semibold">Total Pago</p>
                  <p className="text-lg font-bold text-emerald-700">{formatCurrency(result.totais.totalPago)}</p>
                </CardContent>
              </Card>
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] text-amber-600 uppercase font-semibold">Pendente</p>
                  <p className="text-lg font-bold text-amber-700">{formatCurrency(result.totais.totalPendente)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabela */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2.5 text-xs text-slate-500 font-medium">Descrição</th>
                    <th className="text-left px-3 py-2.5 text-xs text-slate-500 font-medium">Projeto</th>
                    <th className="text-center px-3 py-2.5 text-xs text-slate-500 font-medium">Vencimento</th>
                    <th className="text-center px-3 py-2.5 text-xs text-slate-500 font-medium">Pgto</th>
                    <th className="text-center px-3 py-2.5 text-xs text-slate-500 font-medium">Forma</th>
                    <th className="text-right px-4 py-2.5 text-xs text-slate-500 font-medium">Valor</th>
                    <th className="text-center px-3 py-2.5 text-xs text-slate-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {result.transactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 text-xs text-slate-700">{t.description}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-500">{t.project?.name ?? "—"}</td>
                      <td className="px-3 py-2.5 text-center text-xs text-slate-500">{t.dueDate ? formatDate(t.dueDate) : "—"}</td>
                      <td className="px-3 py-2.5 text-center text-xs text-slate-500">{t.paidDate ? formatDate(t.paidDate) : "—"}</td>
                      <td className="px-3 py-2.5 text-center text-xs text-slate-400">{t.paymentMethod ?? "—"}</td>
                      <td className="px-4 py-2.5 text-right text-xs font-bold text-slate-700">{formatCurrency(t.amount)}</td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge className={`text-[10px] ${t.status === "pago" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                          {t.status === "pago" ? "Pago" : "Pendente"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {result.transactions.length === 0 && (
                    <tr><td colSpan={7} className="py-8 text-center text-xs text-slate-400">Nenhum lançamento no período</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
