export const PROJECT_STATUSES = ["orcamento", "contrato", "execucao", "entregue", "cancelado"] as const
export type ProjectStatus = typeof PROJECT_STATUSES[number]

export const ITEM_STATUSES = ["pendente", "comprado", "entregue", "instalado", "naoaplica"] as const
export type ItemStatus = typeof ITEM_STATUSES[number]

export const TRANSACTION_TYPES = ["entrada", "saida"] as const
export const TRANSACTION_STATUSES = ["pendente", "pago", "cancelado"] as const

export const TRANSACTION_CATEGORIES = [
  "Recebimento", "Pagamento Fornecedor", "Material", "Mão de Obra",
  "Despesa Operacional", "Retirada de Pró Labore", "Outros",
] as const

export const SUPPLIER_CATEGORIES = [
  "Móveis", "Eletrodomésticos", "Material de Construção", "Mão de Obra",
  "Elétrica", "Pintura", "Vidros", "Pisos", "Outros",
] as const

export const PAYMENT_METHODS = [
  "Dinheiro", "PIX", "Cartão de Débito", "Cartão de Crédito",
  "Transferência", "Boleto", "Cheque", "Permuta/Troca", "Outro",
] as const

export const SOCIOS = ["Lucas Souza", "Lucas Valverde", "Edipho Silva"] as const
