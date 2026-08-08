import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/units/unidade_medida.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/local/daos/receitas_dao.dart';
import '../../../data/local/database.dart';
import '../../ingredientes/application/ingredientes_providers.dart';
import '../application/receitas_providers.dart';
import 'widgets/item_receita_sheet.dart';

/// Formulário de criação/edição de receita. Quando [receita] é informada, a
/// tela abre em modo de edição, carregando os itens já salvos.
class ReceitaFormScreen extends ConsumerStatefulWidget {
  const ReceitaFormScreen({super.key, this.receita});

  final Receita? receita;

  @override
  ConsumerState<ReceitaFormScreen> createState() => _ReceitaFormScreenState();
}

class _ReceitaFormScreenState extends ConsumerState<ReceitaFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nomeController;
  late final TextEditingController _rendimentoController;
  late final TextEditingController _tempoController;
  List<ItemReceitaEditavel> _itens = [];
  bool _carregandoItens = false;
  bool _salvando = false;
  bool _erroSemItens = false;

  bool get _editando => widget.receita != null;

  @override
  void initState() {
    super.initState();
    _nomeController = TextEditingController(text: widget.receita?.nome ?? '');
    _rendimentoController = TextEditingController(
      text: (widget.receita?.rendimento ?? 1).toString(),
    );
    _tempoController = TextEditingController(
      text: widget.receita?.tempoPreparoMinutos?.toString() ?? '',
    );
    if (_editando) {
      _carregarItens();
    }
  }

  @override
  void dispose() {
    _nomeController.dispose();
    _rendimentoController.dispose();
    _tempoController.dispose();
    super.dispose();
  }

  Future<void> _carregarItens() async {
    setState(() => _carregandoItens = true);
    final itens = await ref
        .read(receitasDaoProvider)
        .buscarItens(widget.receita!.id);
    if (!mounted) return;
    setState(() {
      _itens = itens;
      _carregandoItens = false;
    });
  }

  double get _custoTotal => _itens.fold(0, (soma, item) => soma + item.custo);

  Future<void> _adicionarOuEditarItem({
    ItemReceitaEditavel? itemExistente,
  }) async {
    final todosIngredientes = await ref.read(listaIngredientesProvider.future);
    final idsJaUsados = _itens
        .where((item) => item != itemExistente)
        .map((item) => item.ingrediente.id)
        .toSet();
    final disponiveis = todosIngredientes
        .where((ingrediente) => !idsJaUsados.contains(ingrediente.id))
        .toList();

    if (!mounted) return;

    if (disponiveis.isEmpty && itemExistente == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Todos os ingredientes cadastrados já foram adicionados a esta receita.',
          ),
        ),
      );
      return;
    }

    final resultado = await abrirFormularioItemReceita(
      context,
      ingredientesDisponiveis: disponiveis,
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

  void _removerItem(ItemReceitaEditavel item) {
    setState(() => _itens.remove(item));
  }

  Future<void> _salvar() async {
    final formValido = _formKey.currentState!.validate();
    final temItens = _itens.isNotEmpty;
    setState(() => _erroSemItens = !temItens);

    if (!formValido || !temItens) {
      if (!temItens) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Adicione pelo menos um ingrediente à receita.'),
          ),
        );
      }
      return;
    }

    setState(() => _salvando = true);
    try {
      await ref
          .read(receitasDaoProvider)
          .salvar(
            receitaId: widget.receita?.id,
            nome: _nomeController.text.trim(),
            rendimento: int.tryParse(_rendimentoController.text.trim()) ?? 1,
            tempoPreparoMinutos: int.tryParse(_tempoController.text.trim()),
            itens: _itens,
          );
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

  Future<void> _excluirReceita() async {
    final receita = widget.receita!;
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Excluir receita'),
        content: Text(
          'Tem certeza que deseja excluir "${receita.nome}"? '
          'Essa ação não pode ser desfeita.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancelar'),
          ),
          FilledButton.tonal(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Excluir'),
          ),
        ],
      ),
    );
    if (confirmar != true || !mounted) return;

    await ref.read(receitasDaoProvider).excluir(receita.id);
    if (mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: Text(_editando ? 'Editar receita' : 'Nova receita'),
        actions: [
          if (_editando)
            IconButton(
              icon: const Icon(Icons.delete_outline),
              tooltip: 'Excluir receita',
              onPressed: _salvando ? null : _excluirReceita,
            ),
        ],
      ),
      body: _carregandoItens
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
                children: [
                  TextFormField(
                    controller: _nomeController,
                    textCapitalization: TextCapitalization.sentences,
                    decoration: const InputDecoration(
                      labelText: 'Nome da receita',
                      hintText: 'Ex: Bolo de cenoura com cobertura',
                    ),
                    validator: (valor) {
                      if (valor == null || valor.trim().isEmpty) {
                        return 'Informe o nome da receita';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _rendimentoController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Rendimento (quantas porções/unidades)',
                      hintText: 'Ex: 25, se a receita rende 25 brownies',
                    ),
                    validator: (valor) {
                      final numero = int.tryParse((valor ?? '').trim());
                      if (numero == null || numero < 1) {
                        return 'Informe um número maior que zero';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _tempoController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Tempo de preparo (minutos)',
                      hintText: 'Opcional',
                    ),
                    validator: (valor) {
                      final texto = valor?.trim() ?? '';
                      if (texto.isEmpty) return null;
                      final numero = int.tryParse(texto);
                      if (numero == null || numero < 0) {
                        return 'Informe um número de minutos válido';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 28),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Ingredientes',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
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
                        'Adicione pelo menos um ingrediente.',
                        style: TextStyle(color: colorScheme.error),
                      ),
                    ),
                  if (_itens.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      child: Text(
                        'Nenhum ingrediente adicionado ainda.',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    )
                  else
                    ..._itens.map(
                      (item) => Card(
                        child: ListTile(
                          title: Text(item.ingrediente.nome),
                          subtitle: Text(
                            '${formatarQuantidade(item.quantidade)} ${item.unidadeMedida.sigla}',
                          ),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                formatarMoeda(item.custo),
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                ),
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
                          onTap: () =>
                              _adicionarOuEditarItem(itemExistente: item),
                        ),
                      ),
                    ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: colorScheme.primaryContainer,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Custo total',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        Text(
                          formatarMoeda(_custoTotal),
                          style: Theme.of(context).textTheme.titleLarge
                              ?.copyWith(fontWeight: FontWeight.bold),
                        ),
                      ],
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
                : Text(_editando ? 'Salvar alterações' : 'Salvar receita'),
          ),
        ),
      ),
    );
  }
}
