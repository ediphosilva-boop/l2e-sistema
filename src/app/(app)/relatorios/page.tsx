"use client"
import { useEffect, useState } from "react"
import { FileBarChart, Printer, Building2, Wallet, Wrench, Users } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Supplier { id: string; name: string; cnpj?: string; phone?: string; email?: string; pixKey?: string }
interface Client { id: string; name: string; phone?: string; email?: string }
interface Project { id: string; name: string; status: string; totalValue: number; clientId?: string; client?: { name: string } }
interface Transaction {
  id: string; type: string; category?: string; description: string
  amount: number; status: string; dueDate?: string; paidDate?: string
  paymentMethod?: string; project?: { name: string }; supplier?: { name: string }; client?: { name: string }
}

export default function RelatoriosPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Filtros extrato fornecedor
  const [supplierId, setSupplierId] = useState("")
  const [supplierFrom, setSupplierFrom] = useState("")
  const [supplierTo, setSupplierTo] = useState("")
  const [supplierResult, setSupplierResult] = useState<{ supplier: Supplier; transactions: Transaction[]; totais: { totalPago: number; totalPendente: number; totalGeral: number } } | null>(null)

  // Filtros fluxo de caixa
  const [caixaFrom, setCaixaFrom] = useState("")
  const [caixaTo, setCaixaTo] = useState("")

  // Filtros projeto
  const [projetoId, setProjetoId] = useState("")

  const [loading, setLoading] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/suppliers").then(r => r.json()).then(setSuppliers),
      fetch("/api/clients").then(r => r.json()).then(setClients),
      fetch("/api/projects").then(r => r.json()).then(setProjects),
      fetch("/api/transactions").then(r => r.json()).then(setTransactions),
    ])
  }, [])

  // --- Extrato fornecedor ---
  const generateSupplier = async () => {
    if (!supplierId) return
    setLoading("supplier")
    const params = new URLSearchParams({ supplierId })
    if (supplierFrom) params.set("from", supplierFrom)
    if (supplierTo) params.set("to", supplierTo)
    const data = await fetch(`/api/extrato-fornecedor?${params}`).then(r => r.json())
    setSupplierResult(data)
    setLoading("")
  }

  const printSupplier = () => {
    if (!supplierResult) return
    const { supplier: s, transactions: trans, totais } = supplierResult
    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    const fmtD = (d?: string | null) => d ? new Date(d).toLocaleDateString("pt-BR") : "—"
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Extrato — ${s.name}</title>
      <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;color:#1e293b;font-size:12px;padding:24px;max-width:860px;margin:0 auto}
      .header{display:flex;align-items:center;justify-content:space-between;padding-bottom:10px;border-bottom:3px solid #f59e0b;margin-bottom:14px}
      h1{font-size:16px;margin-bottom:4px}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px}
      .info-box{border:1px solid #e2e8f0;border-radius:6px;padding:6px 8px}.info-box .lbl{font-size:9px;color:#94a3b8;text-transform:uppercase;font-weight:600}.info-box .val{font-size:11px;margin-top:1px}
      .totals{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px}.total-card{border:1px solid #e2e8f0;border-radius:6px;padding:8px;text-align:center}
      table{width:100%;border-collapse:collapse;font-size:11px}th{background:#f8fafc;padding:4px 6px;text-align:left;font-size:10px;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0}
      td{padding:4px 6px;border-bottom:1px solid #f1f5f9}.paid{color:#16a34a;font-weight:600}.pending{color:#d97706;font-weight:600}
      .footer{margin-top:16px;border-top:1px solid #e5e7eb;padding-top:6px;text-align:center;font-size:9px;color:#94a3b8}@media print{body{padding:12px}@page{margin:10mm}}</style>
    </head><body>
      <div class="header"><div style="display:flex;align-items:center;gap:10px"><img src="${window.location.origin}/logo-l2e.png" style="height:32px" alt="L2E"/><div><div style="font-size:13px;font-weight:800">L2E Prime Solutions</div><div style="font-size:10px;color:#64748b">Extrato do Fornecedor</div></div></div>
      <div style="text-align:right;font-size:10px;color:#64748b"><div>Emitido em ${new Date().toLocaleDateString("pt-BR")}</div>${supplierFrom || supplierTo ? `<div>Período: ${supplierFrom ? fmtD(supplierFrom) : "início"} a ${supplierTo ? fmtD(supplierTo) : "hoje"}</div>` : ""}</div></div>
      <h1>${s.name}</h1>
      <div class="info-grid">${s.cnpj ? `<div class="info-box"><div class="lbl">CNPJ</div><div class="val">${s.cnpj}</div></div>` : ""}${s.phone ? `<div class="info-box"><div class="lbl">Telefone</div><div class="val">${s.phone}</div></div>` : ""}${s.email ? `<div class="info-box"><div class="lbl">E-mail</div><div class="val">${s.email}</div></div>` : ""}${s.pixKey ? `<div class="info-box"><div class="lbl">PIX</div><div class="val">${s.pixKey}</div></div>` : ""}</div>
      <div class="totals"><div class="total-card"><div style="font-size:9px;color:#64748b">Total</div><div style="font-size:14px;font-weight:bold">${fmt(totais.totalGeral)}</div></div><div class="total-card" style="background:#f0fdf4;border-color:#bbf7d0"><div style="font-size:9px;color:#16a34a">Pago</div><div style="font-size:14px;font-weight:bold;color:#16a34a">${fmt(totais.totalPago)}</div></div><div class="total-card" style="background:#fffbeb;border-color:#fde68a"><div style="font-size:9px;color:#d97706">Pendente</div><div style="font-size:14px;font-weight:bold;color:#d97706">${fmt(totais.totalPendente)}</div></div></div>
      <table><thead><tr><th>Descrição</th><th>Projeto</th><th>Vencimento</th><th>Pgto</th><th>Forma</th><th style="text-align:right">Valor</th><th style="text-align:center">Status</th></tr></thead><tbody>
      ${trans.map(t => `<tr><td>${t.description}</td><td>${t.project?.name ?? "—"}</td><td>${fmtD(t.dueDate)}</td><td>${fmtD(t.paidDate)}</td><td>${t.paymentMethod ?? "—"}</td><td style="text-align:right;font-weight:600">${fmt(t.amount)}</td><td style="text-align:center" class="${t.status === "pago" ? "paid" : "pending"}">${t.status === "pago" ? "Pago" : "Pendente"}</td></tr>`).join("")}
      ${trans.length === 0 ? `<tr><td colspan="7" style="text-align:center;padding:12px;color:#94a3b8">Nenhum lançamento</td></tr>` : ""}</tbody></table>
      <div class="footer">L2E Prime Solutions · ${new Date().toLocaleString("pt-BR")}</div></body></html>`
    const w = window.open("", "_blank")
    if (w) { w.document.write(html); w.document.close(); w.onload = () => { w.focus(); w.print() } }
  }

  // --- Fluxo de Caixa ---
  const caixaFiltered = transactions.filter(t => {
    if (!caixaFrom && !caixaTo) return true
    const d = t.dueDate ?? t.paidDate
    if (!d) return false
    const date = new Date(d)
    if (caixaFrom && date < new Date(caixaFrom)) return false
    if (caixaTo && date > new Date(caixaTo + "T23:59:59")) return false
    return true
  })
  const caixaEntradas = caixaFiltered.filter(t => t.type === "entrada")
  const caixaSaidas = caixaFiltered.filter(t => t.type === "saida")
  const caixaTotalEntradas = caixaEntradas.reduce((s, t) => s + t.amount, 0)
  const caixaTotalSaidas = caixaSaidas.reduce((s, t) => s + t.amount, 0)
  const caixaPagoEntradas = caixaEntradas.filter(t => t.status === "pago").reduce((s, t) => s + t.amount, 0)
  const caixaPagoSaidas = caixaSaidas.filter(t => t.status === "pago").reduce((s, t) => s + t.amount, 0)

  const printCaixa = () => {
    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    const fmtD = (d?: string | null) => d ? new Date(d).toLocaleDateString("pt-BR") : "—"
    const rows = [...caixaFiltered].sort((a, b) => new Date(a.dueDate ?? a.paidDate ?? 0).getTime() - new Date(b.dueDate ?? b.paidDate ?? 0).getTime())
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Fluxo de Caixa</title>
      <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;color:#1e293b;font-size:12px;padding:24px;max-width:860px;margin:0 auto}
      .header{display:flex;align-items:center;justify-content:space-between;padding-bottom:10px;border-bottom:3px solid #f59e0b;margin-bottom:14px}
      .totals{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px}.total-card{border:1px solid #e2e8f0;border-radius:6px;padding:8px;text-align:center}
      table{width:100%;border-collapse:collapse;font-size:11px}th{background:#f8fafc;padding:4px 6px;text-align:left;font-size:10px;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0}
      td{padding:4px 6px;border-bottom:1px solid #f1f5f9}.in{color:#16a34a}.out{color:#dc2626}
      .footer{margin-top:16px;border-top:1px solid #e5e7eb;padding-top:6px;text-align:center;font-size:9px;color:#94a3b8}@media print{body{padding:12px}@page{margin:10mm}}</style>
    </head><body>
      <div class="header"><div style="display:flex;align-items:center;gap:10px"><img src="${window.location.origin}/logo-l2e.png" style="height:32px" alt="L2E"/><div><div style="font-size:13px;font-weight:800">L2E Prime Solutions</div><div style="font-size:10px;color:#64748b">Fluxo de Caixa</div></div></div>
      <div style="text-align:right;font-size:10px;color:#64748b"><div>Emitido em ${new Date().toLocaleDateString("pt-BR")}</div>${caixaFrom || caixaTo ? `<div>Período: ${caixaFrom ? fmtD(caixaFrom) : "início"} a ${caixaTo ? fmtD(caixaTo) : "hoje"}</div>` : ""}</div></div>
      <div class="totals"><div class="total-card" style="background:#f0fdf4;border-color:#bbf7d0"><div style="font-size:9px;color:#16a34a">Entradas</div><div style="font-size:14px;font-weight:bold;color:#16a34a">${fmt(caixaTotalEntradas)}</div><div style="font-size:9px;color:#64748b">Recebido: ${fmt(caixaPagoEntradas)}</div></div><div class="total-card" style="background:#fef2f2;border-color:#fca5a5"><div style="font-size:9px;color:#dc2626">Saídas</div><div style="font-size:14px;font-weight:bold;color:#dc2626">${fmt(caixaTotalSaidas)}</div><div style="font-size:9px;color:#64748b">Pago: ${fmt(caixaPagoSaidas)}</div></div><div class="total-card"><div style="font-size:9px;color:#64748b">Resultado</div><div style="font-size:14px;font-weight:bold;color:${caixaTotalEntradas - caixaTotalSaidas >= 0 ? "#16a34a" : "#dc2626"}">${fmt(caixaTotalEntradas - caixaTotalSaidas)}</div></div></div>
      <table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Fornecedor/Cliente</th><th style="text-align:right">Entrada</th><th style="text-align:right">Saída</th><th style="text-align:center">Status</th></tr></thead><tbody>
      ${rows.map(t => `<tr><td>${fmtD(t.dueDate ?? t.paidDate)}</td><td>${t.description}</td><td>${t.category ?? "—"}</td><td>${t.supplier?.name ?? t.client?.name ?? "—"}</td><td style="text-align:right" class="in">${t.type === "entrada" ? fmt(t.amount) : ""}</td><td style="text-align:right" class="out">${t.type === "saida" ? fmt(t.amount) : ""}</td><td style="text-align:center;font-size:10px;font-weight:600;color:${t.status === "pago" ? "#16a34a" : "#d97706"}">${t.status === "pago" ? "Pago" : "Pendente"}</td></tr>`).join("")}
      </tbody></table>
      <div class="footer">L2E Prime Solutions · ${new Date().toLocaleString("pt-BR")}</div></body></html>`
    const w = window.open("", "_blank")
    if (w) { w.document.write(html); w.document.close(); w.onload = () => { w.focus(); w.print() } }
  }

  // --- Resumo por Projeto ---
  const selectedProject = projects.find(p => p.id === projetoId)
  const projTransactions = projetoId ? transactions.filter(t => t.project?.name === selectedProject?.name) : []
  const projEntradas = projTransactions.filter(t => t.type === "entrada").reduce((s, t) => s + t.amount, 0)
  const projSaidas = projTransactions.filter(t => t.type === "saida").reduce((s, t) => s + t.amount, 0)
  const projPago = projTransactions.filter(t => t.status === "pago" && t.type === "saida").reduce((s, t) => s + t.amount, 0)
  const projRecebido = projTransactions.filter(t => t.status === "pago" && t.type === "entrada").reduce((s, t) => s + t.amount, 0)

  const printProjeto = () => {
    if (!selectedProject) return
    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    const fmtD = (d?: string | null) => d ? new Date(d).toLocaleDateString("pt-BR") : "—"
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Resumo — ${selectedProject.name}</title>
      <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;color:#1e293b;font-size:12px;padding:24px;max-width:860px;margin:0 auto}
      .header{display:flex;align-items:center;justify-content:space-between;padding-bottom:10px;border-bottom:3px solid #f59e0b;margin-bottom:14px}
      h1{font-size:16px;margin-bottom:8px}.totals{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;margin-bottom:12px}.total-card{border:1px solid #e2e8f0;border-radius:6px;padding:8px;text-align:center}
      table{width:100%;border-collapse:collapse;font-size:11px}th{background:#f8fafc;padding:4px 6px;text-align:left;font-size:10px;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0}
      td{padding:4px 6px;border-bottom:1px solid #f1f5f9}
      .footer{margin-top:16px;border-top:1px solid #e5e7eb;padding-top:6px;text-align:center;font-size:9px;color:#94a3b8}@media print{body{padding:12px}@page{margin:10mm}}</style>
    </head><body>
      <div class="header"><div style="display:flex;align-items:center;gap:10px"><img src="${window.location.origin}/logo-l2e.png" style="height:32px" alt="L2E"/><div><div style="font-size:13px;font-weight:800">L2E Prime Solutions</div><div style="font-size:10px;color:#64748b">Resumo Financeiro do Projeto</div></div></div>
      <div style="text-align:right;font-size:10px;color:#64748b">Emitido em ${new Date().toLocaleDateString("pt-BR")}</div></div>
      <h1>${selectedProject.name}</h1>
      ${selectedProject.client ? `<p style="font-size:11px;color:#64748b;margin-bottom:8px">Cliente: ${selectedProject.client.name}</p>` : ""}
      <div class="totals"><div class="total-card"><div style="font-size:9px;color:#64748b">Valor Contrato</div><div style="font-size:14px;font-weight:bold">${fmt(selectedProject.totalValue)}</div></div><div class="total-card" style="background:#f0fdf4;border-color:#bbf7d0"><div style="font-size:9px;color:#16a34a">Recebido</div><div style="font-size:14px;font-weight:bold;color:#16a34a">${fmt(projRecebido)}</div></div><div class="total-card" style="background:#fef2f2;border-color:#fca5a5"><div style="font-size:9px;color:#dc2626">Custos</div><div style="font-size:14px;font-weight:bold;color:#dc2626">${fmt(projSaidas)}</div></div><div class="total-card"><div style="font-size:9px;color:#64748b">Margem</div><div style="font-size:14px;font-weight:bold;color:${projRecebido - projPago >= 0 ? "#16a34a" : "#dc2626"}">${fmt(projRecebido - projPago)}</div></div></div>
      <table><thead><tr><th>Tipo</th><th>Descrição</th><th>Categoria</th><th>Vencimento</th><th style="text-align:right">Valor</th><th style="text-align:center">Status</th></tr></thead><tbody>
      ${projTransactions.map(t => `<tr><td style="color:${t.type === "entrada" ? "#16a34a" : "#dc2626"};font-weight:600">${t.type === "entrada" ? "Entrada" : "Saída"}</td><td>${t.description}</td><td>${t.category ?? "—"}</td><td>${fmtD(t.dueDate)}</td><td style="text-align:right;font-weight:600">${fmt(t.amount)}</td><td style="text-align:center;font-size:10px;font-weight:600;color:${t.status === "pago" ? "#16a34a" : "#d97706"}">${t.status === "pago" ? "Pago" : "Pendente"}</td></tr>`).join("")}
      </tbody></table>
      <div class="footer">L2E Prime Solutions · ${new Date().toLocaleString("pt-BR")}</div></body></html>`
    const w = window.open("", "_blank")
    if (w) { w.document.write(html); w.document.close(); w.onload = () => { w.focus(); w.print() } }
  }

  // --- Resumo MO ---
  const moTransactions = transactions.filter(t => t.category === "Mão de Obra" && t.type === "saida")
  const moTotal = moTransactions.reduce((s, t) => s + t.amount, 0)
  const moPago = moTransactions.filter(t => t.status === "pago").reduce((s, t) => s + t.amount, 0)
  const moPendente = moTotal - moPago

  const printMO = () => {
    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    const fmtD = (d?: string | null) => d ? new Date(d).toLocaleDateString("pt-BR") : "—"
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório de Mão de Obra</title>
      <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;color:#1e293b;font-size:12px;padding:24px;max-width:860px;margin:0 auto}
      .header{display:flex;align-items:center;justify-content:space-between;padding-bottom:10px;border-bottom:3px solid #f59e0b;margin-bottom:14px}
      .totals{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px}.total-card{border:1px solid #e2e8f0;border-radius:6px;padding:8px;text-align:center}
      table{width:100%;border-collapse:collapse;font-size:11px}th{background:#f8fafc;padding:4px 6px;text-align:left;font-size:10px;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0}
      td{padding:4px 6px;border-bottom:1px solid #f1f5f9}
      .footer{margin-top:16px;border-top:1px solid #e5e7eb;padding-top:6px;text-align:center;font-size:9px;color:#94a3b8}@media print{body{padding:12px}@page{margin:10mm}}</style>
    </head><body>
      <div class="header"><div style="display:flex;align-items:center;gap:10px"><img src="${window.location.origin}/logo-l2e.png" style="height:32px" alt="L2E"/><div><div style="font-size:13px;font-weight:800">L2E Prime Solutions</div><div style="font-size:10px;color:#64748b">Relatório de Mão de Obra</div></div></div>
      <div style="text-align:right;font-size:10px;color:#64748b">Emitido em ${new Date().toLocaleDateString("pt-BR")}</div></div>
      <div class="totals"><div class="total-card"><div style="font-size:9px;color:#64748b">Total MO</div><div style="font-size:14px;font-weight:bold">${fmt(moTotal)}</div></div><div class="total-card" style="background:#f0fdf4;border-color:#bbf7d0"><div style="font-size:9px;color:#16a34a">Pago</div><div style="font-size:14px;font-weight:bold;color:#16a34a">${fmt(moPago)}</div></div><div class="total-card" style="background:#fffbeb;border-color:#fde68a"><div style="font-size:9px;color:#d97706">Pendente</div><div style="font-size:14px;font-weight:bold;color:#d97706">${fmt(moPendente)}</div></div></div>
      <table><thead><tr><th>Descrição</th><th>Projeto</th><th>Prestador</th><th>Vencimento</th><th>Pgto</th><th style="text-align:right">Valor</th><th style="text-align:center">Status</th></tr></thead><tbody>
      ${moTransactions.map(t => `<tr><td>${t.description}</td><td>${t.project?.name ?? "—"}</td><td>${t.supplier?.name ?? "—"}</td><td>${fmtD(t.dueDate)}</td><td>${fmtD(t.paidDate)}</td><td style="text-align:right;font-weight:600">${fmt(t.amount)}</td><td style="text-align:center;font-size:10px;font-weight:600;color:${t.status === "pago" ? "#16a34a" : "#d97706"}">${t.status === "pago" ? "Pago" : "Pendente"}</td></tr>`).join("")}
      </tbody></table>
      <div class="footer">L2E Prime Solutions · ${new Date().toLocaleString("pt-BR")}</div></body></html>`
    const w = window.open("", "_blank")
    if (w) { w.document.write(html); w.document.close(); w.onload = () => { w.focus(); w.print() } }
  }

  // --- Resumo Clientes ---
  const clientSummary = clients.map(c => {
    const ct = transactions.filter(t => t.client?.name === c.name)
    const total = ct.filter(t => t.type === "entrada").reduce((s, t) => s + t.amount, 0)
    const pago = ct.filter(t => t.type === "entrada" && t.status === "pago").reduce((s, t) => s + t.amount, 0)
    return { ...c, total, pago, pendente: total - pago }
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  return (
    <>
      <Topbar title="Relatórios" subtitle="Geração de relatórios e extratos para impressão" />
      <div className="p-3 sm:p-6 space-y-4">

        <Tabs defaultValue="fornecedor">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="fornecedor" className="text-xs"><FileBarChart className="h-3.5 w-3.5 mr-1" />Extrato Fornecedor</TabsTrigger>
            <TabsTrigger value="caixa" className="text-xs"><Wallet className="h-3.5 w-3.5 mr-1" />Fluxo de Caixa</TabsTrigger>
            <TabsTrigger value="projeto" className="text-xs"><Building2 className="h-3.5 w-3.5 mr-1" />Por Projeto</TabsTrigger>
            <TabsTrigger value="mo" className="text-xs"><Wrench className="h-3.5 w-3.5 mr-1" />Mão de Obra</TabsTrigger>
            <TabsTrigger value="clientes" className="text-xs"><Users className="h-3.5 w-3.5 mr-1" />Clientes</TabsTrigger>
          </TabsList>

          {/* ====== EXTRATO FORNECEDOR ====== */}
          <TabsContent value="fornecedor" className="space-y-4 mt-4">
            <Card><CardContent className="p-4">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="min-w-[180px]">
                  <Label className="text-xs">Fornecedor</Label>
                  <select value={supplierId} onChange={e => { setSupplierId(e.target.value); setSupplierResult(null) }}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none">
                    <option value="">Selecione...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div><Label className="text-xs">De</Label><Input type="date" value={supplierFrom} onChange={e => setSupplierFrom(e.target.value)} className="mt-1 h-9" /></div>
                <div><Label className="text-xs">Até</Label><Input type="date" value={supplierTo} onChange={e => setSupplierTo(e.target.value)} className="mt-1 h-9" /></div>
                <Button onClick={generateSupplier} disabled={!supplierId || loading === "supplier"}>{loading === "supplier" ? "Carregando..." : "Gerar"}</Button>
                {supplierResult && <Button variant="outline" onClick={printSupplier}><Printer className="h-4 w-4" />Imprimir</Button>}
              </div>
            </CardContent></Card>
            {supplierResult && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <Card><CardContent className="p-3 text-center"><p className="text-[10px] text-slate-400 uppercase font-semibold">Total</p><p className="text-base font-bold">{formatCurrency(supplierResult.totais.totalGeral)}</p></CardContent></Card>
                  <Card className="bg-emerald-50 border-emerald-200"><CardContent className="p-3 text-center"><p className="text-[10px] text-emerald-600 uppercase font-semibold">Pago</p><p className="text-base font-bold text-emerald-700">{formatCurrency(supplierResult.totais.totalPago)}</p></CardContent></Card>
                  <Card className="bg-amber-50 border-amber-200"><CardContent className="p-3 text-center"><p className="text-[10px] text-amber-600 uppercase font-semibold">Pendente</p><p className="text-base font-bold text-amber-700">{formatCurrency(supplierResult.totais.totalPendente)}</p></CardContent></Card>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead><tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium">Descrição</th>
                      <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium">Projeto</th>
                      <th className="text-center px-2 py-2 text-xs text-slate-500 font-medium">Vencim.</th>
                      <th className="text-center px-2 py-2 text-xs text-slate-500 font-medium">Pgto</th>
                      <th className="text-right px-3 py-2 text-xs text-slate-500 font-medium">Valor</th>
                      <th className="text-center px-2 py-2 text-xs text-slate-500 font-medium">Status</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {supplierResult.transactions.map(t => (
                        <tr key={t.id}><td className="px-3 py-2 text-xs">{t.description}</td><td className="px-3 py-2 text-xs text-slate-500">{t.project?.name ?? "—"}</td><td className="px-2 py-2 text-center text-xs text-slate-500">{t.dueDate ? formatDate(t.dueDate) : "—"}</td><td className="px-2 py-2 text-center text-xs text-slate-500">{t.paidDate ? formatDate(t.paidDate) : "—"}</td><td className="px-3 py-2 text-right text-xs font-bold">{formatCurrency(t.amount)}</td><td className="px-2 py-2 text-center"><Badge className={`text-[10px] ${t.status === "pago" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{t.status === "pago" ? "Pago" : "Pendente"}</Badge></td></tr>
                      ))}
                      {supplierResult.transactions.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-xs text-slate-400">Nenhum lançamento</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ====== FLUXO DE CAIXA ====== */}
          <TabsContent value="caixa" className="space-y-4 mt-4">
            <Card><CardContent className="p-4">
              <div className="flex flex-wrap gap-3 items-end">
                <div><Label className="text-xs">De</Label><Input type="date" value={caixaFrom} onChange={e => setCaixaFrom(e.target.value)} className="mt-1 h-9" /></div>
                <div><Label className="text-xs">Até</Label><Input type="date" value={caixaTo} onChange={e => setCaixaTo(e.target.value)} className="mt-1 h-9" /></div>
                <Button variant="outline" onClick={printCaixa} disabled={caixaFiltered.length === 0}><Printer className="h-4 w-4" />Imprimir</Button>
              </div>
            </CardContent></Card>
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-emerald-50 border-emerald-200"><CardContent className="p-3 text-center"><p className="text-[10px] text-emerald-600 uppercase font-semibold">Entradas</p><p className="text-base font-bold text-emerald-700">{formatCurrency(caixaTotalEntradas)}</p><p className="text-[10px] text-slate-400">Recebido: {formatCurrency(caixaPagoEntradas)}</p></CardContent></Card>
              <Card className="bg-red-50 border-red-200"><CardContent className="p-3 text-center"><p className="text-[10px] text-red-600 uppercase font-semibold">Saídas</p><p className="text-base font-bold text-red-700">{formatCurrency(caixaTotalSaidas)}</p><p className="text-[10px] text-slate-400">Pago: {formatCurrency(caixaPagoSaidas)}</p></CardContent></Card>
              <Card><CardContent className="p-3 text-center"><p className="text-[10px] text-slate-400 uppercase font-semibold">Resultado</p><p className={`text-base font-bold ${caixaTotalEntradas - caixaTotalSaidas >= 0 ? "text-emerald-700" : "text-red-700"}`}>{formatCurrency(caixaTotalEntradas - caixaTotalSaidas)}</p></CardContent></Card>
            </div>
            <p className="text-xs text-slate-400">{caixaFiltered.length} lançamentos no período</p>
          </TabsContent>

          {/* ====== POR PROJETO ====== */}
          <TabsContent value="projeto" className="space-y-4 mt-4">
            <Card><CardContent className="p-4">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="min-w-[200px]">
                  <Label className="text-xs">Projeto</Label>
                  <select value={projetoId} onChange={e => setProjetoId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none">
                    <option value="">Selecione...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                {projetoId && <Button variant="outline" onClick={printProjeto}><Printer className="h-4 w-4" />Imprimir</Button>}
              </div>
            </CardContent></Card>
            {projetoId && selectedProject && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card><CardContent className="p-3 text-center"><p className="text-[10px] text-slate-400 uppercase font-semibold">Contrato</p><p className="text-base font-bold truncate">{formatCurrency(selectedProject.totalValue)}</p></CardContent></Card>
                  <Card className="bg-emerald-50 border-emerald-200"><CardContent className="p-3 text-center"><p className="text-[10px] text-emerald-600 uppercase font-semibold">Recebido</p><p className="text-base font-bold text-emerald-700 truncate">{formatCurrency(projRecebido)}</p></CardContent></Card>
                  <Card className="bg-red-50 border-red-200"><CardContent className="p-3 text-center"><p className="text-[10px] text-red-600 uppercase font-semibold">Custos</p><p className="text-base font-bold text-red-700 truncate">{formatCurrency(projSaidas)}</p></CardContent></Card>
                  <Card><CardContent className="p-3 text-center"><p className="text-[10px] text-slate-400 uppercase font-semibold">Margem</p><p className={`text-base font-bold truncate ${projRecebido - projPago >= 0 ? "text-emerald-700" : "text-red-700"}`}>{formatCurrency(projRecebido - projPago)}</p></CardContent></Card>
                </div>
                <p className="text-xs text-slate-400">{projTransactions.length} lançamentos vinculados</p>
              </div>
            )}
          </TabsContent>

          {/* ====== MÃO DE OBRA ====== */}
          <TabsContent value="mo" className="space-y-4 mt-4">
            <div className="flex justify-end"><Button variant="outline" onClick={printMO} disabled={moTransactions.length === 0}><Printer className="h-4 w-4" />Imprimir</Button></div>
            <div className="grid grid-cols-3 gap-3">
              <Card><CardContent className="p-3 text-center"><p className="text-[10px] text-slate-400 uppercase font-semibold">Total MO</p><p className="text-base font-bold">{formatCurrency(moTotal)}</p></CardContent></Card>
              <Card className="bg-emerald-50 border-emerald-200"><CardContent className="p-3 text-center"><p className="text-[10px] text-emerald-600 uppercase font-semibold">Pago</p><p className="text-base font-bold text-emerald-700">{formatCurrency(moPago)}</p></CardContent></Card>
              <Card className="bg-amber-50 border-amber-200"><CardContent className="p-3 text-center"><p className="text-[10px] text-amber-600 uppercase font-semibold">Pendente</p><p className="text-base font-bold text-amber-700">{formatCurrency(moPendente)}</p></CardContent></Card>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
              <table className="w-full text-sm min-w-[550px]">
                <thead><tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium">Serviço</th>
                  <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium">Projeto</th>
                  <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium">Prestador</th>
                  <th className="text-right px-3 py-2 text-xs text-slate-500 font-medium">Valor</th>
                  <th className="text-center px-2 py-2 text-xs text-slate-500 font-medium">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {moTransactions.map(t => (
                    <tr key={t.id}><td className="px-3 py-2 text-xs">{t.description}</td><td className="px-3 py-2 text-xs text-slate-500">{t.project?.name ?? "—"}</td><td className="px-3 py-2 text-xs text-slate-500">{t.supplier?.name ?? "—"}</td><td className="px-3 py-2 text-right text-xs font-bold">{formatCurrency(t.amount)}</td><td className="px-2 py-2 text-center"><Badge className={`text-[10px] ${t.status === "pago" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{t.status === "pago" ? "Pago" : "Pendente"}</Badge></td></tr>
                  ))}
                  {moTransactions.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-xs text-slate-400">Nenhum serviço de MO registrado</td></tr>}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* ====== CLIENTES ====== */}
          <TabsContent value="clientes" className="space-y-4 mt-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead><tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-2.5 text-xs text-slate-500 font-medium">Cliente</th>
                  <th className="text-right px-3 py-2.5 text-xs text-slate-500 font-medium">Total Contratado</th>
                  <th className="text-right px-3 py-2.5 text-xs text-slate-500 font-medium">Recebido</th>
                  <th className="text-right px-3 py-2.5 text-xs text-slate-500 font-medium">Pendente</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {clientSummary.map(c => (
                    <tr key={c.id}><td className="px-4 py-2.5 text-xs font-medium text-slate-700">{c.name}</td><td className="px-3 py-2.5 text-right text-xs font-bold">{formatCurrency(c.total)}</td><td className="px-3 py-2.5 text-right text-xs font-bold text-emerald-600">{formatCurrency(c.pago)}</td><td className="px-3 py-2.5 text-right text-xs font-bold text-amber-600">{formatCurrency(c.pendente)}</td></tr>
                  ))}
                  {clientSummary.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-xs text-slate-400">Nenhum recebimento registrado</td></tr>}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
