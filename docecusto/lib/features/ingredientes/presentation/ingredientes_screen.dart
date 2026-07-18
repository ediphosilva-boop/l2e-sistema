import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/local/database.dart';
import '../../receitas/application/receitas_providers.dart';
import '../application/ingredientes_providers.dart';
import 'widgets/ingrediente_form_sheet.dart';
import 'widgets/ingrediente_list_tile.dart';

class IngredientesScreen extends ConsumerWidget {
  const IngredientesScreen({super.key});

  Future<void> _confirmarExclusao(
    BuildContext context,
    WidgetRef ref,
    Ingrediente ingrediente,
  ) async {
    final nomesReceitas = await ref
        .read(receitasDaoProvider)
        .nomesReceitasQueUsam(ingrediente.id);

    if (!context.mounted) return;

    final emUso = nomesReceitas.isNotEmpty;
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(emUso ? 'Ingrediente em uso' : 'Excluir ingrediente'),
        content: Text(
          emUso
              ? 'O ingrediente "${ingrediente.nome}" é usado '
                    '${nomesReceitas.length == 1 ? 'na receita' : 'nas receitas'} '
                    '${nomesReceitas.join(', ')}. Excluir mesmo assim vai '
                    'removê-lo dessas receitas e recalcular o custo delas. '
                    'Deseja continuar?'
              : 'Tem certeza que deseja excluir "${ingrediente.nome}"? '
                    'Essa ação não pode ser desfeita.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancelar'),
          ),
          FilledButton.tonal(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Excluir'),
          ),
        ],
      ),
    );

    if (confirmar != true) return;

    try {
      await ref.read(ingredientesDaoProvider).excluir(ingrediente.id);
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Não foi possível excluir "${ingrediente.nome}": $e'),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ingredientesAsync = ref.watch(listaIngredientesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ingredientes'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(64),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: _CampoBusca(
              onChanged: (texto) =>
                  ref.read(buscaIngredientesProvider.notifier).state = texto,
            ),
          ),
        ),
      ),
      body: ingredientesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (erro, _) => Center(child: Text('Erro ao carregar: $erro')),
        data: (ingredientes) {
          if (ingredientes.isEmpty) {
            return const _EstadoVazio();
          }
          return ListView.builder(
            padding: const EdgeInsets.only(top: 8, bottom: 96),
            itemCount: ingredientes.length,
            itemBuilder: (context, index) {
              final ingrediente = ingredientes[index];
              return IngredienteListTile(
                ingrediente: ingrediente,
                onTap: () => abrirFormularioIngrediente(
                  context,
                  ingrediente: ingrediente,
                ),
                onExcluir: () => _confirmarExclusao(context, ref, ingrediente),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => abrirFormularioIngrediente(context),
        icon: const Icon(Icons.add),
        label: const Text('Ingrediente'),
      ),
    );
  }
}

class _CampoBusca extends StatelessWidget {
  const _CampoBusca({required this.onChanged});

  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return TextField(
      onChanged: onChanged,
      decoration: InputDecoration(
        hintText: 'Buscar ingrediente...',
        prefixIcon: const Icon(Icons.search),
        filled: true,
        fillColor: Theme.of(context).colorScheme.surface,
        contentPadding: const EdgeInsets.symmetric(vertical: 0),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(24),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }
}

class _EstadoVazio extends StatelessWidget {
  const _EstadoVazio();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.cake_outlined,
              size: 64,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 16),
            Text(
              'Nenhum ingrediente cadastrado',
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Toque em "Ingrediente" para adicionar o primeiro item '
              'e começar a calcular o custo das suas receitas.',
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
