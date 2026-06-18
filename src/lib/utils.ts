import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—"
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date))
}

export function formatDateInput(date: Date | string | null | undefined): string {
  if (!date) return ""
  return new Date(date).toISOString().split("T")[0]
}

export const PROJECT_STATUS: Record<string, { label: string; color: string }> = {
  orcamento:  { label: "Orçamento",   color: "bg-yellow-100 text-yellow-800" },
  contrato:   { label: "Contrato",    color: "bg-blue-100 text-blue-800" },
  execucao:   { label: "Em Execução", color: "bg-purple-100 text-purple-800" },
  entregue:   { label: "Entregue",    color: "bg-green-100 text-green-800" },
  cancelado:  { label: "Cancelado",   color: "bg-red-100 text-red-800" },
}

export const STEP_STATUS: Record<string, { label: string; color: string; pct: number }> = {
  pendente:   { label: "Pendente",    color: "bg-gray-100 text-gray-600",    pct: 0 },
  comprado:   { label: "Comprado",    color: "bg-yellow-100 text-yellow-800", pct: 20 },
  entregue:   { label: "Entregue",    color: "bg-blue-100 text-blue-800",    pct: 50 },
  instalado:  { label: "Instalado",   color: "bg-green-100 text-green-800",  pct: 100 },
  naoaplica:  { label: "Não aplica",  color: "bg-slate-100 text-slate-400",  pct: -1 },
}

export const TRANSACTION_STATUS: Record<string, { label: string; color: string }> = {
  pendente:   { label: "Pendente",   color: "bg-yellow-100 text-yellow-800" },
  pago:       { label: "Pago",       color: "bg-green-100 text-green-800" },
  vencido:    { label: "Vencido",    color: "bg-red-100 text-red-800" },
  cancelado:  { label: "Cancelado",  color: "bg-gray-100 text-gray-600" },
}

export const CONTRACT_STATUS: Record<string, { label: string; color: string }> = {
  rascunho:   { label: "Rascunho",   color: "bg-gray-100 text-gray-600" },
  enviado:    { label: "Enviado",    color: "bg-blue-100 text-blue-800" },
  assinado:   { label: "Assinado",   color: "bg-green-100 text-green-800" },
  cancelado:  { label: "Cancelado",  color: "bg-red-100 text-red-800" },
}

export function calcStepCompletion(obj: {
  stepEletrica: string; stepPintura: string; stepAcabamentos: string
  stepMoveis: string; stepEletrodomesticos: string; stepPersonalizacao: string
}): number {
  const steps = [obj.stepEletrica, obj.stepPintura, obj.stepAcabamentos, obj.stepMoveis, obj.stepEletrodomesticos, obj.stepPersonalizacao]
  const applicable = steps.filter(s => s !== "naoaplica")
  if (applicable.length === 0) return 100
  const total = applicable.reduce((acc, s) => acc + (STEP_STATUS[s]?.pct ?? 0), 0)
  return Math.round(total / applicable.length)
}

export function calcProjectCompletion(project: {
  stepEletrica: string; stepPintura: string; stepAcabamentos: string
  stepMoveis: string; stepEletrodomesticos: string; stepPersonalizacao: string
}): number {
  return calcStepCompletion(project)
}

export function getDueDateAlert(dueDate: Date | string | null | undefined): string | null {
  if (!dueDate) return null
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return "vencido"
  if (diff === 0) return "hoje"
  if (diff <= 3) return "3dias"
  if (diff <= 7) return "7dias"
  return null
}
