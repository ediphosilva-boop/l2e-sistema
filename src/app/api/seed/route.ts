import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    // Limpa o banco
    await prisma.contract.deleteMany()
    await prisma.transaction.deleteMany()
    await prisma.projectItem.deleteMany()
    await prisma.project.deleteMany()
    await prisma.client.deleteMany()
    await prisma.supplier.deleteMany()
    await prisma.product.deleteMany()
    await prisma.service.deleteMany()
    await prisma.user.deleteMany()

    const adminHash = await bcrypt.hash("l2e@2026", 10)
    const vendedorHash = await bcrypt.hash("l2e@2026", 10)

    // Usuários
    await prisma.user.createMany({
      data: [
        { email: "lucas@l2eprime.com.br", name: "Lucas Souza", role: "admin", password: adminHash },
        { email: "comercial@l2eprime.com.br", name: "Equipe Comercial", role: "vendedor", password: vendedorHash },
      ],
    })

    // Clientes
    const caju = await prisma.client.create({
      data: {
        name: "Cajú e Família",
        email: "caju@email.com",
        phone: "(11) 99000-0001",
        address: "Complexo Residencial Cajú, São Paulo - SP",
        notes: "19 unidades — mix de 1 e 2 dormitórios. Desconto de R$ 100.000 aplicado.",
      },
    })

    const red73Client = await prisma.client.create({
      data: {
        name: "Investidor RED 73",
        phone: "(11) 99000-0002",
        address: "Rua Ingaíbos, 73 — Vila Formosa, São Paulo",
      },
    })

    const red687Client = await prisma.client.create({
      data: {
        name: "Grupo Investidores RED 687",
        phone: "(11) 99000-0003",
        address: "Itaquera, São Paulo - SP",
        notes: "Grupo com 19 unidades no RED 687 Itaquera",
      },
    })

    // Fornecedores
    const leoMadeiras = await prisma.supplier.create({
      data: {
        name: "Leo Madeiras",
        cnpj: "12.345.678/0001-90",
        contactName: "Leonardo de Camargo Valverde",
        phone: "(11) 3000-1234",
        email: "leo@leomadeiras.com.br",
        category: "Móveis",
        paymentTerms: "30/60/90 dias",
      },
    })

    await prisma.supplier.createMany({
      data: [
        {
          name: "Electrolux Distribuidora",
          category: "Eletrodomésticos",
          phone: "(11) 3000-2222",
          paymentTerms: "30 dias",
        },
        {
          name: "Cerâmica São Paulo",
          category: "Material de Construção",
          phone: "(11) 3000-3333",
          paymentTerms: "À vista",
        },
        {
          name: "MO Express — Montagem",
          category: "Mão de Obra",
          contactName: "Carlos Monteiro",
          phone: "(11) 97777-0001",
          paymentTerms: "Por empreitada",
        },
        {
          name: "Tintas Suvinil",
          category: "Material de Construção",
          phone: "(11) 3000-4444",
          paymentTerms: "À vista",
        },
      ],
    })

    // Produtos
    await prisma.product.createMany({
      data: [
        { name: "TV Smart 50\" Philips 4K Google TV",    category: "Eletrodomésticos", marketPrice: 2200, costPrice: 1800, unit: "un", description: "Philips 50PUG7908 4K Ultra HD com Google TV" },
        { name: "Geladeira Electrolux Frost Free 320L",   category: "Eletrodomésticos", marketPrice: 3000, costPrice: 2400, unit: "un", description: "Duplex Inox DFX41" },
        { name: "Fogão Consul 4 Bocas",                   category: "Eletrodomésticos", marketPrice: 1500, costPrice: 1100, unit: "un", description: "4 bocas com acendimento automático" },
        { name: "Máquina Lava e Seca 11kg",               category: "Eletrodomésticos", marketPrice: 3000, costPrice: 2500, unit: "un", description: "Samsung WD11BB" },
        { name: "Microondas 30L Electrolux",              category: "Eletrodomésticos", marketPrice: 600,  costPrice: 450,  unit: "un" },
        { name: "Ar Condicionado 9.000 BTU Inverter",     category: "Eletrodomésticos", marketPrice: 2500, costPrice: 2000, unit: "un", description: "Split Inverter Frio/Quente" },
        { name: "Depurador de Ar SUGGAR 80cm",            category: "Eletrodomésticos", marketPrice: 400,  costPrice: 280,  unit: "un", description: "3 velocidades, 80cm, dupla filtração" },
        { name: "Sofá Retrátil Reclinável 2 lug. 1,70m",  category: "Móveis",           marketPrice: 800,  costPrice: 580,  unit: "un", description: "Suede Bege" },
        { name: "Rack TV Suspenso Alure 1,80m",           category: "Móveis",           marketPrice: 350,  costPrice: 220,  unit: "un" },
        { name: "Cama Box Casal Ortopédica D23",          category: "Móveis",           marketPrice: 1100, costPrice: 800,  unit: "un", description: "56x138x188cm com box baú" },
        { name: "Cama Box Solteiro D23",                  category: "Móveis",           marketPrice: 900,  costPrice: 650,  unit: "un", description: "88x188cm" },
        { name: "Guarda-roupas 6 Portas",                 category: "Móveis",           marketPrice: 1900, costPrice: 1400, unit: "un" },
        { name: "Planejado Cozinha Completo",              category: "Móveis",           marketPrice: 2600, costPrice: 1900, unit: "un", description: "Gabinete + armários suspensos" },
        { name: "Mesa Jantar 4 Lugares",                  category: "Móveis",           marketPrice: 1100, costPrice: 750,  unit: "un" },
        { name: "Mesa de Cabeceira Max",                  category: "Móveis",           marketPrice: 180,  costPrice: 110,  unit: "un", description: "30x26cm, 57cm altura" },
        { name: "Kit Cabeceira Modular 140cm",            category: "Móveis",           marketPrice: 420,  costPrice: 280,  unit: "un", description: "7 módulos 45x20cm" },
        { name: "Gabinete Banheiro Suspenso 100cm",       category: "Móveis",           marketPrice: 650,  costPrice: 420,  unit: "un", description: "1 porta, 3 gavetas" },
        { name: "Piso Vinílico em Manta (m²)",            category: "Acabamentos",      marketPrice: 85,   costPrice: 60,   unit: "m²", description: "Carvalho Wood, hipoalergênico" },
        { name: "Piso Laminado Quarto (m²)",              category: "Acabamentos",      marketPrice: 70,   costPrice: 48,   unit: "m²" },
        { name: "Box Banheiro em Vidro",                  category: "Acabamentos",      marketPrice: 800,  costPrice: 580,  unit: "un" },
        { name: "Kit Acessórios Banheiro Luxo (6 pcs)",  category: "Acabamentos",      marketPrice: 280,  costPrice: 180,  unit: "kit" },
        { name: "Torneira Gourmet Monocomando Black",     category: "Acabamentos",      marketPrice: 320,  costPrice: 210,  unit: "un", description: "50cm, 360°, arejador econômico" },
        { name: "Fechadura Digital Intelbras Touch",      category: "Personalização",   marketPrice: 300,  costPrice: 200,  unit: "un", description: "Touch Screen sobrepor, esquerda/direita" },
        { name: "Alexa Echo Pop",                         category: "Personalização",   marketPrice: 500,  costPrice: 380,  unit: "un" },
        { name: "Tapete Sala",                            category: "Decoração",        marketPrice: 180,  costPrice: 110,  unit: "un" },
        { name: "Kit Almofadas (4 pcs)",                  category: "Decoração",        marketPrice: 120,  costPrice: 70,   unit: "kit" },
        { name: "Jogo de Lençol Queen",                   category: "Decoração",        marketPrice: 150,  costPrice: 90,   unit: "un" },
        { name: "Quadros Decorativos (kit 3)",            category: "Decoração",        marketPrice: 200,  costPrice: 120,  unit: "kit" },
        { name: "Luminária de Teto LED",                  category: "Elétrica",         marketPrice: 100,  costPrice: 60,   unit: "un" },
      ],
    })

    // Serviços
    await prisma.service.createMany({
      data: [
        { name: "Instalação Elétrica Completa",  category: "Elétrica",      laborCost: 1000, description: "Fiação, tomadas, luminárias" },
        { name: "Pintura Completa Apartamento",  category: "Pintura",       laborCost: 700,  description: "Paredes e teto — 2 demãos PVA + acabamento" },
        { name: "Aplicação Piso Vinílico",       category: "Instalação",    laborCost: 400,  description: "Por apartamento" },
        { name: "Aplicação Piso Laminado",       category: "Instalação",    laborCost: 350,  description: "Quartos" },
        { name: "Instalação Box Banheiro",       category: "Instalação",    laborCost: 200 },
        { name: "Instalação Gabinete Banheiro",  category: "Instalação",    laborCost: 150 },
        { name: "Montagem Móveis Planejados",    category: "Montagem",      laborCost: 600,  description: "Cozinha + quartos" },
        { name: "Montagem Camas e Estofados",    category: "Montagem",      laborCost: 250 },
        { name: "Instalação Eletrodomésticos",   category: "Instalação",    laborCost: 300,  description: "Geladeira, fogão, lava-seca, microondas" },
        { name: "Instalação Ar Condicionado",    category: "Instalação",    laborCost: 350,  description: "Split — por unidade" },
        { name: "Instalação Fechadura Digital",  category: "Instalação",    laborCost: 80 },
        { name: "Aplicação Acabamentos Gerais",  category: "Acabamentos",   laborCost: 400,  description: "Rodapés, silicone, ajustes finais" },
        { name: "Limpeza Final (pós-obra)",      category: "Acabamentos",   laborCost: 350 },
      ],
    })

    // Projetos
    const projetoCaju = await prisma.project.create({
      data: {
        name: "RED Cajú e Família — 19 Unidades",
        address: "Complexo Residencial Cajú, São Paulo - SP",
        clientId: caju.id,
        status: "execucao",
        totalValue: 846035.99,
        startDate: new Date("2026-03-01"),
        deliveryDate: new Date("2026-07-31"),
        stepEletrica: "instalado",
        stepPintura: "instalado",
        stepAcabamentos: "entregue",
        stepMoveis: "comprado",
        stepEletrodomesticos: "comprado",
        stepPersonalizacao: "pendente",
        notes: "Pacote Premium. Desconto de R$ 100.000 aplicado. Preço médio por unidade: R$ 44.528.",
      },
    })

    const projetoRed73 = await prisma.project.create({
      data: {
        name: "RED 73 — Residencial Ingaíbos",
        address: "Rua Ingaíbos, 73 — Vila Formosa, São Paulo",
        clientId: red73Client.id,
        status: "contrato",
        totalValue: 44800,
        startDate: new Date("2026-05-15"),
        deliveryDate: new Date("2026-06-20"),
        stepEletrica: "instalado",
        stepPintura: "instalado",
        stepAcabamentos: "instalado",
        stepMoveis: "entregue",
        stepEletrodomesticos: "comprado",
        stepPersonalizacao: "pendente",
        notes: "Pacote Personalizado Premium — 1 dormitório.",
      },
    })

    await prisma.project.create({
      data: {
        name: "RED 687 — Itaquera (Lote 1)",
        address: "Rua Itaquera, 687 — Itaquera, São Paulo",
        clientId: red687Client.id,
        status: "execucao",
        totalValue: 356000,
        startDate: new Date("2026-04-01"),
        deliveryDate: new Date("2026-08-30"),
        stepEletrica: "instalado",
        stepPintura: "entregue",
        stepAcabamentos: "comprado",
        stepMoveis: "comprado",
        stepEletrodomesticos: "pendente",
        stepPersonalizacao: "pendente",
        notes: "8 unidades (Apto 87, 88, 91, 92, 93, 96, 97, 98). Progresso médio 60%.",
      },
    })

    // Transações (histórico realista)
    const now = new Date()
    const m = (months: number) => new Date(now.getFullYear(), now.getMonth() + months, 15)
    const d = (days: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + days)

    await prisma.transaction.createMany({
      data: [
        // Entradas (recebimentos)
        {
          type: "entrada", category: "Recebimento",
          description: "Entrada contrato — Cajú e Família (50%)",
          amount: 423017.99, status: "pago",
          paidDate: new Date("2026-03-02"),
          dueDate: new Date("2026-03-02"),
          projectId: projetoCaju.id, clientId: caju.id,
        },
        {
          type: "entrada", category: "Recebimento",
          description: "Sinal RED 73 — Pacote Premium (50%)",
          amount: 22400, status: "pago",
          paidDate: new Date("2026-05-16"),
          dueDate: new Date("2026-05-16"),
          projectId: projetoRed73.id, clientId: red73Client.id,
        },
        {
          type: "entrada", category: "Recebimento",
          description: "Parcela final RED 73 (50%)",
          amount: 22400, status: "pendente",
          dueDate: d(10),
          projectId: projetoRed73.id, clientId: red73Client.id,
        },
        {
          type: "entrada", category: "Recebimento",
          description: "Entrada RED 687 — Lote 1 (50%)",
          amount: 178000, status: "pago",
          paidDate: new Date("2026-04-02"),
          dueDate: new Date("2026-04-02"),
          projectId: projetoRed73.id, clientId: red687Client.id,
        },
        {
          type: "entrada", category: "Recebimento",
          description: "Parcela final RED 687 (50%)",
          amount: 178000, status: "pendente",
          dueDate: m(2),
        },
        {
          type: "entrada", category: "Recebimento",
          description: "Parcela final Cajú e Família (50%)",
          amount: 423017.99, status: "pendente",
          dueDate: m(1),
          projectId: projetoCaju.id, clientId: caju.id,
        },

        // Saídas (pagamentos)
        {
          type: "saida", category: "Pagamento Fornecedor",
          description: "Leo Madeiras — 7 Geladeiras (1ª parcela)",
          amount: 7000, status: "pago",
          paidDate: new Date("2026-04-09"),
          dueDate: new Date("2026-04-09"),
          supplierId: leoMadeiras.id,
          projectId: projetoCaju.id,
        },
        {
          type: "saida", category: "Pagamento Fornecedor",
          description: "Leo Madeiras — 7 Geladeiras (2ª parcela)",
          amount: 7000, status: "pago",
          paidDate: new Date("2026-05-09"),
          dueDate: new Date("2026-05-09"),
          supplierId: leoMadeiras.id,
          projectId: projetoCaju.id,
        },
        {
          type: "saida", category: "Pagamento Fornecedor",
          description: "Leo Madeiras — 7 Geladeiras (3ª parcela)",
          amount: 7000, status: "pendente",
          dueDate: d(3),
          supplierId: leoMadeiras.id,
          projectId: projetoCaju.id,
        },
        {
          type: "saida", category: "Pagamento Fornecedor",
          description: "Leo Madeiras — Sofás e Racks (4 sofás 1,90m + 1 sofá 1,4m)",
          amount: 5200, status: "pago",
          paidDate: new Date("2026-04-15"),
          dueDate: new Date("2026-04-15"),
          supplierId: leoMadeiras.id,
          projectId: projetoCaju.id,
        },
        {
          type: "saida", category: "Mão de Obra",
          description: "MO Express — Montagem móveis Cajú (1ª fase)",
          amount: 8500, status: "pago",
          paidDate: new Date("2026-05-20"),
          dueDate: new Date("2026-05-20"),
          projectId: projetoCaju.id,
        },
        {
          type: "saida", category: "Mão de Obra",
          description: "Pintura RED 687 — 8 unidades",
          amount: 5600, status: "pago",
          paidDate: new Date("2026-04-25"),
          dueDate: new Date("2026-04-25"),
          projectId: projetoRed73.id,
        },
        {
          type: "saida", category: "Material",
          description: "Tintas Suvinil — 19 unidades Cajú",
          amount: 7600, status: "pago",
          paidDate: new Date("2026-03-10"),
          dueDate: new Date("2026-03-10"),
          projectId: projetoCaju.id,
        },
        {
          type: "saida", category: "Pagamento Fornecedor",
          description: "Electrolux — TVs e eletros RED 687",
          amount: 18400, status: "pendente",
          dueDate: d(7),
          projectId: projetoRed73.id,
        },
        {
          type: "saida", category: "Despesa Operacional",
          description: "Aluguel escritório — Junho/2026",
          amount: 2800, status: "pendente",
          dueDate: d(1),
        },
        {
          type: "saida", category: "Despesa Operacional",
          description: "Combustível e logística — Maio/2026",
          amount: 1200, status: "pago",
          paidDate: new Date("2026-05-30"),
          dueDate: new Date("2026-05-30"),
        },
      ],
    })

    // Contratos
    await prisma.contract.createMany({
      data: [
        {
          projectId: projetoCaju.id,
          clientId: caju.id,
          type: "contrato",
          title: "Contrato de Serviços — Cajú e Família (19 unidades)",
          status: "assinado",
          signedAt: new Date("2026-03-02"),
          contentJson: JSON.stringify({
            value: 846035.99,
            units: 19,
            package: "Premium",
            payment: "50% entrada + 50% entrega",
            discount: 100000,
          }),
        },
        {
          projectId: projetoRed73.id,
          clientId: red73Client.id,
          type: "proposta",
          title: "Proposta Comercial — RED 73 Ingaíbos (Pacote Premium)",
          status: "assinado",
          signedAt: new Date("2026-05-14"),
          contentJson: JSON.stringify({
            value: 44800,
            units: 1,
            package: "Personalizado Premium",
            payment: "50% entrada + 50% entrega",
          }),
        },
      ],
    })

    return NextResponse.json({ success: true, message: "Dados de demonstração criados com sucesso!" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
