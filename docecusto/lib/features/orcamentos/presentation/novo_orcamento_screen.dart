import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/utils/formatters.dart';
import '../../../data/local/daos/orcamentos_dao.dart';
import '../../../data/local/database.dart';
import '../application/orcamentos_providers.dart';
import '../application/receitas_precificadas_provider.dart';
import 'orcamento_detalhe_screen.dart';
import 'widgets/cliente_form_sheet.dart';
import 'widgets/forma_pagamento_form_sheet.dart';
import 'widgets/item_orcamento_sheet.dart';

class NovoOrcamentoScreen extends ConsumerStatefulWidget {
  const NovoOrcamentoScreen({super.key});

  @override
  ConsumerState<NovoOrcamentoScreen> createState() =>
      _NovoOrcamentoScreenState();
}

class _NovoOrcamentoScreenState extends ConsumerState<NovoOrcamentoScreen> {
  final _formKey = GlobalKey<FormState>();
  final _validadeController = TextEditingController(text: '7');
  final _observacoesController = TextEditingController();
  final _descontoController = TextEditingController();

  Cliente? _clienteSelecionado;
  FormaPagamento? _formaPagamentoSelecionada;
  final List<ItemOrcamentoRascunho> _itens = [];
  bool _salvando = false;
  bool _erroSemCliente = false;
  bool _erroSemItens = false;

  @override
  void dispose() {
    _validadeController.dispose();
    _observacoesController.dispose();
    _descontoController.dispose();
    super.dispose();
  }

  double get _subtotal => _itens.fold(0, (soma, item) => soma + item.subtotal);

  /// Se a forma de pagamento escolhida tem desconto configurado, o desconto
  /// do orçamento é calculado automaticamente a partir dela; caso contrário,
  /// vale o valor digitado manualmente no campo de desconto.
  bool get _descontoAutomatico =>
      (_formaPagamentoSelecionada?.descontoPercentual ?? 0) > 0;

  double get _desconto {
    final forma = _formaPagamentoSelecionada;
    if (forma != null && forma.descontoPercentual > 0) {
      return _subtotal * (forma.descontoPercentual / 100);
    }
    return parseValorMonetario(_descontoController.text) ?? 0;
  }

  double get _total => (_subtotal - _desconto).clamp(0, double.infinity);

  ReceitaPrecificada? _receitaDoItem(
    List<ReceitaPrecificada> precificadas,
    ItemOrcamentoRascunho item,
  ) {
    for (final receita in precificadas) {
      if (receita.receita.id == item.receitaId) return receita;
    }
    return null;
  }

  double _custoTotal(List<ReceitaPrecificada> precificadas) {
    return _itens.fold(0, (soma, item) {
      final receita = _receitaDoItem(precificadas, item);
      if (receita == null) return soma;
      return soma + receita.calculo.subtotal * item.quantidade;
    });
  }

  double _lucroTotal(List<ReceitaPrecificada> precificadas) {
    return _itens.fold(0, (soma, item) {
      final receita = _receitaDoItem(precificadas, item);
      if (receita == null) return soma;
      return soma + receita.calculo.valorMargem * item.quantidade;
    });
  }

  Future<void> _cadastrarCliente() async {
    final cliente = await abrirFormularioCliente(context);
    if (cliente == null || !mounted) return;
    setState(() {
      _clienteSelecionado = cliente;
      _erroSemCliente = false;
    });
  }

  Future<void> _cadastrarFormaPagamento() async {
    final forma = await abrirFormularioFormaPagamento(context);
    if (forma == null || !mounted) return;
    setState(() => _formaPagamentoSelecionada = forma);
  }

