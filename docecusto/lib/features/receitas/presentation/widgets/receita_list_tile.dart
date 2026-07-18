import 'package:flutter/material.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../data/local/daos/receitas_dao.dart';

class ReceitaListTile extends StatelessWidget {
  const ReceitaListTile({super.key, required this.resumo, required this.onTap});

  final ReceitaResumo resumo;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final receita = resumo.receita;
    return Card(
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: CircleAvatar(
          backgroundColor: colorScheme.primaryContainer,
          foregroundColor: colorScheme.onPrimaryContainer,
          child: const Icon(Icons.menu_book_outlined),
        ),
        title: Text(
          receita.nome,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          resumo.totalIngredientes == 0
              ? 'Nenhum ingrediente adicionado'
              : '${resumo.totalIngredientes} ${resumo.totalIngredientes == 1 ? 'ingrediente' : 'ingredientes'}'
                    '${receita.tempoPreparoMinutos != null ? ' · ${receita.tempoPreparoMinutos} min' : ''}',
        ),
        trailing: Text(
          formatarMoeda(resumo.custoTotal),
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            color: colorScheme.primary,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}
