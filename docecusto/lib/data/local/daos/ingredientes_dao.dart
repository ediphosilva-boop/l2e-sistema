import 'package:drift/drift.dart';

import '../database.dart';
import '../tables.dart';

part 'ingredientes_dao.g.dart';

@DriftAccessor(tables: [Ingredientes])
class IngredientesDao extends DatabaseAccessor<AppDatabase>
    with _$IngredientesDaoMixin {
  IngredientesDao(super.db);

  /// Observa a lista de ingredientes ordenada por nome, com filtro opcional.
  Stream<List<Ingrediente>> observarTodos({String? filtro}) {
    final consulta = select(ingredientes)
      ..orderBy([(t) => OrderingTerm(expression: t.nome)]);
    final termo = filtro?.trim();
    if (termo != null && termo.isNotEmpty) {
      consulta.where((t) => t.nome.like('%$termo%'));
    }
    return consulta.watch();
  }

  Future<Ingrediente> criar(IngredientesCompanion dados) async {
    final id = await into(ingredientes).insert(dados);
    return (select(ingredientes)..where((t) => t.id.equals(id))).getSingle();
  }

  Future<bool> atualizar(Ingrediente ingrediente) {
    return update(
      ingredientes,
    ).replace(ingrediente.copyWith(atualizadoEm: DateTime.now()));
  }

  Future<int> excluir(int id) {
    return (delete(ingredientes)..where((t) => t.id.equals(id))).go();
  }
}
