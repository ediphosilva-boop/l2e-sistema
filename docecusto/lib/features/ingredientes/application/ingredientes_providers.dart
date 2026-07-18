import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/local/daos/ingredientes_dao.dart';
import '../../../data/local/database.dart';

/// Instância única do banco de dados local, viva durante toda a sessão do
/// app. Fechada automaticamente quando o provider é descartado.
final appDatabaseProvider = Provider<AppDatabase>((ref) {
  final banco = AppDatabase();
  ref.onDispose(banco.close);
  return banco;
});

final ingredientesDaoProvider = Provider<IngredientesDao>((ref) {
  return ref.watch(appDatabaseProvider).ingredientesDao;
});

/// Termo de busca digitado pela usuária na tela de ingredientes.
final buscaIngredientesProvider = StateProvider<String>((ref) => '');

/// Lista de ingredientes, já filtrada pelo termo de busca, atualizada em
/// tempo real conforme o banco de dados muda.
final listaIngredientesProvider = StreamProvider.autoDispose<List<Ingrediente>>(
  (ref) {
    final dao = ref.watch(ingredientesDaoProvider);
    final termo = ref.watch(buscaIngredientesProvider);
    return dao.observarTodos(filtro: termo);
  },
);
