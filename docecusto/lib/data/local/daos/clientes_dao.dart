import 'package:drift/drift.dart';

import '../database.dart';
import '../tables.dart';

part 'clientes_dao.g.dart';

@DriftAccessor(tables: [Clientes])
class ClientesDao extends DatabaseAccessor<AppDatabase>
    with _$ClientesDaoMixin {
  ClientesDao(super.db);

  Stream<List<Cliente>> watchTodos() {
    final consulta = select(clientes)
      ..orderBy([(t) => OrderingTerm(expression: t.nome)]);
    return consulta.watch();
  }

  Future<Cliente> criar({required String nome, String? telefone}) async {
    final id = await into(
      clientes,
    ).insert(ClientesCompanion.insert(nome: nome, telefone: Value(telefone)));
    return (select(clientes)..where((t) => t.id.equals(id))).getSingle();
  }
}
