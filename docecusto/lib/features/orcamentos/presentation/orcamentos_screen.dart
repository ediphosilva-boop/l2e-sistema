import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../application/orcamentos_providers.dart';
import 'novo_orcamento_screen.dart';
import 'orcamento_detalhe_screen.dart';
import 'widgets/orcamento_list_tile.dart';

class OrcamentosScreen extends ConsumerWidget {
  const OrcamentosScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historicoAsync = ref.watch(historicoOrcamentosProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Orçamentos'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(64),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: _CampoBusca(
              onChanged: (texto) =>
                  ref.read(buscaOrcamentosProvider.notifier).state = texto,
            ),
          ),
        ),
      ),
      body: historicoAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (erro, _) => Center(child: Text('Erro ao carregar: $erro')),
        data: (historico) {
          if (historico.isEmpty) {
            return const _EstadoVazio();
          }
          return ListView.builder(
            padding: const EdgeInsets.only(top: 8, bottom: 96),
            itemCount: historico.length,
            itemBuilder: (context, index) {
              final resumo = historico[index];
              return OrcamentoListTile(
                resumo: resumo,
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => OrcamentoDetalheScreen(
                      orcamentoId: resumo.orcamento.id,
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.of(
          context,
        ).push(MaterialPageRoute(builder: (_) => const NovoOrcamentoScreen())),
        icon: const Icon(Icons.add),
        label: const Text('Orçamento'),
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
        hintText: 'Buscar por cliente...',
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
              Icons.picture_as_pdf_outlined,
              size: 64,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 16),
            Text(
              'Nenhum orçamento criado',
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Toque em "Orçamento" para montar o primeiro a partir de uma '
              'receita já precificada.',
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
