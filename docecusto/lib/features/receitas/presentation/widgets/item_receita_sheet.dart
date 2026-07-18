import 'package:flutter/material.dart';

import '../../../../core/units/unidade_medida.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../data/local/database.dart';
import '../../../../data/local/daos/receitas_dao.dart';

/// Abre o formulário de adicionar/editar um ingrediente dentro de uma
/// receita. Retorna o item resultante, ou null se cancelado.
Future<ItemReceitaEditavel?> abrirFormularioItemReceita(
  BuildContext context, {
  required List<Ingrediente> ingredientesDisponiveis,
  ItemReceitaEditavel? itemExistente,
}) {
  return showModalBottomSheet<ItemReceitaEditavel>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (_) => _ItemReceitaSheet(
      ingredientesDisponiveis: ingredientesDisponiveis,
      itemExistente: itemExistente,
    ),
  );
}

class _ItemReceitaSheet extends StatefulWidget {
  const _ItemReceitaSheet({
    required this.ingredientesDisponiveis,
    this.itemExistente,
  });

  final List<Ingrediente> ingredientesDisponiveis;
  final ItemReceitaEditavel? itemExistente;

  @override
  State<_ItemReceitaSheet> createState() => _ItemReceitaSheetState();
}

class _ItemReceitaSheetState extends State<_ItemReceitaSheet> {
  final _formKey = GlobalKey<FormState>();
  final _quantidadeController = TextEditingController();
  Ingrediente? _ingredienteSelecionado;
  UnidadeMedida? _unidadeSelecionada;

  bool get _editando => widget.itemExistente != null;

  @override
  void initState() {
    super.initState();
    final existente = widget.itemExistente;
    if (existente != null) {
      _ingredienteSelecionado = existente.ingrediente;
      _unidadeSelecionada = existente.unidadeMedida;
      _quantidadeController.text = formatarQuantidade(existente.quantidade);
    }
  }

  @override
  void dispose() {
    _quantidadeController.dispose();
    super.dispose();
  }

  double? get _custoPrevisto {
    final ingrediente = _ingredienteSelecionado;
    final unidade = _unidadeSelecionada;
    final quantidade = parseValorMonetario(_quantidadeController.text);
    if (ingrediente == null || unidade == null || quantidade == null) {
      return null;
    }
    try {
      return converterQuantidade(
            quantidade,
            unidade,
            ingrediente.unidadeMedida,
          ) *
          ingrediente.precoUnidade;
    } on ArgumentError {
      return null;
    }
  }

  void _confirmar() {
    if (!_formKey.currentState!.validate()) return;
    final ingrediente = _ingredienteSelecionado!;
    final unidade = _unidadeSelecionada!;
    final quantidade = parseValorMonetario(_quantidadeController.text)!;

    Navigator.of(context).pop(
      ItemReceitaEditavel(
        id: widget.itemExistente?.id,
        ingrediente: ingrediente,
        quantidade: quantidade,
        unidadeMedida: unidade,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Garante que o ingrediente do item em edição apareça nas opções mesmo
    // que a lista recebida já exclua ingredientes em uso por outros itens.
    final opcoesIngredientes = [
      ...widget.ingredientesDisponiveis,
      if (widget.itemExistente != null &&
          !widget.ingredientesDisponiveis.any(
            (i) => i.id == widget.itemExistente!.ingrediente.id,
          ))
        widget.itemExistente!.ingrediente,
    ];

    final custo = _custoPrevisto;

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
              _editando
                  ? 'Editar ingrediente da receita'
                  : 'Adicionar ingrediente',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 20),
            DropdownButtonFormField<Ingrediente>(
              initialValue: _ingredienteSelecionado,
              decoration: const InputDecoration(labelText: 'Ingrediente'),
              isExpanded: true,
              items: opcoesIngredientes
                  .map(
                    (ingrediente) => DropdownMenuItem(
                      value: ingrediente,
                      child: Text(
                        '${ingrediente.nome} (${formatarMoeda(ingrediente.precoUnidade)}/${ingrediente.unidadeMedida.sigla})',
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  )
                  .toList(),
              onChanged: (ingrediente) {
                setState(() {
                  _ingredienteSelecionado = ingrediente;
                  // A unidade padrão é a do próprio ingrediente.
                  _unidadeSelecionada = ingrediente?.unidadeMedida;
                });
              },
              validator: (valor) =>
                  valor == null ? 'Selecione um ingrediente' : null,
            ),
            const SizedBox(height: 16),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _quantidadeController,
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    decoration: const InputDecoration(labelText: 'Quantidade'),
                    onChanged: (_) => setState(() {}),
                    validator: (valor) {
                      final quantidade = parseValorMonetario(valor ?? '');
                      if (quantidade == null) return 'Informe um valor válido';
                      if (quantidade <= 0) return 'Deve ser maior que zero';
                      return null;
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: DropdownButtonFormField<UnidadeMedida>(
                    initialValue: _unidadeSelecionada,
                    decoration: const InputDecoration(labelText: 'Unidade'),
                    items:
                        (_ingredienteSelecionado == null
                                ? UnidadeMedida.values
                                : unidadesCompativeisCom(
                                    _ingredienteSelecionado!.unidadeMedida,
                                  ))
                            .map(
                              (unidade) => DropdownMenuItem(
                                value: unidade,
                                child: Text(unidade.sigla),
                              ),
                            )
                            .toList(),
                    onChanged: _ingredienteSelecionado == null
                        ? null
                        : (unidade) =>
                              setState(() => _unidadeSelecionada = unidade),
                    validator: (valor) => valor == null ? 'Obrigatório' : null,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (custo != null)
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
                    const Text('Custo deste item'),
                    Text(
                      formatarMoeda(custo),
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: widget.ingredientesDisponiveis.isEmpty && !_editando
                  ? null
                  : _confirmar,
              child: Text(_editando ? 'Salvar item' : 'Adicionar à receita'),
            ),
          ],
        ),
      ),
    );
  }
}
