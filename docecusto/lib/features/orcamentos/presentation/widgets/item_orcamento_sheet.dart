import 'package:flutter/material.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../data/local/daos/orcamentos_dao.dart';
import '../../application/receitas_precificadas_provider.dart';

/// Abre o formulário de adicionar/editar um item do orçamento (receita
/// precificada + quantidade). Retorna o item resultante, ou null se
/// cancelado.
Future<ItemOrcamentoRascunho?> abrirFormularioItemOrcamento(
  BuildContext context, {
  required List<ReceitaPrecificada> receitasDisponiveis,
  ItemOrcamentoRascunho? itemExistente,
}) {
  return showModalBottomSheet<ItemOrcamentoRascunho>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (_) => _ItemOrcamentoSheet(
      receitasDisponiveis: receitasDisponiveis,
      itemExistente: itemExistente,
    ),
  );
}

class _ItemOrcamentoSheet extends StatefulWidget {
  const _ItemOrcamentoSheet({
    required this.receitasDisponiveis,
    this.itemExistente,
  });

  final List<ReceitaPrecificada> receitasDisponiveis;
  final ItemOrcamentoRascunho? itemExistente;

  @override
  State<_ItemOrcamentoSheet> createState() => _ItemOrcamentoSheetState();
}

class _ItemOrcamentoSheetState extends State<_ItemOrcamentoSheet> {
  final _formKey = GlobalKey<FormState>();
  final _quantidadeController = TextEditingController(text: '1');
  ReceitaPrecificada? _receitaSelecionada;

  bool get _editando => widget.itemExistente != null;

  @override
  void initState() {
    super.initState();
    final existente = widget.itemExistente;
    if (existente != null) {
      _quantidadeController.text = formatarQuantidade(existente.quantidade);
      for (final receita in widget.receitasDisponiveis) {
        if (receita.receita.id == existente.receitaId) {
          _receitaSelecionada = receita;
          break;
        }
      }
    }
  }

  @override
  void dispose() {
    _quantidadeController.dispose();
    super.dispose();
  }

  double? get _subtotalPrevisto {
    final receita = _receitaSelecionada;
    final quantidade = parseValorMonetario(_quantidadeController.text);
    if (receita == null || quantidade == null) return null;
    return quantidade * receita.precoFinal;
  }

  void _confirmar() {
    if (!_formKey.currentState!.validate()) return;
    final receita = _receitaSelecionada!;
    final quantidade = parseValorMonetario(_quantidadeController.text)!;

    Navigator.of(context).pop(
      ItemOrcamentoRascunho(
        id: widget.itemExistente?.id,
        receitaId: receita.receita.id,
        descricao: receita.receita.nome,
        quantidade: quantidade,
        precoUnitario: receita.precoFinal,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final subtotal = _subtotalPrevisto;

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
              _editando ? 'Editar item' : 'Adicionar item',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 20),
            _SeletorReceita(
              opcoes: widget.receitasDisponiveis,
              selecionada: _receitaSelecionada,
              onSelecionada: (receita) =>
                  setState(() => _receitaSelecionada = receita),
            ),
            const SizedBox(height: 16),
            TextFormField(
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
            const SizedBox(height: 16),
            if (subtotal != null)
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
                    const Text('Subtotal'),
                    Text(
                      formatarMoeda(subtotal),
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: widget.receitasDisponiveis.isEmpty ? null : _confirmar,
              child: Text(_editando ? 'Salvar item' : 'Adicionar ao orçamento'),
            ),
          ],
        ),
      ),
    );
  }
}

/// Campo de busca com autocompletar para escolher uma receita precificada,
/// útil quando há muitas cadastradas.
class _SeletorReceita extends StatelessWidget {
  const _SeletorReceita({
    required this.opcoes,
    required this.selecionada,
    required this.onSelecionada,
  });

  final List<ReceitaPrecificada> opcoes;
  final ReceitaPrecificada? selecionada;
  final ValueChanged<ReceitaPrecificada> onSelecionada;

  @override
  Widget build(BuildContext context) {
    return Autocomplete<ReceitaPrecificada>(
      displayStringForOption: (receita) => receita.receita.nome,
      initialValue: TextEditingValue(text: selecionada?.receita.nome ?? ''),
      optionsBuilder: (textEditingValue) {
        final termo = textEditingValue.text.trim().toLowerCase();
        if (termo.isEmpty) return opcoes;
        return opcoes.where(
          (r) => r.receita.nome.toLowerCase().contains(termo),
        );
      },
      onSelected: onSelecionada,
      fieldViewBuilder: (context, controller, focusNode, onFieldSubmitted) {
        return TextFormField(
          controller: controller,
          focusNode: focusNode,
          decoration: const InputDecoration(
            labelText: 'Receita',
            hintText: 'Digite para buscar...',
            suffixIcon: Icon(Icons.search),
          ),
          validator: (_) =>
              selecionada == null ? 'Selecione uma receita' : null,
        );
      },
      optionsViewBuilder: (context, onSelected, options) {
        final listaOpcoes = options.toList();
        return Align(
          alignment: Alignment.topLeft,
          child: Material(
            elevation: 4,
            borderRadius: BorderRadius.circular(12),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 240),
              child: ListView.builder(
                padding: EdgeInsets.zero,
                shrinkWrap: true,
                itemCount: listaOpcoes.length,
                itemBuilder: (context, index) {
                  final receita = listaOpcoes[index];
                  return ListTile(
                    title: Text(receita.receita.nome),
                    subtitle: Text(formatarMoeda(receita.precoFinal)),
                    onTap: () => onSelected(receita),
                  );
                },
              ),
            ),
          ),
        );
      },
    );
  }
}
