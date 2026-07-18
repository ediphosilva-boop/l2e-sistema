import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import '../../core/units/unidade_medida.dart';
import 'daos/ingredientes_dao.dart';
import 'tables.dart';

part 'database.g.dart';

@DriftDatabase(
  tables: [
    Ingredientes,
    Receitas,
    ReceitaIngredientes,
    ConfiguracoesPrecificacao,
    Clientes,
    Orcamentos,
    OrcamentoItens,
  ],
  daos: [IngredientesDao],
)
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_abrirConexao());

  AppDatabase.paraTestes(super.connection);

  @override
  int get schemaVersion => 1;
}

LazyDatabase _abrirConexao() {
  return LazyDatabase(() async {
    final pastaDocumentos = await getApplicationDocumentsDirectory();
    final arquivo = File(p.join(pastaDocumentos.path, 'docecusto.sqlite'));
    return NativeDatabase.createInBackground(arquivo);
  });
}
