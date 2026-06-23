export interface DefaultItem { category: string; description: string; order: number }

export const DEFAULT_PACKAGE_ITEMS: Record<string, DefaultItem[]> = {
  "Pacote Essencial": [
    { category: "Elétrica",         description: "Mão de Obra",              order: 1010 },
    { category: "Elétrica",         description: "Luminárias",               order: 1020 },
    { category: "Elétrica",         description: "Chuveiro",                 order: 1030 },
    { category: "Elétrica",         description: "Materiais",                order: 1040 },
    { category: "Pintura",          description: "Mão de Obra",              order: 2010 },
    { category: "Pintura",          description: "Tintas",                   order: 2020 },
    { category: "Pintura",          description: "Materiais",                order: 2030 },
    { category: "Acabamentos",      description: "Piso Laminado Casal",      order: 3010 },
    { category: "Acabamentos",      description: "Piso Laminado Solteiro",   order: 3020 },
    { category: "Acabamentos",      description: "Box de Vidro",             order: 3030 },
    { category: "Acabamentos",      description: "Suportes Banheiro",        order: 3035 },
    { category: "Acabamentos",      description: "Espelho Banheiro",         order: 3050 },
    { category: "Acabamentos",      description: "Assento Sanitário",        order: 3060 },
    { category: "Eletrodomésticos", description: "Geladeira",                order: 4010 },
    { category: "Eletrodomésticos", description: "Fogão",                    order: 4020 },
    { category: "Eletrodomésticos", description: "Microondas",               order: 4030 },
    { category: "Eletrodomésticos", description: "Depurador de Ar",          order: 4040 },
    { category: "Móveis",           description: "Cama Casal",               order: 5010 },
    { category: "Móveis",           description: "Cama Solteiro",            order: 5020 },
    { category: "Móveis",           description: "Roupeiro Casal",           order: 5030 },
    { category: "Móveis",           description: "Roupeiro Solteiro",        order: 5040 },
    { category: "Móveis",           description: "Sofá",                     order: 5050 },
    { category: "Móveis",           description: "Planejados Cozinha",       order: 5060 },
    { category: "Móveis",           description: "Gabinete Banheiro",        order: 5070 },
    { category: "Móveis",           description: "Rack para TV",             order: 5075 },
    { category: "Móveis",           description: "Mesa com Cadeiras",        order: 5080 },
    { category: "Limpeza",          description: "Limpeza Final Pós-Obra",   order: 9010 },
  ],
  "Pacote Premium": [
    { category: "Elétrica",         description: "Mão de Obra",              order: 1010 },
    { category: "Elétrica",         description: "Luminárias",               order: 1020 },
    { category: "Elétrica",         description: "Chuveiro",                 order: 1030 },
    { category: "Elétrica",         description: "Materiais",                order: 1040 },
    { category: "Pintura",          description: "Mão de Obra",              order: 2010 },
    { category: "Pintura",          description: "Tintas",                   order: 2020 },
    { category: "Pintura",          description: "Materiais",                order: 2030 },
    { category: "Acabamentos",      description: "Piso Laminado Casal",      order: 3010 },
    { category: "Acabamentos",      description: "Piso Laminado Solteiro",   order: 3020 },
    { category: "Acabamentos",      description: "Box de Vidro",             order: 3030 },
    { category: "Acabamentos",      description: "Suportes Banheiro",        order: 3035 },
    { category: "Acabamentos",      description: "Espelho Banheiro",         order: 3050 },
    { category: "Acabamentos",      description: "Assento Sanitário",        order: 3060 },
    { category: "Eletrodomésticos", description: "Geladeira",                order: 4010 },
    { category: "Eletrodomésticos", description: "Fogão",                    order: 4020 },
    { category: "Eletrodomésticos", description: "Microondas",               order: 4030 },
    { category: "Eletrodomésticos", description: "Depurador de Ar",          order: 4040 },
    { category: "Eletrodomésticos", description: "TV Smart 50\"",            order: 4050 },
    { category: "Eletrodomésticos", description: "Máquina Lava e Seca",      order: 4060 },
    { category: "Móveis",           description: "Cama Casal",               order: 5010 },
    { category: "Móveis",           description: "Cama Solteiro",            order: 5020 },
    { category: "Móveis",           description: "Roupeiro Casal",           order: 5030 },
    { category: "Móveis",           description: "Roupeiro Solteiro",        order: 5040 },
    { category: "Móveis",           description: "Sofá",                     order: 5050 },
    { category: "Móveis",           description: "Planejados Cozinha",       order: 5060 },
    { category: "Móveis",           description: "Gabinete Banheiro",        order: 5070 },
    { category: "Móveis",           description: "Rack para TV",              order: 5075 },
    { category: "Móveis",           description: "Mesa com Cadeiras",        order: 5080 },
    { category: "Personalização",   description: "Fechadura Digital",        order: 6010 },
    { category: "Personalização",   description: "Alexa",                    order: 6020 },
    { category: "Limpeza",          description: "Limpeza Final Pós-Obra",   order: 9010 },
  ],
  "Pacote Personalizado": [
    { category: "Elétrica",         description: "Instalação elétrica",      order: 1010 },
    { category: "Pintura",          description: "Pintura",                  order: 2010 },
    { category: "Acabamentos",      description: "Acabamentos",              order: 3010 },
    { category: "Eletrodomésticos", description: "Eletrodomésticos",         order: 4010 },
    { category: "Móveis",           description: "Móveis",                   order: 5010 },
    { category: "Limpeza",          description: "Limpeza Final Pós-Obra",   order: 9010 },
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
