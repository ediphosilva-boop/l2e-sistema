"use client"
import { useEffect, useState } from "react"
import { Download, RefreshCw, Clock, CheckCircle2, XCircle, Database, Trash2, HardDrive } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

interface BackupLog {
  id: string; type: string; status: string; tables: number
  records: number; sizeBytes: number; error?: string
  userName?: string; createdAt: string
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

export default function BackupPage() {
  const [logs, setLogs] = useState<BackupLog[]>([])
  const [loading, setLoading] = useState(false)
  const [backing, setBacking] = useState(false)

  const loadLogs = () => fetch("/api/backup/history").then(r => r.json()).then(setLogs)
  useEffect(() => { loadLogs() }, [])

  const runManualBackup = async () => {
    setBacking(true)
    try {
      const res = await fetch("/api/backup?type=manual")
      if (!res.ok) throw new Error("Erro ao gerar backup")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `l2e-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      await loadLogs()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao gerar backup")
    }
    setBacking(false)
  }

  const runAutoBackup = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/backup?type=automatico&save=true")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro")
      await loadLogs()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao salvar backup")
    }
    setLoading(false)
  }

  const downloadSaved = async (id: string) => {
    const res = await fetch(`/api/backup/${id}`)
    if (!res.ok) { alert("Backup sem dados salvos"); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `l2e-backup-${id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const deleteLog = async (id: string) => {
    if (!confirm("Excluir este registro de backup?")) return
    await fetch(`/api/backup/${id}`, { method: "DELETE" })
    await loadLogs()
  }

  const cleanOld = async () => {
    if (!confirm("Manter apenas os últimos 30 registros?")) return
    await fetch("/api/backup?keepLast=30", { method: "DELETE" })
    await loadLogs()
  }

  const lastSuccess = logs.find(l => l.status === "sucesso")
  const totalBackups = logs.length
  const successCount = logs.filter(l => l.status === "sucesso").length
  const errorCount = logs.filter(l => l.status === "erro").length

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Backup" subtitle="Backup e restauração dos dados do sistema" />
      <div className="flex-1 p-3 sm:p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Database className="h-5 w-5 mx-auto mb-1 text-amber-500" />
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Último backup</p>
              <p className="text-sm font-bold text-slate-700">
                {lastSuccess ? formatDate(lastSuccess.createdAt) : "Nunca"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <HardDrive className="h-5 w-5 mx-auto mb-1 text-blue-500" />
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Último tamanho</p>
              <p className="text-sm font-bold text-slate-700">
                {lastSuccess ? formatBytes(lastSuccess.sizeBytes) : "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Sucesso</p>
              <p className="text-sm font-bold text-emerald-700">{successCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="h-5 w-5 mx-auto mb-1 text-red-400" />
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Erros</p>
              <p className="text-sm font-bold text-red-600">{errorCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-800 text-sm mb-1">Backup Manual</h3>
              <p className="text-xs text-slate-500 mb-4">
                Exporta todos os dados do sistema como arquivo JSON.
                O download começa automaticamente.
              </p>
              <Button onClick={runManualBackup} disabled={backing} className="w-full">
                {backing ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" />Gerando...</>
                ) : (
                  <><Download className="h-4 w-4" />Fazer Backup Agora</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-800 text-sm mb-1">Backup Automático</h3>
              <p className="text-xs text-slate-500 mb-1">
                Salva os dados no servidor para download posterior.
              </p>
              <p className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-1 mb-3">
                Cron configurado: executa diariamente às 03:00 UTC
              </p>
              <Button variant="outline" onClick={runAutoBackup} disabled={loading} className="w-full">
                {loading ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" />Salvando...</>
                ) : (
                  <><Database className="h-4 w-4" />Executar e Salvar no Servidor</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Dados incluídos no backup</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
            {[
              "Usuários", "Clientes", "Fornecedores", "Produtos",
              "Serviços", "Projetos", "Apartamentos", "Itens dos Aptos",
              "Itens do Projeto", "Transações", "Contratos/Propostas",
              "Preços de Pacotes", "Composição de Pacotes",
            ].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                {t}
              </div>
            ))}
          </div>
          {lastSuccess && (
            <p className="text-xs text-slate-400 mt-3">
              Último backup: {lastSuccess.records} registros em {lastSuccess.tables} tabelas ({formatBytes(lastSuccess.sizeBytes)})
            </p>
          )}
        </div>

        {/* History */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-700">Histórico de Backups</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={loadLogs}>
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              {totalBackups > 30 && (
                <Button size="sm" variant="ghost" className="text-red-500" onClick={cleanOld}>
                  <Trash2 className="h-3.5 w-3.5" />Limpar antigos
                </Button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium">Data</th>
                  <th className="text-center px-3 py-2 text-xs text-slate-500 font-medium">Tipo</th>
                  <th className="text-center px-3 py-2 text-xs text-slate-500 font-medium">Status</th>
                  <th className="text-center px-3 py-2 text-xs text-slate-500 font-medium">Tabelas</th>
                  <th className="text-center px-3 py-2 text-xs text-slate-500 font-medium">Registros</th>
                  <th className="text-right px-3 py-2 text-xs text-slate-500 font-medium">Tamanho</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-slate-300" />
                        <div>
                          <span className="text-xs text-slate-700">{formatDate(log.createdAt)}</span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            {new Date(log.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                      {log.userName && <p className="text-[10px] text-slate-400 ml-5">{log.userName}</p>}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <Badge variant="outline" className={`text-[10px] ${log.type === "automatico" ? "border-blue-300 text-blue-700 bg-blue-50" : "border-amber-300 text-amber-700 bg-amber-50"}`}>
                        {log.type === "automatico" ? "Auto" : "Manual"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {log.status === "sucesso" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" />OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full" title={log.error}>
                          <XCircle className="h-3 w-3" />Erro
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center text-xs text-slate-600">{log.tables || "—"}</td>
                    <td className="px-3 py-2.5 text-center text-xs text-slate-600 font-medium">{log.records || "—"}</td>
                    <td className="px-3 py-2.5 text-right text-xs text-slate-500">{log.sizeBytes ? formatBytes(log.sizeBytes) : "—"}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex justify-end gap-1">
                        {log.type === "automatico" && log.status === "sucesso" && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => downloadSaved(log.id)}>
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-red-400 hover:text-red-600" onClick={() => deleteLog(log.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                      Nenhum backup realizado ainda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
