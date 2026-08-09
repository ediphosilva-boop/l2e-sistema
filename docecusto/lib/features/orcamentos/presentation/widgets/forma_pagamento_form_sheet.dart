import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../data/local/database.dart';
import '../../application/orcamentos_providers.dart';

/// Abre um formulário simples (nome + desconto %) para cadastrar uma forma
/// de pagamento nova direto da tela de orçamento. Retorna a forma criada,
/// ou null se cancelado.
Future<FormaPagamento?> abrirFormularioFormaPagamento(BuildContext context) {
  return showModalBottomSheet<FormaPagamento>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (_) => const _FormaPagamentoFormSheet(),
  );
}

class _FormaPagamentoFormSheet extends ConsumerStatefulWidget {
  const _FormaPagamentoFormSheet();

  @override
  ConsumerState<_FormaPagamentoFormSheet> createState() =>
      _FormaPagamentoFormSheetState();
}

class _FormaPagamentoFormSheetState
    extends ConsumerState<_FormaPagamentoFormSheet> {
  final _formKey = GlobalKey<FormState>();
  final _nomeController = TextEditingController();
  final _descontoController = TextEditingController();
  bool _salvando = false;

  @override
  void dispose() {
    _nomeController.dispose();
    _descontoController.dispose();
    super.dispose();
  }

  Future<void> _salvar() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _salvando = true);
    try {
      final forma = await ref
          .read(formasPagamentoDaoProvider)
          .criar(
            nome: _nomeController.text.trim(),
            descontoPercentual:
                double.tryParse(
                  _descontoController.text.trim().replaceAll(',', '.'),
                ) ??
                0,
          );
      if (mounted) Navigator.of(context).pop(forma);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Não foi possível salvar: $e')));
      }
    } finally {
      if (mounted) setState(() => _salvando = false);
    }
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
              'Nova forma de pagamento',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 20),
            TextFormField(
              controller: _nomeController,
              textCapitalization: TextCapitalization.words,
              decoration: const InputDecoration(
                labelText: 'Nome',
                hintText: 'Ex: Pix, débito, dinheiro',
              ),
              validator: (valor) {
                if (valor == null || valor.trim().isEmpty) {
                  return 'Informe o nome da forma de pagamento';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _descontoController,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'[0-9,.]')),
              ],
              decoration: const InputDecoration(
                labelText: 'Desconto (%)',
                hintText: 'Opcional, aplicado automaticamente no orçamento',
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _salvando ? null : _salvar,
              child: _salvando
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Salvar forma de pagamento'),
            ),
          ],
        ),
      ),
    );
  }
}
