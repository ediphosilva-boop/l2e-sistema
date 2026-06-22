"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertTriangle, X } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface AlertData {
  vencidos: number
  venceHoje: number
  venceAmanha: number
  totalVencido: number
  totalHoje: number
  totalAmanha: number
}

export function AlertBanner() {
  const [data, setData] = useState<AlertData | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch("/api/alerts/summary")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d) })
      .catch(() => {})
  }, [])

  if (!data || dismissed) return null
  const total = data.vencidos + data.venceHoje + data.venceAmanha
  if (total === 0) return null

  return (
    <div className={`px-4 py-2 flex items-center justify-between gap-3 text-sm ${data.vencidos > 0 ? "bg-red-50 border-b border-red-200" : "bg-amber-50 border-b border-amber-200"}`}>
      <div className="flex items-center gap-2 flex-wrap min-w-0">
        <AlertTriangle className={`h-4 w-4 shrink-0 ${data.vencidos > 0 ? "text-red-500" : "text-amber-500"}`} />
        <span className="text-xs font-medium text-slate-700">
          {data.vencidos > 0 && (
            <span className="text-red-600 font-bold">{data.vencidos} vencido(s) ({formatCurrency(data.totalVencido)}) · </span>
          )}
          {data.venceHoje > 0 && (
            <span className="text-amber-700">{data.venceHoje} vence(m) hoje ({formatCurrency(data.totalHoje)}) · </span>
          )}
          {data.venceAmanha > 0 && (
            <span className="text-blue-600">{data.venceAmanha} vence(m) amanhã ({formatCurrency(data.totalAmanha)})</span>
          )}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link href="/caixa" className="text-xs font-medium text-amber-700 hover:text-amber-900 underline">
          Ver no Caixa
        </Link>
        <button onClick={() => setDismissed(true)} className="text-slate-400 hover:text-slate-600">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
