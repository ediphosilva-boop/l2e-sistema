import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/local/daos/receitas_dao.dart';
import '../../ingredientes/application/ingredientes_providers.dart';

final receitasDaoProvider = Provider<ReceitasDao>((ref) {
  return ref.watch(appDatabaseProvider).receitasDao;
});

/// Termo de busca digitado pela usuária na tela de receitas.
final buscaReceitasProvider = StateProvider<String>((ref) => '');

/// Lista de receitas (com custo total já calculado), filtrada pelo termo de
/// busca e atualizada em tempo real conforme o banco de dados muda.
final listaReceitasProvider = StreamProvider.autoDispose<List<ReceitaResumo>>((
  ref,
) {
  final dao = ref.watch(receitasDaoProvider);
  final termo = ref.watch(buscaReceitasProvider);
  return dao.watchLista(filtro: termo);
});
