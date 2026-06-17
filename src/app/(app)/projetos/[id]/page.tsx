"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin, Calendar, CheckCircle2, Circle, Clock, Building2 } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate, PROJECT_STATUS, STEP_STATUS, TRANSACTION_STATUS, calcProjectCompletion } from "@/lib/utils"

interface Project {
  id: string; name: string; address?: string; status: string
  totalValue: number; startDate?: string; deliveryDate?: string; notes?: string
  stepEletrica: string; stepPintura: string; stepAcabamentos: string
  stepMoveis: string; stepEletrodomesticos: string; stepPersonalizacao: string
  client?: { id: string; name: string; phone?: string; email?: string }
  items: Array<{
    id: string; type: string; quantity: number; unitPrice: number; totalPrice: number; description?: string
    product?: { name: string; category: string }
    service?: { name: string; category: string }
  }>
  transactions: Array<{ id: string; type: string; description: string; amount: number; dueDate?: string; paidDate?: string; status: string }>
  contracts: Array<{ id: string; type: string; title: string; status: string; createdAt: string }>
}

const STEPS = [
  { key: "stepEletrica", label: "Elétrica", icon: "⚡" },
  { key: "stepPintura", label: "Pintura", icon: "🎨" },
  { key: "stepAcabamentos", label: "Acabamentos", icon: "🪟" },
  { key: "stepMoveis", label: "Móveis", icon: "🛋️" },
  { key: "stepEletrodomesticos", label: "Eletrodomésticos", icon: "🏠" },
  { key: "stepPersonalizacao", label: "Personalização", icon: "✨" },
] as const

export default function ProjetoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => fetch(`/api/projects/${id}`).then(r => r.json()).then(setProject)
  useEffect(() => { if (id) load() }, [id])

  const updateStep = async (key: string, value: string) => {
    if (!project) return
    setSaving(true)
    await fetch(`/api/projects/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [key]: value }) })
    await load()
    setSaving(false)
  }

  if (!project) return <div className="flex items-center justify-center h-full text-slate-400">Carregando...</div>

  const completion = calcProjectCompletion(project)
  const st = PROJECT_STATUS[project.status]
  const totalPaid = project.transactions.filter(t => t.type === "entrada" && t.status === "pago").reduce((s, t) => s + t.amount, 0)
  const totalPending = project.transactions.filter(t => t.type === "entrada" && t.status === "pendente").reduce((s, t) => s + t.amount, 0)
  const totalExpense = project.transactions.filter(t => t.type === "saida").reduce((s, t) => s + t.amount, 0)

  return (
    <>
      <Topbar
        title={project.name}
        description={project.client?.name}
        action={
          <Link href="/projetos">
            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" />Voltar</Button>
          </Link>
        }
      />
      <div className="p-6 space-y-6">
        {/* Status e info geral */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 font-medium mb-1">Status</p>
              <Badge className={st?.color}>{st?.label}</Badge>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 font-medium mb-1">Valor Total</p>
              <p className="text-lg font-bold text-amber-600">{formatCurrency(project.totalValue)}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 font-medium mb-1">Recebido</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 font-medium mb-1">A Receber</p>
              <p className="text-lg font-bold text-yellow-600">{formatCurrency(totalPending)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progresso por etapa */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Progresso das Etapas</CardTitle>
                  <div className="flex items-center gap-2">
                    {saving && <span className="text-xs text-slate-400">Salvando...</span>}
                    <span className="text-2xl font-bold text-amber-600">{completion}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-amber-500 transition-all" style={{ width: `${completion}%` }} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {STEPS.map(({ key, label, icon }) => {
                    const val = (project as unknown as Record<string, string>)[key]
                    const st = STEP_STATUS[val]
                    return (
                      <div key={key} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{icon}</span>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{label}</p>
                            <p className={`text-xs font-medium ${st.color.replace("bg-", "").replace("/10", "").replace("-100", "-400").split(" ")[1]}`}>{st.label}</p>
                          </div>
                        </div>
                        <Select value={val} onValueChange={v => updateStep(key, v)}>
                          <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(STEP_STATUS).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Transações */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Movimentações Financeiras</CardTitle>
              </CardHeader>
              <CardContent>
                {project.transactions.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Nenhuma transação vinculada</p>
                ) : (
                  <div className="space-y-2">
                    {project.transactions.map(t => {
                      const ts = TRANSACTION_STATUS[t.status]
                      return (
                        <div key={t.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            {t.status === "pago" ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : t.status === "vencido" ? <Circle className="h-4 w-4 text-red-500" /> : <Clock className="h-4 w-4 text-amber-500" />}
                            <div>
                              <p className="text-sm font-medium text-slate-900">{t.description}</p>
                              <p className="text-xs text-slate-500">{t.dueDate ? formatDate(t.dueDate) : "—"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${t.type === "entrada" ? "text-green-600" : "text-red-600"}`}>
                              {t.type === "entrada" ? "+" : "-"}{formatCurrency(t.amount)}
                            </p>
                            <Badge className={`${ts?.color} text-[10px]`}>{ts?.label}</Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna lateral */}
          <div className="space-y-4">
            {/* Info do projeto */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Informações</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {project.address && (
                  <div className="flex gap-2 text-slate-600">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" /><span>{project.address}</span>
                  </div>
                )}
                {project.startDate && (
                  <div className="flex gap-2 text-slate-600">
                    <Calendar className="h-4 w-4 shrink-0" /><span>Início: {formatDate(project.startDate)}</span>
                  </div>
                )}
                {project.deliveryDate && (
                  <div className="flex gap-2 text-slate-600">
                    <Calendar className="h-4 w-4 shrink-0" /><span>Entrega: {formatDate(project.deliveryDate)}</span>
                  </div>
                )}
                {project.notes && <p className="text-slate-500 text-xs border-t border-slate-100 pt-2">{project.notes}</p>}
              </CardContent>
            </Card>

            {/* Cliente */}
            {project.client && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Cliente</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p className="font-semibold text-slate-900">{project.client.name}</p>
                  {project.client.phone && <p className="text-slate-500 text-xs">{project.client.phone}</p>}
                  {project.client.email && <p className="text-slate-500 text-xs">{project.client.email}</p>}
                </CardContent>
              </Card>
            )}

            {/* Resumo financeiro */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Resumo Financeiro</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Contrato</span><span className="font-semibold text-slate-900">{formatCurrency(project.totalValue)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Recebido</span><span className="font-semibold text-green-600">{formatCurrency(totalPaid)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">A receber</span><span className="font-semibold text-yellow-600">{formatCurrency(totalPending)}</span></div>
                <div className="flex justify-between border-t border-slate-100 pt-2"><span className="text-slate-500">Despesas</span><span className="font-semibold text-red-600">{formatCurrency(totalExpense)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 text-xs">Margem estimada</span><span className="text-xs font-bold text-amber-600">{project.totalValue > 0 ? Math.round(((project.totalValue - totalExpense) / project.totalValue) * 100) : 0}%</span></div>
              </CardContent>
            </Card>

            {/* Contratos */}
            {project.contracts.length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Contratos</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {project.contracts.map(c => (
                    <div key={c.id} className="text-xs rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                      <p className="font-semibold text-slate-900">{c.title}</p>
                      <p className="text-slate-500 capitalize">{c.type} · {c.status}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
