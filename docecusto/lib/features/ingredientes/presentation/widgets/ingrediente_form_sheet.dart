import 'package:drift/drift.dart' show Value;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/units/unidade_medida.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../data/local/database.dart';
import '../../application/ingredientes_providers.dart';

/// Abre o formulário de criação/edição de ingrediente em um bottom sheet.
Future<void> abrirFormularioIngrediente(
  BuildContext context, {
  Ingrediente? ingrediente,
}) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (_) => IngredienteFormSheet(ingrediente: ingrediente),
  );
}

class IngredienteFormSheet extends ConsumerStatefulWidget {
  const IngredienteFormSheet({super.key, this.ingrediente});

  final Ingrediente? ingrediente;

  @override
  ConsumerState<IngredienteFormSheet> createState() =>
      _IngredienteFormSheetState();
}

class _IngredienteFormSheetState extends ConsumerState<IngredienteFormSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nomeController;
  late final TextEditingController _quantidadeEmbalagemController;
  late final TextEditingController _precoEmbalagemController;
  late UnidadeMedida _unidadeSelecionada;
  bool _salvando = false;

  bool get _editando => widget.ingrediente != null;

  @override
  void initState() {
    super.initState();
    final ingrediente = widget.ingrediente;
    _nomeController = TextEditingController(text: ingrediente?.nome ?? '');
    _quantidadeEmbalagemController = TextEditingController(
      text: ingrediente == null
          ? '1'
          : formatarQuantidade(ingrediente.quantidadeEmbalagem),
    );
    _precoEmbalagemController = TextEditingController(
      text: ingrediente == null
          ? ''
          : ingrediente.precoEmbalagem.toStringAsFixed(2).replaceAll('.', ','),
    );
    _unidadeSelecionada = ingrediente?.unidadeMedida ?? UnidadeMedida.grama;
  }

  @override
  void dispose() {
    _nomeController.dispose();
    _quantidadeEmbalagemController.dispose();
    _precoEmbalagemController.dispose();
    super.dispose();
  }

  double? get _precoPorUnidadePrevisto {
    final quantidade = parseValorMonetario(_quantidadeEmbalagemController.text);
    final preco = parseValorMonetario(_precoEmbalagemController.text);
    if (quantidade == null || quantidade <= 0 || preco == null) return null;
    return preco / quantidade;
  }

  Future<void> _salvar() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _salvando = true);
    final dao = ref.read(ingredientesDaoProvider);
    final quantidadeEmbalagem = parseValorMonetario(
      _quantidadeEmbalagemController.text,
    )!;
    final precoEmbalagem = parseValorMonetario(_precoEmbalagemController.text)!;
    final nome = _nomeController.text.trim();

    try {
      final atual = widget.ingrediente;
      if (atual == null) {
        await dao.criar(
          IngredientesCompanion.insert(
            nome: nome,
            unidadeMedida: _unidadeSelecionada,
            quantidadeEmbalagem: Value(quantidadeEmbalagem),
            precoEmbalagem: precoEmbalagem,
          ),
        );
      } else {
        await dao.atualizar(
          atual.copyWith(
            nome: nome,
            unidadeMedida: _unidadeSelecionada,
            quantidadeEmbalagem: quantidadeEmbalagem,
            precoEmbalagem: precoEmbalagem,
          ),
        );
      }
      if (mounted) Navigator.of(context).pop();
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
    final precoPorUnidade = _precoPorUnidadePrevisto;

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
              _editando ? 'Editar ingrediente' : 'Novo ingrediente',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 20),
            TextFormField(
              controller: _nomeController,
              textCapitalization: TextCapitalization.sentences,
              decoration: const InputDecoration(
                labelText: 'Nome do ingrediente',
                hintText: 'Ex: Óleo de soja',
              ),
              validator: (valor) {
                if (valor == null || valor.trim().isEmpty) {
                  return 'Informe o nome do ingrediente';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<UnidadeMedida>(
              initialValue: _unidadeSelecionada,
              decoration: const InputDecoration(labelText: 'Unidade de medida'),
              items: unidadesDeCompra
                  .map(
                    (unidade) => DropdownMenuItem(
                      value: unidade,
                      child: Text(unidade.rotulo),
                    ),
                  )
                  .toList(),
              onChanged: (unidade) {
                if (unidade != null) {
                  setState(() => _unidadeSelecionada = unidade);
                }
              },
            ),
            const SizedBox(height: 16),
            Text(
              'Como você compra esse ingrediente? (ex: uma embalagem de '
              '900 ml de óleo por R\$ 8,00)',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 8),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _quantidadeEmbalagemController,
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    decoration: InputDecoration(
                      labelText:
                          'Qtd. da embalagem (${_unidadeSelecionada.sigla})',
                    ),
                    onChanged: (_) => setState(() {}),
                    validator: (valor) {
                      final quantidade = parseValorMonetario(valor ?? '');
                      if (quantidade == null) return 'Valor inválido';
                      if (quantidade <= 0) return 'Deve ser maior que zero';
                      return null;
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextFormField(
                    controller: _precoEmbalagemController,
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    decoration: const InputDecoration(
                      labelText: 'Preço pago',
                      prefixText: 'R\$ ',
                    ),
                    onChanged: (_) => setState(() {}),
                    validator: (valor) {
                      final preco = parseValorMonetario(valor ?? '');
                      if (preco == null) return 'Valor inválido';
                      if (preco <= 0) return 'Deve ser maior que zero';
                      return null;
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (precoPorUnidade != null)
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Preço por unidade'),
                    Text(
                      '${formatarMoedaPorUnidade(precoPorUnidade)}/${_unidadeSelecionada.sigla}',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
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
                  : Text(
                      _editando ? 'Salvar alterações' : 'Adicionar ingrediente',
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
