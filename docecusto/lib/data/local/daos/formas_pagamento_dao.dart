import 'package:drift/drift.dart';

import '../database.dart';
import '../tables.dart';

part 'formas_pagamento_dao.g.dart';

@DriftAccessor(tables: [FormasPagamento])
class FormasPagamentoDao extends DatabaseAccessor<AppDatabase>
    with _$FormasPagamentoDaoMixin {
  FormasPagamentoDao(super.db);

  Stream<List<FormaPagamento>> watchTodas() {
    final consulta = select(formasPagamento)
      ..orderBy([(t) => OrderingTerm(expression: t.nome)]);
    return consulta.watch();
  }

  Future<FormaPagamento> criar({
    required String nome,
    double descontoPercentual = 0,
  }) async {
    final id = await into(formasPagamento).insert(
      FormasPagamentoCompanion.insert(
        nome: nome,
        descontoPercentual: Value(descontoPercentual),
      ),
    );
    return (select(formasPagamento)..where((t) => t.id.equals(id))).getSingle();
  }
}
