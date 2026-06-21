"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts"
import {
  Wallet, TrendingUp, TrendingDown, AlertTriangle, Building2,
  CheckCircle2, Clock, ChevronRight, Calendar
} from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, TRANSACTION_STATUS, PROJECT_STATUS, getDueDateAlert } from "@/lib/utils"

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#22c55e", "#ef4444"]

const ALERT_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  vencido: { bg: "bg-red-50 border-red-200",    text: "text-red-700",    dot: "bg-red-500" },
  hoje:    { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", dot: "bg-orange-500" },
  "3dias": { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", dot: "bg-yellow-500" },
  "7dias": { bg: "bg-blue-50 border-blue-200",   text: "text-blue-700",   dot: "bg-blue-400" },
}

interface DashboardData {
  saldo: number
  saldoFuturo: number
  totalAReceber: number
  totalAPagar: number
  receitaMes: number
  despesaMes: number
  boletosVencer: number
  projetosAtivos: number
  projetosEntreguesMes: number
  fluxoMensal: { month: string; entradas: number; saidas: number }[]
  statusCount: Record<string, number>
  ultimasTransacoes: Array<{
    id: string; type: string; description: string; amount: number
    dueDate?: string; paidDate?: string; status: string; category?: string
  }>
}

interface Vencimento {
  id: string; type: string; description: string; amount: number
  dueDate?: string; status: string; category?: string
  supplier?: { name: string }; client?: { name: string }; project?: { name: string }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [vencimentos, setVencimentos] = useState<Vencimento[]>([])
  const loadData = async () => {
    const [dash, trans] = await Promise.all([
      fetch("/api/dashboard").then(r => r.json()),
      fetch("/api/transactions").then(r => r.json()),
    ])
    setData(dash)
    const v = (trans as Vencimento[])
      .filter(t => t.status === "pendente" && t.dueDate)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 6)
    setVencimentos(v)
  }

  useEffect(() => { loadData() }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-500 text-sm">Carregando...</div>
      </div>
    )
  }

  const pieData = Object.entries(data.statusCount)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: PROJECT_STATUS[k]?.label ?? k, value: v }))

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-xl">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>
        ))}
      </div>
    )
  }

  return (
    <>
      <Topbar
        title="Dashboard"
        description="Visão geral da L2E Prime Solutions"
      />
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-5">

        {/* KPIs */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          {/* Saldo Atual */}
          <div className="col-span-2">
            <Card className="border-l-4 border-l-amber-500 h-full">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3 h-full">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-amber-50 shrink-0">
                  <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide">Saldo em Caixa</p>
                  <p className={`text-base sm:text-lg xl:text-xl font-bold leading-tight ${data.saldo >= 0 ? "text-slate-900" : "text-red-600"}`}>
                    {formatCurrency(data.saldo)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Saldo Futuro */}
          <div className="col-span-2">
            <Card className={`border-l-4 h-full ${data.saldoFuturo >= 0 ? "border-l-purple-500" : "border-l-red-500"}`}>
              <CardContent className="p-3 sm:p-4 flex items-center gap-3 h-full">
                <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl shrink-0 ${data.saldoFuturo >= 0 ? "bg-purple-50" : "bg-red-50"}`}>
                  <TrendingUp className={`h-5 w-5 sm:h-6 sm:w-6 ${data.saldoFuturo >= 0 ? "text-purple-600" : "text-red-600"}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide">Saldo Futuro</p>
                  <p className={`text-base sm:text-lg xl:text-xl font-bold leading-tight ${data.saldoFuturo >= 0 ? "text-purple-700" : "text-red-600"}`}>
                    {formatCurrency(data.saldoFuturo)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    +{formatCurrency(data.totalAReceber)} a receber · -{formatCurrency(data.totalAPagar)} a pagar
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* A Receber */}
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide">A Receber</p>
              </div>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-green-600 leading-tight">{formatCurrency(data.receitaMes)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">neste mês</p>
            </CardContent>
          </Card>

          {/* A Pagar */}
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500 shrink-0" />
                <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide">A Pagar</p>
              </div>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-red-600 leading-tight">{formatCurrency(data.despesaMes)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">neste mês</p>
            </CardContent>
          </Card>

          {/* Projetos ativos */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 shrink-0" />
                <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide">Em Execução</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">{data.projetosAtivos}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">projetos</p>
            </CardContent>
          </Card>

          {/* Boletos a vencer */}
          <Card className={`border-l-4 ${data.boletosVencer > 0 ? "border-l-orange-500" : "border-l-slate-300"}`}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 ${data.boletosVencer > 0 ? "text-orange-500" : "text-slate-400"}`} />
                <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide">Vencem</p>
              </div>
              <p className={`text-2xl font-bold ${data.boletosVencer > 0 ? "text-orange-600" : "text-slate-400"}`}>{data.boletosVencer}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">em 7 dias</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Fluxo de Caixa — Últimos 6 Meses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.fluxoMensal} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="entradas" name="Entradas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="saidas" name="Saídas" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Projetos por Status</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Legend formatter={(value) => <span style={{ color: "#64748b", fontSize: 11 }}>{value}</span>} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-slate-400 text-sm">Sem projetos</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Linha inferior: Vencimentos + Últimas transações */}
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">

          {/* Vencimentos próximos */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  Vencimentos Próximos
                </CardTitle>
                <Link href="/caixa">
                  <Button variant="ghost" size="sm" className="text-xs">Ver todos <ChevronRight className="h-3 w-3" /></Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {vencimentos.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-4">Nenhum vencimento pendente</p>
              ) : (
                <div className="space-y-2">
                  {vencimentos.map(t => {
                    const alert = getDueDateAlert(t.dueDate)
                    const style = alert ? ALERT_STYLE[alert] : { bg: "bg-slate-50 border-slate-200", text: "text-slate-600", dot: "bg-slate-400" }
                    return (
                      <div key={t.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 ${style.bg}`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${style.dot}`} />
                          <div className="min-w-0">
                            <p className={`text-xs font-medium truncate ${style.text}`}>{t.description}</p>
                            <p className="text-[10px] text-slate-400">{formatDate(t.dueDate)}</p>
                          </div>
                        </div>
                        <p className={`text-xs font-bold shrink-0 ml-2 ${t.type === "entrada" ? "text-green-600" : "text-red-600"}`}>
                          {t.type === "entrada" ? "+" : "-"}{formatCurrency(t.amount)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Últimas transações — compacto */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700">Últimas Transações</CardTitle>
                <Link href="/caixa">
                  <Button variant="ghost" size="sm" className="text-xs">Ver todas <ChevronRight className="h-3 w-3" /></Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {data.ultimasTransacoes.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-4">Nenhuma transação registrada.</p>
              ) : (
                <div className="space-y-1.5">
                  {data.ultimasTransacoes.slice(0, 6).map(t => {
                    const ts = TRANSACTION_STATUS[t.status]
                    return (
                      <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-2 min-w-0">
                          {t.status === "pago"
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                            : <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-800 truncate">{t.description}</p>
                            <p className="text-[10px] text-slate-400">{t.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <p className={`text-xs font-bold ${t.type === "entrada" ? "text-green-600" : "text-red-500"}`}>
                            {t.type === "entrada" ? "+" : "-"}{formatCurrency(t.amount)}
                          </p>
                          <Badge className={`${ts?.color} text-[9px] px-1.5 py-0`}>{ts?.label}</Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
