import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import '../../core/units/unidade_medida.dart';
import 'daos/clientes_dao.dart';
import 'daos/configuracoes_gerais_dao.dart';
import 'daos/ingredientes_dao.dart';
import 'daos/orcamentos_dao.dart';
import 'daos/precificacao_dao.dart';
import 'daos/receitas_dao.dart';
import 'tables.dart';

part 'database.g.dart';

@DriftDatabase(
  tables: [
    Ingredientes,
    Receitas,
    ReceitaIngredientes,
    ConfiguracoesPrecificacao,
    ConfiguracoesGerais,
    Clientes,
    Orcamentos,
    OrcamentoItens,
  ],
  daos: [
    IngredientesDao,
    ReceitasDao,
    PrecificacaoDao,
    ConfiguracoesGeraisDao,
    ClientesDao,
    OrcamentosDao,
  ],
)
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_abrirConexao());

  AppDatabase.paraTestes(super.connection);

  @override
  int get schemaVersion => 8;

  @override
  MigrationStrategy get migration => MigrationStrategy(
    onCreate: (m) => m.createAll(),
    onUpgrade: (m, from, to) async {
      if (from < 2) {
        // ingredienteId passou de "restrict" para "cascade" ao excluir; a
        // tabela precisa ser recriada porque o SQLite não altera FKs
        // existentes. A tabela ainda não era usada por nenhuma tela até a
        // versão 1, então não há dados a preservar.
        await m.deleteTable(receitaIngredientes.actualTableName);
        await m.createTable(receitaIngredientes);
      }
      if (from < 3) {
        await m.createTable(configuracoesGerais);
      }
      if (from < 4) {
        await m.addColumn(configuracoesGerais, configuracoesGerais.nomeNegocio);
      }
      if (from < 5) {
        // precoUnidade vira precoEmbalagem (o preço agora é o pago pela
        // embalagem inteira); quantidadeEmbalagem nova, com padrão 1 para
        // que ingredientes já cadastrados continuem com o mesmo preço por
        // unidade de medida (precoEmbalagem / 1 == precoUnidade antigo).
        await m.renameColumn(
          ingredientes,
          'preco_unidade',
          ingredientes.precoEmbalagem,
        );
        await m.addColumn(ingredientes, ingredientes.quantidadeEmbalagem);
      }
      if (from < 6) {
        await m.addColumn(
          configuracoesGerais,
          configuracoesGerais.telefoneNegocio,
        );
        await m.addColumn(
          configuracoesGerais,
          configuracoesGerais.enderecoNegocio,
        );
        await m.addColumn(
          configuracoesGerais,
          configuracoesGerais.redesSociaisNegocio,
        );
        await m.addColumn(
          configuracoesGerais,
          configuracoesGerais.logoNomeArquivo,
        );
      }
      if (from < 7) {
        await m.addColumn(
          configuracoesGerais,
          configuracoesGerais.descricaoNegocio,
        );
      }
      if (from < 8) {
        await m.addColumn(
          configuracoesPrecificacao,
          configuracoesPrecificacao.custoEmbalagem,
        );
      }
    },
  );
}

LazyDatabase _abrirConexao() {
  return LazyDatabase(() async {
    final pastaDocumentos = await getApplicationDocumentsDirectory();
    final arquivo = File(p.join(pastaDocumentos.path, 'docecusto.sqlite'));
    return NativeDatabase.createInBackground(arquivo);
  });
}
