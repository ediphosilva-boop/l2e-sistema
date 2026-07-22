import 'package:drift/drift.dart';

import '../../core/units/unidade_medida.dart';

/// Ingredientes cadastrados pela confeiteira, com o preço pago pela
/// embalagem inteira (ex: R$ 8,00 por uma garrafa de 900 ml de óleo). O
/// preço por unidade de medida (usado no cálculo de custo das receitas) é
/// derivado dividindo [precoEmbalagem] por [quantidadeEmbalagem].
class Ingredientes extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get nome => text().withLength(min: 1, max: 120)();
  TextColumn get unidadeMedida => textEnum<UnidadeMedida>()();
  RealColumn get quantidadeEmbalagem => real().withDefault(const Constant(1))();
  RealColumn get precoEmbalagem => real()();
  DateTimeColumn get criadoEm => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get atualizadoEm =>
      dateTime().withDefault(currentDateAndTime)();
}

/// Receitas cadastradas, com rendimento (quantas porções/unidades produz).
class Receitas extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get nome => text().withLength(min: 1, max: 120)();
  TextColumn get modoPreparo => text().nullable()();
  IntColumn get rendimento => integer().withDefault(const Constant(1))();
  IntColumn get tempoPreparoMinutos => integer().nullable()();
  DateTimeColumn get criadoEm => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get atualizadoEm =>
      dateTime().withDefault(currentDateAndTime)();
}

/// Associação receita <-> ingrediente com a quantidade utilizada, permitindo
/// calcular o custo total proporcional da receita.
class ReceitaIngredientes extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get receitaId =>
      integer().references(Receitas, #id, onDelete: KeyAction.cascade)();
  // cascade: excluir um ingrediente remove seu uso das receitas (a usuária
  // é avisada e precisa confirmar antes disso na tela de Ingredientes).
  IntColumn get ingredienteId =>
      integer().references(Ingredientes, #id, onDelete: KeyAction.cascade)();
  RealColumn get quantidade => real()();
  TextColumn get unidadeMedida => textEnum<UnidadeMedida>()();
}

/// Parâmetros de precificação de uma receita: horas de trabalho, valor/hora,
/// percentual de custos fixos e margem de lucro desejada.
@DataClassName('ConfiguracaoPrecificacao')
class ConfiguracoesPrecificacao extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get receitaId => integer()
      .references(Receitas, #id, onDelete: KeyAction.cascade)
      .unique()();
  RealColumn get horasTrabalho => real().withDefault(const Constant(0))();
  RealColumn get valorHora => real().withDefault(const Constant(0))();
  RealColumn get custosFixosPercentual =>
      real().withDefault(const Constant(0))();
  RealColumn get margemLucroPercentual =>
      real().withDefault(const Constant(50))();
}

/// Configurações gerais do app (linha única, id fixo = 1). Guarda o valor
/// padrão da hora de trabalho e o perfil do negócio (nome, logo, contato),
/// reaproveitados ao precificar receitas e gerar orçamentos em PDF.
@DataClassName('ConfiguracaoGeral')
class ConfiguracoesGerais extends Table {
  IntColumn get id => integer()();
  RealColumn get valorHoraPadrao => real().nullable()();
  TextColumn get nomeNegocio => text().nullable()();
  TextColumn get telefoneNegocio => text().nullable()();
  TextColumn get enderecoNegocio => text().nullable()();
  TextColumn get redesSociaisNegocio => text().nullable()();
  // Guarda só o nome do arquivo (não o caminho absoluto): no iOS o
  // diretório do app pode mudar de UUID entre atualizações, então o
  // caminho completo é sempre remontado na hora de ler/exibir o logo.
  TextColumn get logoNomeArquivo => text().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Clientes usados na geração de orçamentos.
class Clientes extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get nome => text().withLength(min: 1, max: 120)();
  TextColumn get telefone => text().nullable()();
  TextColumn get email => text().nullable()();
  TextColumn get endereco => text().nullable()();
}

/// Orçamento gerado para um cliente, exportável em PDF.
class Orcamentos extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get clienteId =>
      integer().references(Clientes, #id, onDelete: KeyAction.restrict)();
  DateTimeColumn get criadoEm => dateTime().withDefault(currentDateAndTime)();
  IntColumn get validadeDias => integer().withDefault(const Constant(7))();
  TextColumn get observacoes => text().nullable()();
}

/// Itens de um orçamento (normalmente vinculados a uma receita precificada).
class OrcamentoItens extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get orcamentoId =>
      integer().references(Orcamentos, #id, onDelete: KeyAction.cascade)();
  IntColumn get receitaId => integer().nullable().references(
    Receitas,
    #id,
    onDelete: KeyAction.setNull,
  )();
  TextColumn get descricao => text()();
  RealColumn get quantidade => real().withDefault(const Constant(1))();
  RealColumn get precoUnitario => real()();
}