  Future<void> _adicionarOuEditarItem({
    ItemOrcamentoRascunho? itemExistente,
  }) async {
    final receitasPrecificadas = await ref.read(
      receitasPrecificadasProvider.future,
    );
    if (!mounted) return;

    if (receitasPrecificadas.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Nenhuma receita com precificação salva. Vá até a aba '
            '"Preço", calcule e salve a precificação de uma receita primeiro.',
          ),
        ),
      );
      return;
    }

    final resultado = await abrirFormularioItemOrcamento(
      context,
      receitasDisponiveis: receitasPrecificadas,
      itemExistente: itemExistente,
    );
    if (resultado == null || !mounted) return;

    setState(() {
      if (itemExistente != null) {
        final indice = _itens.indexOf(itemExistente);
        _itens[indice] = resultado;
      } else {
        _itens.add(resultado);
      }
      _erroSemItens = false;
    });
  }

  void _removerItem(ItemOrcamentoRascunho item) {
    setState(() => _itens.remove(item));
  }

  Future<void> _salvar() async {
    final clienteValido = _clienteSelecionado != null;
    final temItens = _itens.isNotEmpty;
    setState(() {
      _erroSemCliente = !clienteValido;
      _erroSemItens = !temItens;
    });

    if (!_formKey.currentState!.validate() || !clienteValido || !temItens) {
      if (!temItens) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Adicione pelo menos um item ao orçamento.'),
          ),
        );
      }
      return;
    }

    setState(() => _salvando = true);
    try {
      final id = await ref
          .read(orcamentosDaoProvider)
          .salvar(
            clienteId: _clienteSelecionado!.id,
            validadeDias: int.parse(_validadeController.text.trim()),
            observacoes: _observacoesController.text.trim().isEmpty
                ? null
                : _observacoesController.text.trim(),
            desconto: _desconto,
            formaPagamento: _formaPagamentoSelecionada?.nome,
            itens: _itens,
          );
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => OrcamentoDetalheScreen(orcamentoId: id),
          ),
        );
      }
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
    final clientesAsync = ref.watch(listaClientesProvider);
    final formasPagamentoAsync = ref.watch(listaFormasPagamentoProvider);
    final precificadasAsync = ref.watch(receitasPrecificadasProvider);
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Novo orçamento')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
          children: [
            Text('Cliente', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            clientesAsync.when(
              loading: () => const LinearProgressIndicator(),
              error: (erro, _) => Text('Erro ao carregar clientes: $erro'),
              data: (clientes) => Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: DropdownButtonFormField<Cliente>(
                      initialValue: _clienteSelecionado,
                      decoration: InputDecoration(
                        labelText: 'Selecione o cliente',
                        errorText: _erroSemCliente
                            ? 'Selecione ou cadastre um cliente'
                            : null,
                      ),
                      isExpanded: true,
                      items: clientes
                          .map(
                            (cliente) => DropdownMenuItem(
                              value: cliente,
                              child: Text(
                                cliente.nome,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          )
                          .toList(),
                      onChanged: (cliente) => setState(() {
                        _clienteSelecionado = cliente;
                        _erroSemCliente = false;
                      }),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filledTonal(
                    onPressed: _cadastrarCliente,
                    icon: const Icon(Icons.person_add_alt_1_outlined),
                    tooltip: 'Novo cliente',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            TextFormField(
              controller: _validadeController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Validade do orçamento (dias)',
              ),
              validator: (valor) {
                final numero = int.tryParse((valor ?? '').trim());
                if (numero == null || numero <= 0) {
                  return 'Informe um número de dias válido';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            Text(
              'Forma de pagamento',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            formasPagamentoAsync.when(
              loading: () => const LinearProgressIndicator(),
              error: (erro, _) =>
                  Text('Erro ao carregar formas de pagamento: $erro'),
              data: (formas) => Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: DropdownButtonFormField<FormaPagamento?>(
                      initialValue: _formaPagamentoSelecionada,
                      decoration: const InputDecoration(
                        labelText: 'Selecione (opcional)',
                      ),
                      isExpanded: true,
                      items: [
                        const DropdownMenuItem<FormaPagamento?>(
                          child: Text('Nenhuma'),
                        ),
                        ...formas.map(
                          (forma) => DropdownMenuItem(
                            value: forma,
                            child: Text(
                              forma.descontoPercentual > 0
                                  ? '${forma.nome} (${forma.descontoPercentual.round()}% de desconto)'
                                  : forma.nome,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ),
                      ],
                      onChanged: (forma) =>
                          setState(() => _formaPagamentoSelecionada = forma),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filledTonal(
                    onPressed: _cadastrarFormaPagamento,
                    icon: const Icon(Icons.add_card_outlined),
                    tooltip: 'Nova forma de pagamento',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _observacoesController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Observações',
                hintText: 'Opcional',
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 28),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Itens', style: Theme.of(context).textTheme.titleMedium),
                TextButton.icon(
                  onPressed: () => _adicionarOuEditarItem(),
                  icon: const Icon(Icons.add),
                  label: const Text('Adicionar'),
                ),
              ],
            ),
            if (_erroSemItens)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(
                  'Adicione pelo menos um item.',
                  style: TextStyle(color: colorScheme.error),
                ),
              ),
            if (_itens.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Text(
                  'Nenhum item adicionado ainda.',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              )
            else
              ..._itens.map(
                (item) => Card(
                  child: ListTile(
                    title: Text(item.descricao),
                    subtitle: Text(
                      '${formatarQuantidade(item.quantidade)} × ${formatarMoeda(item.precoUnitario)}',
                    ),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          formatarMoeda(item.subtotal),
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                        IconButton(
                          icon: Icon(
                            Icons.delete_outline,
                            color: colorScheme.error,
                          ),
                          tooltip: 'Remover',
                          onPressed: () => _removerItem(item),
                        ),
                      ],
                    ),
                    onTap: () => _adicionarOuEditarItem(itemExistente: item),
                  ),
                ),
              ),
            const SizedBox(height: 16),
            if (_descontoAutomatico)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  vertical: 12,
                  horizontal: 16,
                ),
                decoration: BoxDecoration(
                  color: colorScheme.secondaryContainer,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'Desconto de ${_formaPagamentoSelecionada!.descontoPercentual.round()}% '
                  '(${_formaPagamentoSelecionada!.nome}) aplicado automaticamente: '
                  '${formatarMoeda(_desconto)}',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              )
            else
              TextFormField(
                controller: _descontoController,
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                ),
                decoration: const InputDecoration(
                  labelText: 'Desconto (R\$)',
                  hintText: 'Opcional',
                ),
                onChanged: (_) => setState(() {}),
              ),
            const SizedBox(height: 16),
            _SimuladorLucro(
              subtotal: _subtotal,
              desconto: _desconto,
              total: _total,
              custoTotal: _custoTotal(
                precificadasAsync.valueOrNull ?? const [],
              ),
              lucroTotal: _lucroTotal(
                precificadasAsync.valueOrNull ?? const [],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ElevatedButton(
            onPressed: _salvando ? null : _salvar,
            child: _salvando
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Gerar orçamento'),
          ),
        ),
      ),
    );
  }
}

/// Resumo interno de custo e lucro do orçamento em montagem: dado só para a
/// confeiteira decidir se o preço está bom, não aparece no PDF enviado ao
/// cliente (o serviço de PDF nunca recebe custo/margem, só o preço final).
class _SimuladorLucro extends StatelessWidget {
  const _SimuladorLucro({
    required this.subtotal,
    required this.desconto,
    required this.total,
    required this.custoTotal,
    required this.lucroTotal,
  });

  final double subtotal;
  final double desconto;
  final double total;
  final double custoTotal;
  final double lucroTotal;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    // O desconto reduz o lucro planejado diretamente (não o custo), então
    // tanto o lucro final quanto a margem exibida já saem líquidos de
    // desconto.
    final lucroFinal = lucroTotal - desconto;
    final margemPercentual = custoTotal > 0
        ? (lucroFinal / custoTotal * 100)
        : 0.0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Icon(Icons.insights_outlined, color: colorScheme.primary),
              const SizedBox(width: 8),
              Text(
                'Simulador de lucro',
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Só você vê: não aparece no PDF enviado ao cliente.',
            style: Theme.of(
              context,
            ).textTheme.bodySmall?.copyWith(color: colorScheme.outline),
          ),
          const SizedBox(height: 12),
          _linha(context, 'Custo total', formatarMoeda(custoTotal)),
          _linha(context, 'Margem de lucro', '${margemPercentual.round()}%'),
          _linha(context, 'Lucro', formatarMoeda(lucroFinal)),
          const Divider(height: 24),
          if (desconto > 0) ...[
            _linha(context, 'Subtotal', formatarMoeda(subtotal)),
            _linha(context, 'Desconto', '- ${formatarMoeda(desconto)}'),
            const SizedBox(height: 4),
          ],
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total', style: Theme.of(context).textTheme.titleMedium),
              Text(
                formatarMoeda(total),
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _linha(BuildContext context, String rotulo, String valor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(rotulo, style: Theme.of(context).textTheme.bodyMedium),
          Text(
            valor,
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
