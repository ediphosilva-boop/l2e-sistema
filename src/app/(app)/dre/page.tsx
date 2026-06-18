"use client"
import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, ChevronDown, ChevronRight, BarChart3 } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { formatCurrency } from "@/lib/utils"

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
const now = new Date()

interface DreItem { id: string; description: string; amount: number; project?: { name: string }; supplier?: { name: string } }
interface DreData {
  receitaBruta: number; receitaPendente: number
  cmv: { total: number; items: DreItem[] }
  maoDeObra: { total: number; items: DreItem[] }
  despesasOperacionais: { total: number; items: DreItem[] }
  prolabore: { total: number; items: DreItem[] }
  reembolsos: { total: number; items: DreItem[] }
  outros: { total: number; items: DreItem[] }
  lucroBruto: number; lucroLiquido: number; margemBruta: number; margemLiquida: number
}

function DreRow({
  label, value, sublabel, highlight, negative, indent, expandable, items
}: {
  label: string; value: number; sublabel?: string; highlight?: "green" | "amber" | "red"
  negative?: boolean; indent?: boolean; expandable?: boolean; items?: DreItem[]
}) {
  const [open, setOpen] = useState(false)
  const displayValue = negative ? -Math.abs(value) : value

  return (
    <>
      <tr
        className={highlight ? "border-t-2 border-slate-200" : ""}
        onClick={() => expandable && setOpen(!open)}
      >
        <td className={`py-2.5 pr-4 text-sm ${indent ? "pl-8 text-slate-500" : "pl-4 font-medium text-slate-800"} ${expandable ? "cursor-pointer" : ""}`}>
          <span className="flex items-center gap-1.5">
            {expandable && (open ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />)}
            {label}
            {sublabel && <span className="text-xs text-slate-400 font-normal ml-1">({sublabel})</span>}
          </span>
        </td>
        <td className={`py-2.5 pl-4 text-sm text-right font-mono font-semibold tabular-nums ${
          highlight === "green" ? "text-emerald-600 text-base" :
          highlight === "red" ? "text-red-600 text-base" :
          highlight === "amber" ? "text-amber-600 text-base" :
          negative ? "text-red-500" : "text-slate-700"
        }`}>
          {negative && value > 0 ? "-" : ""}{formatCurrency(Math.abs(value))}
        </td>
      </tr>
      {open && items?.map(it => (
        <tr key={it.id} className="bg-slate-50">
          <td className="py-1.5 pl-14 pr-4 text-xs text-slate-500">
            {it.description}
            {it.project && <span className="ml-1 text-slate-400">· {it.project.name}</span>}
            {it.supplier && <span className="ml-1 text-slate-400">· {it.supplier.name}</span>}
          </td>
          <td className="py-1.5 pl-4 text-xs text-right text-red-400 font-mono tabular-nums">
            -{formatCurrency(it.amount)}
          </td>
        </tr>
      ))}
    </>
  )
}

export default function DrePage() {
  const [data, setData] = useState<DreData | null>(null)
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState<number | "">("")
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams({ year: String(year) })
    if (month) params.set("month", String(month))
    const res = await fetch(`/api/dre?${params}`)
    setData(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [year, month])

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="DRE" subtitle="Demonstrativo de Resultado do Exercício" />
      <div className="flex-1 p-6 space-y-6">

        {/* Filtros */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:outline-none"
          >
            {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={month}
            onChange={e => setMonth(e.target.value ? Number(e.target.value) : "")}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:outline-none"
          >
            <option value="">Ano completo</option>
            {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
        </div>

        {/* KPIs */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Receita Bruta", value: data.receitaBruta, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
              { label: "Lucro Bruto", value: data.lucroBruto, color: data.lucroBruto >= 0 ? "text-emerald-600" : "text-red-500", bg: "bg-white border-slate-200" },
              { label: "Lucro Líquido", value: data.lucroLiquido, color: data.lucroLiquido >= 0 ? "text-emerald-600" : "text-red-500", bg: "bg-white border-slate-200" },
              { label: "A Receber", value: data.receitaPendente, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
            ].map(k => (
              <div key={k.label} className={`rounded-xl border p-4 ${k.bg}`}>
                <p className="text-xs text-slate-500 mb-1">{k.label}</p>
                <p className={`text-lg font-bold ${k.color}`}>{formatCurrency(k.value)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabela DRE */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
            <BarChart3 className="h-4 w-4 text-amber-500" />
            <h2 className="font-semibold text-slate-800 text-sm">
              DRE — {month ? MONTHS[Number(month)-1] : "Anual"} {year}
            </h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400">Carregando...</div>
          ) : data && (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-2 pl-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                  <th className="py-2 pl-4 pr-5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <DreRow label="(+) Receita Bruta" value={data.receitaBruta} highlight="green" />
                <DreRow label="(-) Custo das Mercadorias (CMV)" value={data.cmv.total} negative expandable items={data.cmv.items} />
                <DreRow label="(-) Mão de Obra" value={data.maoDeObra.total} negative expandable items={data.maoDeObra.items} />
                <DreRow label="(=) LUCRO BRUTO" value={data.lucroBruto} highlight={data.lucroBruto >= 0 ? "green" : "red"}
                  sublabel={`margem ${data.margemBruta.toFixed(1)}%`} />
                <DreRow label="(-) Despesas Operacionais" value={data.despesasOperacionais.total} negative expandable items={data.despesasOperacionais.items} />
                <DreRow label="(-) Pró-Labore" value={data.prolabore.total} negative expandable items={data.prolabore.items} />
                <DreRow label="(-) Reembolsos" value={data.reembolsos.total} negative expandable items={data.reembolsos.items} />
                {data.outros.total > 0 && <DreRow label="(-) Outros" value={data.outros.total} negative expandable items={data.outros.items} />}
                <DreRow label="(=) LUCRO LÍQUIDO" value={data.lucroLiquido} highlight={data.lucroLiquido >= 0 ? "green" : "red"}
                  sublabel={`margem ${data.margemLiquida.toFixed(1)}%`} />
              </tbody>
            </table>
          )}
        </div>

        {data && data.lucroLiquido > 0 && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
            <TrendingUp className="h-4 w-4" />
            Resultado positivo no período. Margem líquida de {data.margemLiquida.toFixed(1)}%.
          </div>
        )}
        {data && data.lucroLiquido < 0 && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <TrendingDown className="h-4 w-4" />
            Resultado negativo no período. Revise as despesas.
          </div>
        )}
      </div>
    </div>
  )
}
