import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import '../../core/units/unidade_medida.dart';
import 'daos/configuracoes_gerais_dao.dart';
import 'daos/ingredientes_dao.dart';
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
  daos: [IngredientesDao, ReceitasDao, PrecificacaoDao, ConfiguracoesGeraisDao],
)
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_abrirConexao());

  AppDatabase.paraTestes(super.connection);

  @override
  int get schemaVersion => 3;

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
