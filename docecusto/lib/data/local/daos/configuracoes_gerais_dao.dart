import 'package:drift/drift.dart';

import '../database.dart';
import '../tables.dart';

part 'configuracoes_gerais_dao.g.dart';

@DriftAccessor(tables: [ConfiguracoesGerais])
class ConfiguracoesGeraisDao extends DatabaseAccessor<AppDatabase>
    with _$ConfiguracoesGeraisDaoMixin {
  ConfiguracoesGeraisDao(super.db);

  static const _idSingleton = 1;

  /// Valor/hora padrão já definido pela usuária, ou null se ainda não foi
  /// configurado (a tela de Precificação pede para defini-lo nesse caso).
  Future<double?> buscarValorHoraPadrao() async {
    final linha = await (select(
      configuracoesGerais,
    )..where((t) => t.id.equals(_idSingleton))).getSingleOrNull();
    return linha?.valorHoraPadrao;
  }

  Future<void> definirValorHoraPadrao(double valor) {
    return into(configuracoesGerais).insertOnConflictUpdate(
      ConfiguracoesGeraisCompanion.insert(
        id: const Value(_idSingleton),
        valorHoraPadrao: Value(valor),
      ),
    );
  }

  /// Nome do negócio já definido pela usuária, ou null se ainda não foi
  /// configurado (a tela de Orçamentos pede para defini-lo nesse caso, para
  /// usar no cabeçalho do PDF).
  Future<String?> buscarNomeNegocio() async {
    final linha = await (select(
      configuracoesGerais,
    )..where((t) => t.id.equals(_idSingleton))).getSingleOrNull();
    return linha?.nomeNegocio;
  }

  Future<void> definirNomeNegocio(String nome) {
    return into(configuracoesGerais).insertOnConflictUpdate(
      ConfiguracoesGeraisCompanion.insert(
        id: const Value(_idSingleton),
        nomeNegocio: Value(nome),
      ),
    );
  }
}
