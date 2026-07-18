import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../precificacao/application/precificacao_providers.dart';

/// Garante que o nome do negócio (usado no cabeçalho do PDF) esteja
/// definido nas Configurações. Se já estiver, retorna direto; caso
/// contrário, pede inline num bottom sheet e salva antes de retornar.
///
/// Retorna null se a usuária cancelar o preenchimento.
Future<String?> obterOuDefinirNomeNegocio(
  BuildContext context,
  WidgetRef ref,
) async {
  final atual = await ref
      .read(configuracoesGeraisDaoProvider)
      .buscarNomeNegocio();
  if (atual != null && atual.trim().isNotEmpty) return atual;

  if (!context.mounted) return null;

  final definido = await showModalBottomSheet<String>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (_) => const _NomeNegocioSheet(),
  );

  if (definido == null) return null;

  await ref.read(configuracoesGeraisDaoProvider).definirNomeNegocio(definido);
  return definido;
}

class _NomeNegocioSheet extends StatefulWidget {
  const _NomeNegocioSheet();

  @override
  State<_NomeNegocioSheet> createState() => _NomeNegocioSheetState();
}

class _NomeNegocioSheetState extends State<_NomeNegocioSheet> {
  final _formKey = GlobalKey<FormState>();
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _confirmar() {
    if (!_formKey.currentState!.validate()) return;
    Navigator.of(context).pop(_controller.text.trim());
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Nome do seu negócio',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            const Text(
              'Vai aparecer no cabeçalho dos orçamentos em PDF. Fica salvo '
              'nas Configurações e não precisa ser digitado de novo.',
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _controller,
              textCapitalization: TextCapitalization.words,
              decoration: const InputDecoration(labelText: 'Nome do negócio'),
              validator: (valor) {
                if (valor == null || valor.trim().isEmpty) {
                  return 'Informe o nome do negócio';
                }
                return null;
              },
              onFieldSubmitted: (_) => _confirmar(),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _confirmar,
              child: const Text('Salvar e continuar'),
            ),
          ],
        ),
      ),
    );
  }
}
