import 'package:drift/drift.dart';

import '../database.dart';
import '../tables.dart';

part 'precificacao_dao.g.dart';

@DriftAccessor(tables: [ConfiguracoesPrecificacao])
class PrecificacaoDao extends DatabaseAccessor<AppDatabase>
    with _$PrecificacaoDaoMixin {
  PrecificacaoDao(super.db);

  /// Última precificação salva para a receita, ou null se nunca foi salva.
  Future<ConfiguracaoPrecificacao?> buscarPorReceita(int receitaId) {
    return (select(
      configuracoesPrecificacao,
    )..where((t) => t.receitaId.equals(receitaId))).getSingleOrNull();
  }

  /// Salva (cria ou substitui) os parâmetros de precificação usados em uma
  /// receita, para que a tela possa ser reaberta depois com os mesmos
  /// valores.
  Future<void> salvar({
    required int receitaId,
    required double horasTrabalho,
    required double valorHora,
    required double custosFixosPercentual,
    required double margemLucroPercentual,
  }) {
    final dados = ConfiguracoesPrecificacaoCompanion.insert(
      receitaId: receitaId,
      horasTrabalho: Value(horasTrabalho),
      valorHora: Value(valorHora),
      custosFixosPercentual: Value(custosFixosPercentual),
      margemLucroPercentual: Value(margemLucroPercentual),
    );
    return into(configuracoesPrecificacao).insert(
      dados,
      onConflict: DoUpdate(
        (_) => dados,
        target: [configuracoesPrecificacao.receitaId],
      ),
    );
  }
}
