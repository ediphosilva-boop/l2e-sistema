export const PROJECT_STATUSES = ["orcamento", "contrato", "execucao", "entregue", "cancelado"] as const
export type ProjectStatus = typeof PROJECT_STATUSES[number]

export const ITEM_STATUSES = ["pendente", "comprado", "entregue", "instalado", "naoaplica"] as const
export type ItemStatus = typeof ITEM_STATUSES[number]

export const TRANSACTION_TYPES = ["entrada", "saida"] as const
export const TRANSACTION_STATUSES = ["pendente", "pago", "confirmacao", "cancelado"] as const

export const TRANSACTION_CATEGORIES = [
  "Recebimento de Cliente (Projeto)",
  "Recebimento em Bens (Dação em Pagamento)",
  "Venda de Ativo Recebido em Pagamento",
  "Reembolso de Terceiros",
  "Transferência entre Projetos",
  "Prestação de Serviços",
  "Pagamento Fornecedor",
  "Material",
  "Mão de Obra",
  "Despesa Operacional",
  "Retirada de Pró Labore",
  "Aquisição de Ativo Imobilizado (Veículos)",
  "Baixa de Ativo Recebido em Pagamento",
  "Perda na Alienação de Ativo",
  "Ajuste de Caixa / Conciliação",
  "Outros",
] as const

export const BANK_ACCOUNTS = ["Conta PJ Principal", "Conta Pessoal", "Espécie", "Outra"] as const

export const ENTRADA_CATEGORIES = [
  "Recebimento de Cliente (Projeto)",
  "Recebimento em Bens (Dação em Pagamento)",
  "Venda de Ativo Recebido em Pagamento",
  "Reembolso de Terceiros",
  "Transferência entre Projetos",
  "Outros",
] as const

export const SAIDA_CATEGORIES = [
  "Prestação de Serviços",
  "Pagamento Fornecedor",
  "Material",
  "Mão de Obra",
  "Despesa Operacional",
  "Retirada de Pró Labore",
  "Aquisição de Ativo Imobilizado (Veículos)",
  "Baixa de Ativo Recebido em Pagamento",
  "Perda na Alienação de Ativo",
  "Ajuste de Caixa / Conciliação",
  "Transferência entre Projetos",
  "Outros",
] as const

export const CATEGORIES_BY_TYPE: Record<string, readonly string[]> = {
  entrada: ENTRADA_CATEGORIES,
  saida: SAIDA_CATEGORIES,
}

// Categorias que não são dinheiro real (registro contábil de um bem recebido em dação e sua baixa
// posterior — nenhuma das duas pernas é caixa; só "Venda de Ativo Recebido em Pagamento" é)
export const NON_CASH_CATEGORIES = [
  "Recebimento em Bens (Dação em Pagamento)",
  "Baixa de Ativo Recebido em Pagamento",
  "Perda na Alienação de Ativo",
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
