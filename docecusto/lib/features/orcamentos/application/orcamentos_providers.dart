import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/local/daos/clientes_dao.dart';
import '../../../data/local/daos/orcamentos_dao.dart';
import '../../../data/local/database.dart';
import '../../ingredientes/application/ingredientes_providers.dart';

final clientesDaoProvider = Provider<ClientesDao>((ref) {
  return ref.watch(appDatabaseProvider).clientesDao;
});

final orcamentosDaoProvider = Provider<OrcamentosDao>((ref) {
  return ref.watch(appDatabaseProvider).orcamentosDao;
});

/// Lista de clientes cadastrados, para o seletor da tela de novo orçamento.
final listaClientesProvider = StreamProvider.autoDispose<List<Cliente>>((ref) {
  return ref.watch(clientesDaoProvider).watchTodos();
});

/// Termo de busca digitado pela usuária no histórico de orçamentos.
final buscaOrcamentosProvider = StateProvider<String>((ref) => '');

/// Histórico de orçamentos (mais recentes primeiro), filtrado pelo nome do
/// cliente e atualizado em tempo real.
final historicoOrcamentosProvider =
    StreamProvider.autoDispose<List<OrcamentoResumo>>((ref) {
      final dao = ref.watch(orcamentosDaoProvider);
      final termo = ref.watch(buscaOrcamentosProvider);
      return dao.watchHistorico(filtro: termo);
    });
