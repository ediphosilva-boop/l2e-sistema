import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../data/local/daos/orcamentos_dao.dart';

final _formatoData = DateFormat('dd/MM/yyyy');

class OrcamentoListTile extends StatelessWidget {
  const OrcamentoListTile({
    super.key,
    required this.resumo,
    required this.onTap,
  });

  final OrcamentoResumo resumo;
  final VoidCallback onTap;

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
            resumo.cliente.nome.isNotEmpty
                ? resumo.cliente.nome[0].toUpperCase()
                : '?',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
        title: Text(
          resumo.cliente.nome,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(_formatoData.format(resumo.orcamento.criadoEm)),
        trailing: Text(
          formatarMoeda(resumo.total),
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            color: colorScheme.primary,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}
