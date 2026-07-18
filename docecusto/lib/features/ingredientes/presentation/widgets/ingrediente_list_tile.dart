import 'package:flutter/material.dart';

import '../../../../core/units/unidade_medida.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../data/local/database.dart';

class IngredienteListTile extends StatelessWidget {
  const IngredienteListTile({
    super.key,
    required this.ingrediente,
    required this.onTap,
    required this.onExcluir,
  });

  final Ingrediente ingrediente;
  final VoidCallback onTap;
  final VoidCallback onExcluir;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Card(
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: CircleAvatar(
          backgroundColor: colorScheme.primaryContainer,
          foregroundColor: colorScheme.onPrimaryContainer,
          child: Text(
            ingrediente.nome.isNotEmpty
                ? ingrediente.nome[0].toUpperCase()
                : '?',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
        title: Text(
          ingrediente.nome,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          '${formatarMoeda(ingrediente.precoUnidade)} / ${ingrediente.unidadeMedida.sigla}',
        ),
        trailing: IconButton(
          icon: Icon(Icons.delete_outline, color: colorScheme.error),
          tooltip: 'Excluir',
          onPressed: onExcluir,
        ),
      ),
    );
  }
}
