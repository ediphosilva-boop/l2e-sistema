import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/local/daos/configuracoes_gerais_dao.dart';
import '../../../data/local/daos/precificacao_dao.dart';
import '../../ingredientes/application/ingredientes_providers.dart';

final precificacaoDaoProvider = Provider<PrecificacaoDao>((ref) {
  return ref.watch(appDatabaseProvider).precificacaoDao;
});

final configuracoesGeraisDaoProvider = Provider<ConfiguracoesGeraisDao>((ref) {
  return ref.watch(appDatabaseProvider).configuracoesGeraisDao;
});
