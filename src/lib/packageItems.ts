export interface DefaultItem { category: string; description: string; order: number }

export const DEFAULT_PACKAGE_ITEMS: Record<string, DefaultItem[]> = {
  "Pacote Essencial": [
    { category: "Elétrica",         description: "Instalação elétrica completa",         order: 10 },
    { category: "Pintura",          description: "Pintura PVA + acabamento",              order: 20 },
    { category: "Acabamentos",      description: "Piso vinílico em manta",                order: 30 },
    { category: "Acabamentos",      description: "Box banheiro em vidro + acessórios",    order: 31 },
    { category: "Móveis",           description: "Cama casal",                            order: 40 },
    { category: "Móveis",           description: "Guarda-roupas 6 portas",               order: 41 },
    { category: "Móveis",           description: "Rack TV",                               order: 42 },
    { category: "Eletrodomésticos", description: "Geladeira",                             order: 50 },
    { category: "Eletrodomésticos", description: "Fogão",                                 order: 51 },
    { category: "Eletrodomésticos", description: "Microondas",                            order: 52 },
    { category: "Eletrodomésticos", description: "Depurador",                             order: 53 },
    { category: "Limpeza",          description: "Limpeza final pós-obra",                order: 60 },
  ],
  "Pacote Premium": [
    { category: "Elétrica",         description: "Instalação elétrica completa",          order: 10 },
    { category: "Pintura",          description: "Pintura PVA + acabamento",              order: 20 },
    { category: "Acabamentos",      description: "Piso vinílico em manta",                order: 30 },
    { category: "Acabamentos",      description: "Box banheiro em vidro + acessórios",    order: 31 },
    { category: "Acabamentos",      description: "Gabinete banheiro suspenso",            order: 32 },
    { category: "Acabamentos",      description: "Torneira gourmet monocomando",          order: 33 },
    { category: "Móveis",           description: "Cama casal",                            order: 40 },
    { category: "Móveis",           description: "Guarda-roupas 6 portas",               order: 41 },
    { category: "Móveis",           description: "Rack TV",                               order: 42 },
    { category: "Móveis",           description: "Sofá retrátil 2 lugares",              order: 43 },
    { category: "Móveis",           description: "Mesa de jantar 4 lugares",              order: 44 },
    { category: "Móveis",           description: "Cabeceira modular 140cm + mesinha",    order: 45 },
    { category: "Móveis",           description: "Planejados cozinha completo",           order: 46 },
    { category: "Eletrodomésticos", description: "Geladeira",                             order: 50 },
    { category: "Eletrodomésticos", description: "Fogão",                                 order: 51 },
    { category: "Eletrodomésticos", description: "Microondas",                            order: 52 },
    { category: "Eletrodomésticos", description: "Depurador",                             order: 53 },
    { category: "Eletrodomésticos", description: "TV Smart 50\" Philips 4K Google TV",   order: 54 },
    { category: "Eletrodomésticos", description: "Máquina Lava e Seca 11kg",             order: 55 },
    { category: "Eletrodomésticos", description: "Ar Condicionado 9.000 BTU Inverter",   order: 56 },
    { category: "Personalização",   description: "Fechadura digital Intelbras",           order: 60 },
    { category: "Personalização",   description: "Tapete sala + kit almofadas + quadros", order: 61 },
    { category: "Limpeza",          description: "Limpeza final pós-obra",                order: 70 },
  ],
  "Pacote Personalizado": [
    { category: "Elétrica",         description: "Instalação elétrica",                   order: 10 },
    { category: "Pintura",          description: "Pintura",                               order: 20 },
    { category: "Acabamentos",      description: "Acabamentos",                           order: 30 },
    { category: "Móveis",           description: "Móveis planejados",                    order: 40 },
    { category: "Eletrodomésticos", description: "Eletrodomésticos",                     order: 50 },
    { category: "Limpeza",          description: "Limpeza final pós-obra",               order: 60 },
  ],
}

export function addBusinessDays(start: Date, days: number): Date {
  let count = 0
  const d = new Date(start)
  while (count < days) {
    d.setDate(d.getDate() + 1)
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) count++
  }
  return d
}

export function businessDaysRemaining(deliveryDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (deliveryDate <= today) return 0
  let count = 0
  const d = new Date(today)
  while (d < deliveryDate) {
    d.setDate(d.getDate() + 1)
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) count++
  }
  return count
}
