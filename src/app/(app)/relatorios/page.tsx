"use client"
import { useEffect, useState } from "react"
import { FileBarChart, Printer, Building2, Wallet, Wrench, Users, CreditCard, Download, BookOpen, SlidersHorizontal } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formatCurrency, formatDate } from "@/lib/utils"
import { SOCIOS } from "@/lib/constants"

interface Supplier { id: string; name: string; cnpj?: string; phone?: string; email?: string; pixKey?: string; category?: string }
interface Client { id: string; name: string; phone?: string; email?: string }
interface Project {
  id: string; name: string; status: string; totalValue: number; clientId?: string; client?: { name: string }
  projectType?: string; startDate?: string; deliveryDate?: string; unitCount?: number; address?: string; notes?: string
}
interface Transaction {
  id: string; type: string; category?: string; description: string
  amount: number; status: string; dueDate?: string; paidDate?: string
  paymentMethod?: string; recipient?: string; invoiceNumber?: string; notes?: string
  project?: { name: string }; supplier?: { name: string }; client?: { name: string }
}

// UTC-aware date formatter for all print functions
function fmtD(d?: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" })
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function downloadCSV(rows: (string | number | null | undefined)[][], filename: string) {
  const bom = "﻿"
  const csv = rows.map(r =>
    r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")
  ).join("\r\n")
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function inMonth(dateStr: string | null | undefined, mes: string): boolean {
  if (!dateStr || !mes) return false
  return dateStr.slice(0, 7) === mes
}

function upToEndOfMonth(dateStr: string | null | undefined, mes: string): boolean {
  if (!dateStr || !mes) return false
  const [y, m] = mes.split("-").map(Number)
  const endOfMonth = new Date(Date.UTC(y, m, 0)) // last day of month
  const d = new Date(dateStr)
  return d <= endOfMonth
}

const DYN_COLS: Record<string, Array<{ key: string; label: string; right?: boolean }>> = {
  transactions: [
    { key: "dueDate",       label: "Vencimento" },
    { key: "paidDate",      label: "Data Pgto" },
    { key: "description",   label: "Descrição" },
    { key: "type",          label: "Tipo" },
    { key: "category",      label: "Categoria" },
    { key: "project",       label: "Projeto" },
    { key: "supplier",      label: "Fornecedor" },
    { key: "client",        label: "Cliente" },
    { key: "recipient",     label: "Pagar Para" },
    { key: "status",        label: "Status" },
    { key: "amount",        label: "Valor",        right: true },
    { key: "invoiceNumber", label: "Nº NF" },
    { key: "paymentMethod", label: "Forma Pgto" },
    { key: "notes",         label: "Observações" },
  ],
  projects: [
    { key: "name",         label: "Nome" },
    { key: "projectType",  label: "Tipo" },
    { key: "status",       label: "Status" },
    { key: "client",       label: "Cliente" },
    { key: "totalValue",   label: "Valor Contrato", right: true },
    { key: "startDate",    label: "Início" },
    { key: "deliveryDate", label: "Entrega" },
    { key: "unitCount",    label: "Unidades" },
    { key: "address",      label: "Endereço" },
    { key: "notes",        label: "Observações" },
  ],
  clients: [
    { key: "name",  label: "Nome" },
    { key: "phone", label: "Telefone" },
    { key: "email", label: "E-mail" },
  ],
  suppliers: [
    { key: "name",     label: "Nome" },
    { key: "cnpj",     label: "CNPJ" },
    { key: "category", label: "Categoria" },
    { key: "phone",    label: "Telefone" },
    { key: "email",    label: "E-mail" },
    { key: "pixKey",   label: "PIX" },
  ],
}

const PROJ_TYPES: Record<string, string> = {
  apartamentos: "🏢 Apartamentos",
  casas:        "🏠 Casas",
  reformas:     "🔨 Reformas",
}
const PROJ_STATUS_LABELS: Record<string, string> = {
  orcamento: "Orçamento", contrato: "Contrato",
  execucao: "Execução", entregue: "Entregue", cancelado: "Cancelado",
}

function dynGetValue(row: Record<string, unknown>, key: string, source: string): string {
  if (source === "transactions") {
    const t = row as unknown as Transaction
    if (key === "dueDate")       return t.dueDate  ? new Date(t.dueDate).toLocaleDateString("pt-BR",  { timeZone: "UTC" }) : "—"
    if (key === "paidDate")      return t.paidDate ? new Date(t.paidDate).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—"
    if (key === "type")          return t.type === "entrada" ? "Entrada" : "Saída"
    if (key === "category")      return t.category ?? "—"
    if (key === "project")       return t.project?.name ?? "—"
    if (key === "supplier")      return t.supplier?.name ?? "—"
    if (key === "client")        return t.client?.name ?? "—"
    if (key === "recipient")     return t.recipient ?? "—"
    if (key === "status")        return t.status === "pago" ? "Pago" : t.status === "pendente" ? "Pendente" : t.status
    if (key === "amount")        return t.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    if (key === "invoiceNumber") return t.invoiceNumber ?? "—"
    if (key === "paymentMethod") return t.paymentMethod ?? "—"
    if (key === "notes")         return t.notes ?? "—"
    return String(t[key as keyof Transaction] ?? "—")
  }
  if (source === "projects") {
    const p = row as unknown as Project
    if (key === "client")       return p.client?.name ?? "—"
    if (key === "totalValue")   return p.totalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    if (key === "startDate")    return p.startDate    ? new Date(p.startDate).toLocaleDateString("pt-BR",    { timeZone: "UTC" }) : "—"
    if (key === "deliveryDate") return p.deliveryDate ? new Date(p.deliveryDate).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—"
    if (key === "projectType")  return PROJ_TYPES[p.projectType ?? "apartamentos"] ?? p.projectType ?? "—"
    if (key === "status")       return PROJ_STATUS_LABELS[p.status] ?? p.status
    if (key === "unitCount")    return String(p.unitCount ?? 1)
    return String(p[key as keyof Project] ?? "—")
  }
  return String((row as Record<string, unknown>)[key] ?? "—")
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

  // Contabilidade
  const hoje = new Date()
  const defaultMes = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`
  const [mesContab, setMesContab] = useState(defaultMes)

  const [loading, setLoading] = useState("")

  // Relatório Livre
  const [dynSource, setDynSource] = useState<"transactions"|"projects"|"clients"|"suppliers"|"">("")
  const [dynCols, setDynCols] = useState<string[]>([])
  const [dynFType, setDynFType] = useState("")
  const [dynFStatus, setDynFStatus] = useState("")
  const [dynFCat, setDynFCat] = useState("")
  const [dynFProject, setDynFProject] = useState("")
  const [dynFFrom, setDynFFrom] = useState("")
  const [dynFTo, setDynFTo] = useState("")
  const [dynFProjStatus, setDynFProjStatus] = useState("")
  const [dynFProjType, setDynFProjType] = useState("")

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
      <div class="totals"><div class="total-card"><div style="font-size:9px;color:#64748b">Valor Contrato</div><div style="font-size:14px;font-weight:bold">${fmt(selectedProject.totalValue)}</div></div><div class="total-card" style="background:#f0fdf4;border-color:#bbf7d0"><div style="font-size:9px;color:#16a34a">Recebido</div><div style="font-size:14px;font-weight:bold;color:#16a34a">${fmt(projRecebido)}</div></div><div class="total-card" style="background:#fef2f2;border-color:#fca5a5"><div style="font-size:9px;color:#dc2626">Custos</div><div style="font-size:14px;font-weight:bold;color:#dc2626">${fmt(projSaidas)}</div></div><div class="total-card"><div style="font-size:9px;color:#64748b">Margem</div><div style="font-size:14px;font-weight:bold;color:${projRecebido - projSaidas >= 0 ? "#16a34a" : "#dc2626"}">${fmt(projRecebido - projSaidas)}</div></div></div>
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

  // --- Reembolsos ---
  const [reembolsoSocio, setReembolsoSocio] = useState("")
  const reembolsoTrans = transactions.filter(t =>
    t.type === "saida" && (SOCIOS as readonly string[]).includes(t.recipient ?? "")
    && (!reembolsoSocio || t.recipient === reembolsoSocio)
  )
  const reembolsoTotal = reembolsoTrans.reduce((s, t) => s + t.amount, 0)
  const reembolsoPago = reembolsoTrans.filter(t => t.status === "pago").reduce((s, t) => s + t.amount, 0)
  const reembolsoPendente = reembolsoTotal - reembolsoPago

  const reembolsoPorSocio = SOCIOS.map(name => {
    const st = transactions.filter(t => t.type === "saida" && t.recipient === name)
    return {
      name,
      total: st.reduce((s, t) => s + t.amount, 0),
      pago: st.filter(t => t.status === "pago").reduce((s, t) => s + t.amount, 0),
      pendente: st.filter(t => t.status === "pendente").reduce((s, t) => s + t.amount, 0),
    }
  }).filter(s => s.total > 0)

  const printReembolso = () => {
    const titulo = reembolsoSocio ? `Extrato de Reembolso — ${reembolsoSocio}` : "Extrato de Reembolsos — Todos os Sócios"
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${titulo}</title>
      <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;color:#1e293b;font-size:12px;padding:24px;max-width:860px;margin:0 auto}
      .header{display:flex;align-items:center;justify-content:space-between;padding-bottom:10px;border-bottom:3px solid #f59e0b;margin-bottom:14px}
      h1{font-size:16px;margin-bottom:8px}
      .totals{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px}.total-card{border:1px solid #e2e8f0;border-radius:6px;padding:8px;text-align:center}
      table{width:100%;border-collapse:collapse;font-size:11px}th{background:#f8fafc;padding:5px 8px;text-align:left;font-size:10px;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0}
      td{padding:5px 8px;border-bottom:1px solid #f1f5f9}
      .footer{margin-top:16px;border-top:1px solid #e5e7eb;padding-top:6px;text-align:center;font-size:9px;color:#94a3b8}@media print{body{padding:12px}@page{margin:10mm}}</style>
    </head><body>
      <div class="header"><div style="display:flex;align-items:center;gap:10px"><img src="${window.location.origin}/logo-l2e.png" style="height:32px" alt="L2E"/><div><div style="font-size:13px;font-weight:800">L2E Prime Solutions</div><div style="font-size:10px;color:#64748b">${titulo}</div></div></div>
      <div style="text-align:right;font-size:10px;color:#64748b">Emitido em ${new Date().toLocaleDateString("pt-BR")}</div></div>
      <div class="totals"><div class="total-card"><div style="font-size:9px;color:#64748b">Total</div><div style="font-size:14px;font-weight:bold">${fmt(reembolsoTotal)}</div></div><div class="total-card" style="background:#f0fdf4;border-color:#bbf7d0"><div style="font-size:9px;color:#16a34a">Reembolsado</div><div style="font-size:14px;font-weight:bold;color:#16a34a">${fmt(reembolsoPago)}</div></div><div class="total-card" style="background:#fffbeb;border-color:#fde68a"><div style="font-size:9px;color:#d97706">Pendente</div><div style="font-size:14px;font-weight:bold;color:#d97706">${fmt(reembolsoPendente)}</div></div></div>
      <table><thead><tr><th>Descrição</th><th>Sócio</th><th>Projeto</th><th>Vencimento</th><th>Pgto</th><th style="text-align:right">Valor</th><th style="text-align:center">Status</th></tr></thead><tbody>
      ${reembolsoTrans.map(t => `<tr><td>${t.description}</td><td>${t.recipient ?? "—"}</td><td>${t.project?.name ?? "—"}</td><td>${fmtD(t.dueDate)}</td><td>${fmtD(t.paidDate)}</td><td style="text-align:right;font-weight:600">${fmt(t.amount)}</td><td style="text-align:center;font-size:10px;font-weight:600;color:${t.status === "pago" ? "#16a34a" : "#d97706"}">${t.status === "pago" ? "Pago" : "Pendente"}</td></tr>`).join("")}
      ${reembolsoTrans.length === 0 ? `<tr><td colspan="7" style="text-align:center;padding:12px;color:#94a3b8">Nenhum reembolso</td></tr>` : ""}</tbody></table>
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

  // --- Contabilidade ---
  const mesLabel = mesContab
    ? new Date(mesContab + "-01").toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" })
    : ""

  // Contas a Pagar: saídas pagas com paidDate no mês selecionado
  const contaPagar = transactions.filter(t =>
    t.type === "saida" && t.status === "pago" && inMonth(t.paidDate, mesContab)
  ).sort((a, b) => (a.paidDate ?? "").localeCompare(b.paidDate ?? ""))

  // Contas a Receber: entradas pagas com paidDate no mês selecionado
  const contaReceber = transactions.filter(t =>
    t.type === "entrada" && t.status === "pago" && inMonth(t.paidDate, mesContab)
  ).sort((a, b) => (a.paidDate ?? "").localeCompare(b.paidDate ?? ""))

  // Duplicatas a Pagar: saídas pendentes com vencimento até o fim do mês
  const duplicatasPagar = transactions.filter(t =>
    t.type === "saida" && t.status === "pendente" && upToEndOfMonth(t.dueDate, mesContab)
  ).sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))

  // Duplicatas a Receber: entradas pendentes com vencimento até o fim do mês
  const duplicatasReceber = transactions.filter(t =>
    t.type === "entrada" && t.status === "pendente" && upToEndOfMonth(t.dueDate, mesContab)
  ).sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))

  const totalContaPagar = contaPagar.reduce((s, t) => s + t.amount, 0)
  const totalContaReceber = contaReceber.reduce((s, t) => s + t.amount, 0)
  const totalDuplicatasPagar = duplicatasPagar.reduce((s, t) => s + t.amount, 0)
  const totalDuplicatasReceber = duplicatasReceber.reduce((s, t) => s + t.amount, 0)

  const downloadContaPagar = () => {
    const header = ["Data Pgto", "Descrição", "Categoria", "Projeto", "Fornecedor", "Nº NF", "Valor (R$)"]
    const rows = contaPagar.map(t => [
      fmtD(t.paidDate), t.description, t.category ?? "", t.project?.name ?? "",
      t.supplier?.name ?? t.recipient ?? "", t.invoiceNumber ?? "",
      t.amount.toFixed(2).replace(".", ",")
    ])
    rows.push(["", "", "", "", "", "TOTAL", totalContaPagar.toFixed(2).replace(".", ",")])
    downloadCSV([header, ...rows], `contas-a-pagar-${mesContab}.csv`)
  }

  const downloadContaReceber = () => {
    const header = ["Data Receb.", "Descrição", "Categoria", "Projeto", "Cliente", "Valor (R$)"]
    const rows = contaReceber.map(t => [
      fmtD(t.paidDate), t.description, t.category ?? "", t.project?.name ?? "",
      t.client?.name ?? "", t.amount.toFixed(2).replace(".", ",")
    ])
    rows.push(["", "", "", "", "TOTAL", totalContaReceber.toFixed(2).replace(".", ",")])
    downloadCSV([header, ...rows], `contas-a-receber-${mesContab}.csv`)
  }

  const downloadDuplicatasPagar = () => {
    const header = ["Vencimento", "Descrição", "Categoria", "Projeto", "Fornecedor", "Valor (R$)"]
    const rows = duplicatasPagar.map(t => [
      fmtD(t.dueDate), t.description, t.category ?? "", t.project?.name ?? "",
      t.supplier?.name ?? t.recipient ?? "", t.amount.toFixed(2).replace(".", ",")
    ])
    rows.push(["", "", "", "", "TOTAL", totalDuplicatasPagar.toFixed(2).replace(".", ",")])
    downloadCSV([header, ...rows], `duplicatas-a-pagar-${mesContab}.csv`)
  }

  const downloadDuplicatasReceber = () => {
    const header = ["Vencimento", "Descrição", "Categoria", "Projeto", "Cliente", "Valor (R$)"]
    const rows = duplicatasReceber.map(t => [
      fmtD(t.dueDate), t.description, t.category ?? "", t.project?.name ?? "",
      t.client?.name ?? "", t.amount.toFixed(2).replace(".", ",")
    ])
    rows.push(["", "", "", "", "TOTAL", totalDuplicatasReceber.toFixed(2).replace(".", ",")])
    downloadCSV([header, ...rows], `duplicatas-a-receber-${mesContab}.csv`)
  }

  const printContabilidade = (tipo: "pagar" | "receber" | "dup-pagar" | "dup-receber") => {
    const configs = {
      pagar: { titulo: "Contas a Pagar", dados: contaPagar, total: totalContaPagar, cols: ["Data Pgto", "Descrição", "Categoria", "Projeto", "Fornecedor", "Nº NF", "Valor"], row: (t: Transaction) => [fmtD(t.paidDate), t.description, t.category ?? "—", t.project?.name ?? "—", t.supplier?.name ?? t.recipient ?? "—", t.invoiceNumber ?? "—", fmt(t.amount)] },
      receber: { titulo: "Contas a Receber", dados: contaReceber, total: totalContaReceber, cols: ["Data Receb.", "Descrição", "Categoria", "Projeto", "Cliente", "Valor"], row: (t: Transaction) => [fmtD(t.paidDate), t.description, t.category ?? "—", t.project?.name ?? "—", t.client?.name ?? "—", fmt(t.amount)] },
      "dup-pagar": { titulo: "Duplicatas a Pagar", dados: duplicatasPagar, total: totalDuplicatasPagar, cols: ["Vencimento", "Descrição", "Categoria", "Projeto", "Fornecedor", "Valor"], row: (t: Transaction) => [fmtD(t.dueDate), t.description, t.category ?? "—", t.project?.name ?? "—", t.supplier?.name ?? t.recipient ?? "—", fmt(t.amount)] },
      "dup-receber": { titulo: "Duplicatas a Receber", dados: duplicatasReceber, total: totalDuplicatasReceber, cols: ["Vencimento", "Descrição", "Categoria", "Projeto", "Cliente", "Valor"], row: (t: Transaction) => [fmtD(t.dueDate), t.description, t.category ?? "—", t.project?.name ?? "—", t.client?.name ?? "—", fmt(t.amount)] },
    }
    const { titulo, dados, total, cols, row } = configs[tipo]
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${titulo}</title>
      <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;color:#1e293b;font-size:12px;padding:24px;max-width:860px;margin:0 auto}
      .header{display:flex;align-items:center;justify-content:space-between;padding-bottom:10px;border-bottom:3px solid #f59e0b;margin-bottom:14px}
      table{width:100%;border-collapse:collapse;font-size:11px}th{background:#f8fafc;padding:5px 7px;text-align:left;font-size:10px;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0}
      td{padding:5px 7px;border-bottom:1px solid #f1f5f9}.total-row td{font-weight:bold;background:#f8fafc;border-top:2px solid #e2e8f0}
      .footer{margin-top:16px;border-top:1px solid #e5e7eb;padding-top:6px;text-align:center;font-size:9px;color:#94a3b8}@media print{body{padding:12px}@page{margin:10mm}}</style>
    </head><body>
      <div class="header"><div style="display:flex;align-items:center;gap:10px"><img src="${window.location.origin}/logo-l2e.png" style="height:32px" alt="L2E"/><div><div style="font-size:13px;font-weight:800">L2E Prime Solutions</div><div style="font-size:10px;color:#64748b">${titulo} — ${mesLabel}</div></div></div>
      <div style="text-align:right;font-size:10px;color:#64748b">Emitido em ${new Date().toLocaleDateString("pt-BR")}</div></div>
      <table><thead><tr>${cols.map(c => `<th${c === "Valor" ? ' style="text-align:right"' : ""}>${c}</th>`).join("")}</tr></thead><tbody>
      ${dados.map(t => `<tr>${row(t).map((v, i) => `<td${i === cols.length - 1 ? ' style="text-align:right;font-weight:600"' : ""}>${v}</td>`).join("")}</tr>`).join("")}
      ${dados.length === 0 ? `<tr><td colspan="${cols.length}" style="text-align:center;padding:12px;color:#94a3b8">Nenhum registro</td></tr>` : ""}
      <tr class="total-row"><td colspan="${cols.length - 1}">Total</td><td style="text-align:right">${fmt(total)}</td></tr>
      </tbody></table>
      <div class="footer">L2E Prime Solutions · ${new Date().toLocaleString("pt-BR")}</div></body></html>`
    const w = window.open("", "_blank")
    if (w) { w.document.write(html); w.document.close(); w.onload = () => { w.focus(); w.print() } }
  }

  // --- Relatório Livre ---
  const dynRows: Record<string, unknown>[] = (() => {
    if (dynSource === "transactions") return (transactions as unknown as Record<string, unknown>[]).filter(r => {
      const t = r as unknown as Transaction
      if (dynFType && t.type !== dynFType) return false
      if (dynFStatus && t.status !== dynFStatus) return false
      if (dynFCat && t.category !== dynFCat) return false
      if (dynFProject && t.project?.name !== projects.find(p => p.id === dynFProject)?.name) return false
      const d = t.dueDate ?? t.paidDate
      if (dynFFrom && d && d < dynFFrom) return false
      if (dynFTo && d && d > dynFTo) return false
      return true
    })
    if (dynSource === "projects") return (projects as unknown as Record<string, unknown>[]).filter(r => {
      const p = r as unknown as Project
      if (dynFProjStatus && p.status !== dynFProjStatus) return false
      if (dynFProjType && (p.projectType ?? "apartamentos") !== dynFProjType) return false
      return true
    })
    if (dynSource === "clients") return clients as unknown as Record<string, unknown>[]
    if (dynSource === "suppliers") return suppliers as unknown as Record<string, unknown>[]
    return []
  })()

  const dynActiveCols = dynSource ? (DYN_COLS[dynSource] ?? []).filter(c => dynCols.includes(c.key)) : []

  const toggleDynCol = (key: string) => setDynCols(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  const selectAllDynCols = () => { if (dynSource) setDynCols(DYN_COLS[dynSource].map(c => c.key)) }
  const clearDynCols = () => setDynCols([])

  const changeDynSource = (src: typeof dynSource) => {
    setDynSource(src); setDynCols([]); setDynFType(""); setDynFStatus(""); setDynFCat("")
    setDynFProject(""); setDynFFrom(""); setDynFTo(""); setDynFProjStatus(""); setDynFProjType("")
  }

  const downloadDynCSV = () => {
    if (!dynActiveCols.length) return
    const header = dynActiveCols.map(c => c.label)
    const rows = dynRows.map(row => dynActiveCols.map(c => dynGetValue(row, c.key, dynSource)))
    downloadCSV([header, ...rows], `relatorio-${dynSource}-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  const printDynReport = () => {
    if (!dynActiveCols.length) return
    const srcLabels: Record<string, string> = { transactions: "Transações", projects: "Projetos", clients: "Clientes", suppliers: "Fornecedores" }
    const title = `Relatório Livre — ${srcLabels[dynSource] ?? ""}`
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${title}</title>
      <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;color:#1e293b;font-size:12px;padding:24px;max-width:1100px;margin:0 auto}
      .header{display:flex;align-items:center;justify-content:space-between;padding-bottom:10px;border-bottom:3px solid #f59e0b;margin-bottom:14px}
      table{width:100%;border-collapse:collapse;font-size:11px}th{background:#f8fafc;padding:5px 7px;text-align:left;font-size:10px;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0}
      td{padding:5px 7px;border-bottom:1px solid #f1f5f9}
      .footer{margin-top:16px;border-top:1px solid #e5e7eb;padding-top:6px;text-align:center;font-size:9px;color:#94a3b8}@media print{body{padding:12px}@page{margin:10mm;size:landscape}}</style>
    </head><body>
      <div class="header"><div style="display:flex;align-items:center;gap:10px"><img src="${window.location.origin}/logo-l2e.png" style="height:32px" alt="L2E"/><div><div style="font-size:13px;font-weight:800">L2E Prime Solutions</div><div style="font-size:10px;color:#64748b">${title}</div></div></div>
      <div style="text-align:right;font-size:10px;color:#64748b">Emitido em ${new Date().toLocaleDateString("pt-BR")}<br/>${dynRows.length} registros</div></div>
      <table><thead><tr>${dynActiveCols.map(c => `<th${c.right ? ' style="text-align:right"' : ""}>${c.label}</th>`).join("")}</tr></thead><tbody>
      ${dynRows.map(row => `<tr>${dynActiveCols.map(c => `<td${c.right ? ' style="text-align:right;font-weight:600"' : ""}>${dynGetValue(row, c.key, dynSource)}</td>`).join("")}</tr>`).join("")}
      ${dynRows.length === 0 ? `<tr><td colspan="${dynActiveCols.length}" style="text-align:center;padding:12px;color:#94a3b8">Nenhum registro encontrado</td></tr>` : ""}
      </tbody></table>
      <div class="footer">L2E Prime Solutions · ${new Date().toLocaleString("pt-BR")}</div></body></html>`
    const w = window.open("", "_blank")
    if (w) { w.document.write(html); w.document.close(); w.onload = () => { w.focus(); w.print() } }
  }

  return (
    <>
      <Topbar title="Relatórios" subtitle="Geração de relatórios e extratos para impressão" />
      <div className="p-3 sm:p-6 space-y-4">

        <Tabs defaultValue="contabilidade">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="contabilidade" className="text-xs"><BookOpen className="h-3.5 w-3.5 mr-1" />Contabilidade</TabsTrigger>
            <TabsTrigger value="fornecedor" className="text-xs"><FileBarChart className="h-3.5 w-3.5 mr-1" />Extrato Fornecedor</TabsTrigger>
            <TabsTrigger value="caixa" className="text-xs"><Wallet className="h-3.5 w-3.5 mr-1" />Fluxo de Caixa</TabsTrigger>
            <TabsTrigger value="projeto" className="text-xs"><Building2 className="h-3.5 w-3.5 mr-1" />Por Projeto</TabsTrigger>
            <TabsTrigger value="mo" className="text-xs"><Wrench className="h-3.5 w-3.5 mr-1" />Mão de Obra</TabsTrigger>
            <TabsTrigger value="clientes" className="text-xs"><Users className="h-3.5 w-3.5 mr-1" />Clientes</TabsTrigger>
            <TabsTrigger value="reembolsos" className="text-xs"><CreditCard className="h-3.5 w-3.5 mr-1" />Reembolsos</TabsTrigger>
            <TabsTrigger value="livre" className="text-xs"><SlidersHorizontal className="h-3.5 w-3.5 mr-1" />Relatório Livre</TabsTrigger>
          </TabsList>

          {/* ====== CONTABILIDADE ====== */}
          <TabsContent value="contabilidade" className="space-y-6 mt-4">

            {/* Seletor de mês */}
            <Card><CardContent className="p-4">
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <Label className="text-xs">Mês de referência</Label>
                  <Input type="month" value={mesContab} onChange={e => setMesContab(e.target.value)} className="mt-1 h-9 w-44" />
                </div>
                {mesContab && <p className="text-sm text-slate-500 capitalize pb-1">{mesLabel}</p>}
              </div>
            </CardContent></Card>

            {/* Resumo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="bg-red-50 border-red-200"><CardContent className="p-3 text-center"><p className="text-[10px] text-red-600 uppercase font-semibold">Pago no mês</p><p className="text-sm font-bold text-red-700">{formatCurrency(totalContaPagar)}</p><p className="text-[10px] text-slate-400">{contaPagar.length} lançamentos</p></CardContent></Card>
              <Card className="bg-emerald-50 border-emerald-200"><CardContent className="p-3 text-center"><p className="text-[10px] text-emerald-600 uppercase font-semibold">Recebido no mês</p><p className="text-sm font-bold text-emerald-700">{formatCurrency(totalContaReceber)}</p><p className="text-[10px] text-slate-400">{contaReceber.length} lançamentos</p></CardContent></Card>
              <Card className="bg-amber-50 border-amber-200"><CardContent className="p-3 text-center"><p className="text-[10px] text-amber-600 uppercase font-semibold">Dup. a Pagar</p><p className="text-sm font-bold text-amber-700">{formatCurrency(totalDuplicatasPagar)}</p><p className="text-[10px] text-slate-400">{duplicatasPagar.length} pendentes</p></CardContent></Card>
              <Card className="bg-blue-50 border-blue-200"><CardContent className="p-3 text-center"><p className="text-[10px] text-blue-600 uppercase font-semibold">Dup. a Receber</p><p className="text-sm font-bold text-blue-700">{formatCurrency(totalDuplicatasReceber)}</p><p className="text-[10px] text-slate-400">{duplicatasReceber.length} pendentes</p></CardContent></Card>
            </div>

            {/* Contas a Pagar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Contas a Pagar</h3>
                  <p className="text-xs text-slate-400">Pagamentos efetuados no mês</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => printContabilidade("pagar")} disabled={contaPagar.length === 0}><Printer className="h-3.5 w-3.5 mr-1" />Imprimir</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={downloadContaPagar} disabled={contaPagar.length === 0}><Download className="h-3.5 w-3.5 mr-1" />Excel</Button>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead><tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium">Data Pgto</th>
                    <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium">Descrição</th>
                    <th className="text-left px-2 py-2 text-xs text-slate-500 font-medium">Categoria</th>
                    <th className="text-left px-2 py-2 text-xs text-slate-500 font-medium">Projeto</th>
                    <th className="text-left px-2 py-2 text-xs text-slate-500 font-medium">Fornecedor</th>
                    <th className="text-left px-2 py-2 text-xs text-slate-500 font-medium">Nº NF</th>
                    <th className="text-right px-3 py-2 text-xs text-slate-500 font-medium">Valor</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {contaPagar.map(t => (
                      <tr key={t.id}>
                        <td className="px-3 py-2 text-xs text-slate-500">{formatDate(t.paidDate)}</td>
                        <td className="px-3 py-2 text-xs">{t.description}</td>
                        <td className="px-2 py-2 text-xs text-slate-500">{t.category ?? "—"}</td>
                        <td className="px-2 py-2 text-xs text-slate-500">{t.project?.name ?? "—"}</td>
                        <td className="px-2 py-2 text-xs text-slate-500">{t.supplier?.name ?? t.recipient ?? "—"}</td>
                        <td className="px-2 py-2 text-xs text-slate-400">{t.invoiceNumber ?? "—"}</td>
                        <td className="px-3 py-2 text-right text-xs font-bold text-red-600">{formatCurrency(t.amount)}</td>
                      </tr>
                    ))}
                    {contaPagar.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-xs text-slate-400">Nenhum pagamento no mês selecionado</td></tr>}
                    {contaPagar.length > 0 && (
                      <tr className="bg-slate-50 font-semibold">
                        <td colSpan={6} className="px-3 py-2 text-xs text-right text-slate-600">Total</td>
                        <td className="px-3 py-2 text-right text-xs font-bold text-red-700">{formatCurrency(totalContaPagar)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Contas a Receber */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Contas a Receber</h3>
                  <p className="text-xs text-slate-400">Recebimentos efetuados no mês</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => printContabilidade("receber")} disabled={contaReceber.length === 0}><Printer className="h-3.5 w-3.5 mr-1" />Imprimir</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={downloadContaReceber} disabled={contaReceber.length === 0}><Download className="h-3.5 w-3.5 mr-1" />Excel</Button>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead><tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium">Data Receb.</th>
                    <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium">Descrição</th>
                    <th className="text-left px-2 py-2 text-xs text-slate-500 font-medium">Categoria</th>
                    <th className="text-left px-2 py-2 text-xs text-slate-500 font-medium">Projeto</th>
                    <th className="text-left px-2 py-2 text-xs text-slate-500 font-medium">Cliente</th>
                    <th className="text-right px-3 py-2 text-xs text-slate-500 font-medium">Valor</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {contaReceber.map(t => (
                      <tr key={t.id}>
                        <td className="px-3 py-2 text-xs text-slate-500">{formatDate(t.paidDate)}</td>
                        <td className="px-3 py-2 text-xs">{t.description}</td>
                        <td className="px-2 py-2 text-xs text-slate-500">{t.category ?? "—"}</td>
                        <td className="px-2 py-2 text-xs text-slate-500">{t.project?.name ?? "—"}</td>
                        <td className="px-2 py-2 text-xs text-slate-500">{t.client?.name ?? "—"}</td>
                        <td className="px-3 py-2 text-right text-xs font-bold text-emerald-600">{formatCurrency(t.amount)}</td>
                      </tr>
                    ))}
                    {contaReceber.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-xs text-slate-400">Nenhum recebimento no mês selecionado</td></tr>}
                    {contaReceber.length > 0 && (
                      <tr className="bg-slate-50 font-semibold">
                        <td colSpan={5} className="px-3 py-2 text-xs text-right text-slate-600">Total</td>
                        <td className="px-3 py-2 text-right text-xs font-bold text-emerald-700">{formatCurrency(totalContaReceber)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Duplicatas a Pagar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Fornecedores / Duplicatas a Pagar</h3>
                  <p className="text-xs text-slate-400">Posição mensal — pendências com vencimento até o fim do mês</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => printContabilidade("dup-pagar")} disabled={duplicatasPagar.length === 0}><Printer className="h-3.5 w-3.5 mr-1" />Imprimir</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={downloadDuplicatasPagar} disabled={duplicatasPagar.length === 0}><Download className="h-3.5 w-3.5 mr-1" />Excel</Button>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead><tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium">Vencimento</th>
                    <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium">Descrição</th>
                    <th className="text-left px-2 py-2 text-xs text-slate-500 font-medium">Categoria</th>
                    <th className="text-left px-2 py-2 text-xs text-slate-500 font-medium">Projeto</th>
                    <th className="text-left px-2 py-2 text-xs text-slate-500 font-medium">Fornecedor</th>
                    <th className="text-right px-3 py-2 text-xs text-slate-500 font-medium">Valor</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {duplicatasPagar.map(t => (
                      <tr key={t.id}>
                        <td className="px-3 py-2 text-xs text-slate-500">{formatDate(t.dueDate)}</td>
                        <td className="px-3 py-2 text-xs">{t.description}</td>
                        <td className="px-2 py-2 text-xs text-slate-500">{t.category ?? "—"}</td>
                        <td className="px-2 py-2 text-xs text-slate-500">{t.project?.name ?? "—"}</td>
                        <td className="px-2 py-2 text-xs text-slate-500">{t.supplier?.name ?? t.recipient ?? "—"}</td>
                        <td className="px-3 py-2 text-right text-xs font-bold text-amber-600">{formatCurrency(t.amount)}</td>
                      </tr>
                    ))}
                    {duplicatasPagar.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-xs text-slate-400">Nenhuma duplicata a pagar no período</td></tr>}
                    {duplicatasPagar.length > 0 && (
                      <tr className="bg-slate-50 font-semibold">
                        <td colSpan={5} className="px-3 py-2 text-xs text-right text-slate-600">Total</td>
                        <td className="px-3 py-2 text-right text-xs font-bold text-amber-700">{formatCurrency(totalDuplicatasPagar)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Duplicatas a Receber */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Clientes / Duplicatas a Receber</h3>
                  <p className="text-xs text-slate-400">Posição mensal — pendências com vencimento até o fim do mês</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => printContabilidade("dup-receber")} disabled={duplicatasReceber.length === 0}><Printer className="h-3.5 w-3.5 mr-1" />Imprimir</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={downloadDuplicatasReceber} disabled={duplicatasReceber.length === 0}><Download className="h-3.5 w-3.5 mr-1" />Excel</Button>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead><tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium">Vencimento</th>
                    <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium">Descrição</th>
                    <th className="text-left px-2 py-2 text-xs text-slate-500 font-medium">Categoria</th>
                    <th className="text-left px-2 py-2 text-xs text-slate-500 font-medium">Projeto</th>
                    <th className="text-left px-2 py-2 text-xs text-slate-500 font-medium">Cliente</th>
                    <th className="text-right px-3 py-2 text-xs text-slate-500 font-medium">Valor</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {duplicatasReceber.map(t => (
                      <tr key={t.id}>
                        <td className="px-3 py-2 text-xs text-slate-500">{formatDate(t.dueDate)}</td>
                        <td className="px-3 py-2 text-xs">{t.description}</td>
                        <td className="px-2 py-2 text-xs text-slate-500">{t.category ?? "—"}</td>
                        <td className="px-2 py-2 text-xs text-slate-500">{t.project?.name ?? "—"}</td>
                        <td className="px-2 py-2 text-xs text-slate-500">{t.client?.name ?? "—"}</td>
                        <td className="px-3 py-2 text-right text-xs font-bold text-blue-600">{formatCurrency(t.amount)}</td>
                      </tr>
                    ))}
                    {duplicatasReceber.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-xs text-slate-400">Nenhuma duplicata a receber no período</td></tr>}
                    {duplicatasReceber.length > 0 && (
                      <tr className="bg-slate-50 font-semibold">
                        <td colSpan={5} className="px-3 py-2 text-xs text-right text-slate-600">Total</td>
                        <td className="px-3 py-2 text-right text-xs font-bold text-blue-700">{formatCurrency(totalDuplicatasReceber)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </TabsContent>

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
                  <Card><CardContent className="p-3 text-center"><p className="text-[10px] text-slate-400 uppercase font-semibold">Margem</p><p className={`text-base font-bold truncate ${projRecebido - projSaidas >= 0 ? "text-emerald-700" : "text-red-700"}`}>{formatCurrency(projRecebido - projSaidas)}</p></CardContent></Card>
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

          {/* ====== REEMBOLSOS ====== */}
          <TabsContent value="reembolsos" className="space-y-4 mt-4">
            <Card><CardContent className="p-4">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="min-w-[180px]">
                  <Label className="text-xs">Sócio</Label>
                  <select value={reembolsoSocio} onChange={e => setReembolsoSocio(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none">
                    <option value="">Todos</option>
                    {SOCIOS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <Button variant="outline" onClick={printReembolso} disabled={reembolsoTrans.length === 0}><Printer className="h-4 w-4" />Imprimir</Button>
              </div>
            </CardContent></Card>

            {reembolsoPorSocio.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {reembolsoPorSocio.map(s => (
                  <Card key={s.name} className="cursor-pointer hover:border-amber-300 transition-colors" onClick={() => setReembolsoSocio(s.name)}>
                    <CardContent className="p-3">
                      <p className="text-xs font-semibold text-slate-700 mb-2">{s.name}</p>
                      <div className="flex justify-between text-xs"><span className="text-slate-400">Total</span><span className="font-bold">{formatCurrency(s.total)}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-emerald-500">Reembolsado</span><span className="font-bold text-emerald-600">{formatCurrency(s.pago)}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-amber-500">Pendente</span><span className="font-bold text-amber-600">{formatCurrency(s.pendente)}</span></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <Card><CardContent className="p-3 text-center"><p className="text-[10px] text-slate-400 uppercase font-semibold">Total</p><p className="text-base font-bold">{formatCurrency(reembolsoTotal)}</p></CardContent></Card>
              <Card className="bg-emerald-50 border-emerald-200"><CardContent className="p-3 text-center"><p className="text-[10px] text-emerald-600 uppercase font-semibold">Reembolsado</p><p className="text-base font-bold text-emerald-700">{formatCurrency(reembolsoPago)}</p></CardContent></Card>
              <Card className="bg-amber-50 border-amber-200"><CardContent className="p-3 text-center"><p className="text-[10px] text-amber-600 uppercase font-semibold">Pendente</p><p className="text-base font-bold text-amber-700">{formatCurrency(reembolsoPendente)}</p></CardContent></Card>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead><tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium">Descrição</th>
                  <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium">Sócio</th>
                  <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium">Projeto</th>
                  <th className="text-center px-2 py-2 text-xs text-slate-500 font-medium">Vencim.</th>
                  <th className="text-right px-3 py-2 text-xs text-slate-500 font-medium">Valor</th>
                  <th className="text-center px-2 py-2 text-xs text-slate-500 font-medium">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {reembolsoTrans.map(t => (
                    <tr key={t.id}>
                      <td className="px-3 py-2 text-xs">{t.description}</td>
                      <td className="px-3 py-2 text-xs font-medium text-slate-700">{t.recipient}</td>
                      <td className="px-3 py-2 text-xs text-slate-500">{t.project?.name ?? "—"}</td>
                      <td className="px-2 py-2 text-center text-xs text-slate-500">{t.dueDate ? formatDate(t.dueDate) : "—"}</td>
                      <td className="px-3 py-2 text-right text-xs font-bold">{formatCurrency(t.amount)}</td>
                      <td className="px-2 py-2 text-center"><Badge className={`text-[10px] ${t.status === "pago" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{t.status === "pago" ? "Reembolsado" : "Pendente"}</Badge></td>
                    </tr>
                  ))}
                  {reembolsoTrans.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-xs text-slate-400">Nenhum reembolso registrado</td></tr>}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* ========== RELATÓRIO LIVRE ========== */}
          <TabsContent value="livre" className="space-y-4">
            {/* Step 1: Fonte */}
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">1. Escolha a fonte de dados</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {([
                    { id: "transactions" as const, label: "Transações",   icon: <Wallet className="h-5 w-5" /> },
                    { id: "projects"     as const, label: "Projetos",     icon: <Building2 className="h-5 w-5" /> },
                    { id: "clients"      as const, label: "Clientes",     icon: <Users className="h-5 w-5" /> },
                    { id: "suppliers"    as const, label: "Fornecedores", icon: <FileBarChart className="h-5 w-5" /> },
                  ]).map(s => (
                    <button key={s.id}
                      onClick={() => changeDynSource(s.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-sm font-medium transition-colors
                        ${dynSource === s.id
                          ? "border-amber-400 bg-amber-50 text-amber-800"
                          : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50/50"}`}>
                      {s.icon}
                      {s.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {dynSource && (
              <>
                {/* Step 2: Filtros */}
                <Card>
                  <CardContent className="pt-4 pb-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">2. Filtros (opcionais)</p>
                    {dynSource === "transactions" && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs text-slate-500 mb-1 block">Tipo</Label>
                          <select value={dynFType} onChange={e => setDynFType(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white">
                            <option value="">Todos</option>
                            <option value="entrada">Entrada</option>
                            <option value="saida">Saída</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500 mb-1 block">Status</Label>
                          <select value={dynFStatus} onChange={e => setDynFStatus(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white">
                            <option value="">Todos</option>
                            <option value="pago">Pago</option>
                            <option value="pendente">Pendente</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500 mb-1 block">Categoria</Label>
                          <select value={dynFCat} onChange={e => setDynFCat(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white">
                            <option value="">Todas</option>
                            {["Recebimento","Prestação de Serviços","Pagamento Fornecedor","Material","Mão de Obra","Despesa Operacional","Retirada de Pró Labore","Prejuízo","Outros"].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500 mb-1 block">Projeto</Label>
                          <select value={dynFProject} onChange={e => setDynFProject(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white">
                            <option value="">Todos</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500 mb-1 block">Data de</Label>
                          <Input type="date" value={dynFFrom} onChange={e => setDynFFrom(e.target.value)} className="h-7 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500 mb-1 block">Data até</Label>
                          <Input type="date" value={dynFTo} onChange={e => setDynFTo(e.target.value)} className="h-7 text-xs" />
                        </div>
                      </div>
                    )}
                    {dynSource === "projects" && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs text-slate-500 mb-1 block">Status</Label>
                          <select value={dynFProjStatus} onChange={e => setDynFProjStatus(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white">
                            <option value="">Todos</option>
                            {Object.entries(PROJ_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500 mb-1 block">Tipo</Label>
                          <select value={dynFProjType} onChange={e => setDynFProjType(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white">
                            <option value="">Todos</option>
                            {Object.entries(PROJ_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                    {(dynSource === "clients" || dynSource === "suppliers") && (
                      <p className="text-xs text-slate-400 italic">Sem filtros disponíveis para esta fonte — todos os registros serão incluídos.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Step 3: Colunas */}
                <Card>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">3. Escolha as colunas</p>
                      <div className="flex gap-2">
                        <button onClick={selectAllDynCols} className="text-xs text-amber-600 hover:text-amber-800 font-medium">Selecionar todas</button>
                        <span className="text-slate-300">|</span>
                        <button onClick={clearDynCols} className="text-xs text-slate-400 hover:text-slate-600">Limpar</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {(DYN_COLS[dynSource] ?? []).map(col => (
                        <label key={col.key} className={`flex items-center gap-2 text-xs p-2 rounded-md border cursor-pointer transition-colors
                          ${dynCols.includes(col.key) ? "border-amber-300 bg-amber-50 text-amber-800" : "border-slate-200 text-slate-600 hover:border-amber-200 hover:bg-amber-50/30"}`}>
                          <input type="checkbox" checked={dynCols.includes(col.key)} onChange={() => toggleDynCol(col.key)} className="accent-amber-500" />
                          {col.label}
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Step 4: Preview e Exportação */}
                {dynActiveCols.length > 0 && (
                  <Card>
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          4. Prévia — {dynRows.length} registro{dynRows.length !== 1 ? "s" : ""}
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={downloadDynCSV} className="h-7 text-xs gap-1">
                            <Download className="h-3.5 w-3.5" />Excel
                          </Button>
                          <Button size="sm" variant="outline" onClick={printDynReport} className="h-7 text-xs gap-1">
                            <Printer className="h-3.5 w-3.5" />Imprimir
                          </Button>
                        </div>
                      </div>
                      <div className="overflow-x-auto rounded-md border border-slate-200">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              {dynActiveCols.map(c => (
                                <th key={c.key} className={`px-3 py-2 font-semibold text-slate-500 whitespace-nowrap ${c.right ? "text-right" : "text-left"}`}>{c.label}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {dynRows.slice(0, 50).map((row, i) => (
                              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                {dynActiveCols.map(c => (
                                  <td key={c.key} className={`px-3 py-2 text-slate-700 ${c.right ? "text-right font-medium" : ""}`}>
                                    {dynGetValue(row, c.key, dynSource)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                            {dynRows.length === 0 && (
                              <tr><td colSpan={dynActiveCols.length} className="py-8 text-center text-slate-400">Nenhum registro encontrado</td></tr>
                            )}
                            {dynRows.length > 50 && (
                              <tr><td colSpan={dynActiveCols.length} className="py-2 text-center text-xs text-slate-400 bg-slate-50">
                                Mostrando 50 de {dynRows.length} registros — use Excel ou Imprimir para exportar todos
                              </td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
