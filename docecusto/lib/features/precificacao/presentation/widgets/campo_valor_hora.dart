import 'package:flutter/material.dart';

import '../../../../core/utils/formatters.dart';

/// Mostra o valor/hora atual (vindo das Configurações) em modo leitura, com
/// opção de editar; ou um campo inline para defini-lo quando ainda não foi
/// configurado.
class CampoValorHora extends StatelessWidget {
  const CampoValorHora({
    super.key,
    required this.valorHora,
    required this.editando,
    required this.controller,
    required this.onEditar,
    required this.onConfirmar,
  });

  final double? valorHora;
  final bool editando;
  final TextEditingController controller;
  final VoidCallback onEditar;
  final VoidCallback onConfirmar;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    if (!editando && valorHora != null) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: colorScheme.outlineVariant),
        ),
        child: Row(
          children: [
            const Expanded(child: Text('Valor da hora de trabalho')),
            Text(
              '${formatarMoeda(valorHora!)}/h',
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              tooltip: 'Editar valor/hora',
              onPressed: onEditar,
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Você ainda não definiu o valor da sua hora de trabalho. '
            'Defina agora: ele fica salvo nas Configurações e é '
            'reaproveitado em todas as receitas.',
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: TextField(
                  controller: controller,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  decoration: const InputDecoration(
                    labelText: 'Valor da hora (R\$)',
                    filled: true,
                  ),
                  onSubmitted: (_) => onConfirmar(),
                ),
              ),
              const SizedBox(width: 12),
              FilledButton(onPressed: onConfirmar, child: const Text('Salvar')),
            ],
          ),
        ],
      ),
    );
  }
}
