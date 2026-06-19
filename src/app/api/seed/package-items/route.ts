import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const ESSENCIAL: Array<{ category: string; description: string; quantity: number; unitCost: number; order: number }> = [
  // ELÉTRICA
  { category: "Elétrica", description: "Mão de Obra",       quantity: 1, unitCost: 1000, order: 1010 },
  { category: "Elétrica", description: "Luminárias",         quantity: 1, unitCost:  100, order: 1020 },
  { category: "Elétrica", description: "Materiais",          quantity: 1, unitCost:  300, order: 1030 },
  // PINTURA
  { category: "Pintura",  description: "Mão de Obra",        quantity: 1, unitCost:  700, order: 2010 },
  { category: "Pintura",  description: "Tintas",             quantity: 1, unitCost:  400, order: 2020 },
  { category: "Pintura",  description: "Materiais",          quantity: 1, unitCost:  300, order: 2030 },
  // ACABAMENTOS
  { category: "Acabamentos", description: "Piso Vinílico Casal",   quantity: 1, unitCost:  850, order: 3010 },
  { category: "Acabamentos", description: "Piso Vinílico Solteiro", quantity: 1, unitCost:  600, order: 3020 },
  { category: "Acabamentos", description: "Box Banheiro",          quantity: 1, unitCost:  800, order: 3030 },
  { category: "Acabamentos", description: "Chuveiro",              quantity: 1, unitCost:  100, order: 3040 },
  { category: "Acabamentos", description: "Espelho Banheiro",      quantity: 1, unitCost:  100, order: 3050 },
  { category: "Acabamentos", description: "Assento Sanitário",     quantity: 1, unitCost:   50, order: 3060 },
  // ELETRODOMÉSTICOS
  { category: "Eletrodomésticos", description: "Geladeira",       quantity: 1, unitCost: 3000, order: 4010 },
  { category: "Eletrodomésticos", description: "Fogão",           quantity: 1, unitCost: 1500, order: 4020 },
  { category: "Eletrodomésticos", description: "Microondas",      quantity: 1, unitCost:  600, order: 4030 },
  { category: "Eletrodomésticos", description: "Depurador de Ar", quantity: 1, unitCost:  400, order: 4040 },
  // MÓVEIS
  { category: "Móveis", description: "Planejado Cozinha",  quantity: 1, unitCost: 2600, order: 5010 },
  { category: "Móveis", description: "Sofá",               quantity: 1, unitCost:  800, order: 5020 },
  { category: "Móveis", description: "Rack para TV",       quantity: 1, unitCost:  350, order: 5030 },
  { category: "Móveis", description: "Mesa de Jantar",     quantity: 1, unitCost: 1100, order: 5040 },
  { category: "Móveis", description: "Gabinete Banheiro",  quantity: 1, unitCost:  500, order: 5050 },
  { category: "Móveis", description: "Cama Baú Casal",     quantity: 1, unitCost: 1100, order: 5060 },
  { category: "Móveis", description: "Cama Baú Solteiro",  quantity: 1, unitCost:  900, order: 5070 },
  { category: "Móveis", description: "Roupeiro Casal",     quantity: 1, unitCost: 1900, order: 5080 },
  { category: "Móveis", description: "Roupeiro Solteiro",  quantity: 1, unitCost: 1900, order: 5090 },
]

const PREMIUM_EXTRA: typeof ESSENCIAL = [
  { category: "Eletrodomésticos", description: "Máquina Lava e Seca", quantity: 1, unitCost: 3000, order: 4050 },
  { category: "Eletrodomésticos", description: "TV Smart 50\"",        quantity: 1, unitCost: 2200, order: 4060 },
  { category: "Personalização",   description: "Fechadura Digital",    quantity: 1, unitCost:  300, order: 6010 },
  { category: "Personalização",   description: "Alexa",                quantity: 1, unitCost:  500, order: 6020 },
]

const PERSONALIZADO_EXTRA: typeof ESSENCIAL = [
  { category: "Eletrodomésticos", description: "Ar Condicionado Sala",           quantity: 1, unitCost: 2500, order: 4070 },
  { category: "Eletrodomésticos", description: "Ar Condicionado Quarto Casal",   quantity: 1, unitCost: 2500, order: 4080 },
  { category: "Eletrodomésticos", description: "Ar Condicionado Quarto Solteiro", quantity: 1, unitCost: 2500, order: 4090 },
  { category: "Móveis",           description: "Painel de TV",                   quantity: 1, unitCost:    0, order: 5100 },
  { category: "Móveis",           description: "Churrasqueira",                  quantity: 1, unitCost:    0, order: 5110 },
  { category: "Decoração",        description: "Tapete Sala",                    quantity: 1, unitCost:  500, order: 7010 },
  { category: "Decoração",        description: "Tapete Quartos",                 quantity: 1, unitCost:    0, order: 7020 },
  { category: "Decoração",        description: "Tapete Cozinha",                 quantity: 1, unitCost:  180, order: 7030 },
  { category: "Decoração",        description: "Jogo Americano",                 quantity: 1, unitCost:   26, order: 7040 },
  { category: "Decoração",        description: "Almofadas",                      quantity: 1, unitCost:    0, order: 7050 },
  { category: "Decoração",        description: "Jogo De Lençóis",               quantity: 1, unitCost:  230, order: 7060 },
  { category: "Decoração",        description: "Travesseiros",                   quantity: 1, unitCost:   50, order: 7070 },
  { category: "Decoração",        description: "Decoração de nicho",             quantity: 1, unitCost:  200, order: 7080 },
  { category: "Decoração",        description: "Cabeceira de Cama",              quantity: 1, unitCost:    0, order: 7090 },
  { category: "Decoração",        description: "Plantas decorativas",            quantity: 1, unitCost:  250, order: 7100 },
  { category: "Decoração",        description: "Espelho Sala",                   quantity: 1, unitCost:    0, order: 7110 },
  { category: "Decoração",        description: "Espelho Quarto",                 quantity: 1, unitCost:    0, order: 7120 },
  { category: "Decoração",        description: "Jogo Banheiro",                  quantity: 1, unitCost:  150, order: 7130 },
]

const ALL_SEEDS = [
  ...ESSENCIAL.map(i => ({ ...i, package: "Pacote Essencial" })),
  ...ESSENCIAL.map(i => ({ ...i, package: "Pacote Premium" })),
  ...PREMIUM_EXTRA.map(i => ({ ...i, package: "Pacote Premium" })),
  ...ESSENCIAL.map(i => ({ ...i, package: "Pacote Personalizado" })),
  ...PREMIUM_EXTRA.map(i => ({ ...i, package: "Pacote Personalizado" })),
  ...PERSONALIZADO_EXTRA.map(i => ({ ...i, package: "Pacote Personalizado" })),
]

export async function POST() {
  try {
    await prisma.packageItem.deleteMany()
    const result = await prisma.packageItem.createMany({ data: ALL_SEEDS })
    return NextResponse.json({ ok: true, created: result.count })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
