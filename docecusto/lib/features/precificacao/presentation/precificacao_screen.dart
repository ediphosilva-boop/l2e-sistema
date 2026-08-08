import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/precificacao/calculo_precificacao.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/local/daos/receitas_dao.dart';
import '../../../data/local/database.dart';
import '../../receitas/application/receitas_providers.dart';
import '../application/precificacao_providers.dart';
import 'widgets/campo_horas_trabalho.dart';
import 'widgets/campo_valor_hora.dart';
import 'widgets/detalhamento_precificacao.dart';

class PrecificacaoScreen extends ConsumerStatefulWidget {
  const PrecificacaoScreen({super.key});

  @override
  ConsumerState<PrecificacaoScreen> createState() => _PrecificacaoScreenState();
}

class _PrecificacaoScreenState extends ConsumerState<PrecificacaoScreen> {
  final _formKey = GlobalKey<FormState>();
  final _horasInteirasController = TextEditingController(text: '0');
  final _minutosController = TextEditingController(text: '0');
  final _custoEmbalagemController = TextEditingController(text: '0');
  final _custosFixosController = TextEditingController(text: '10');
  final _valorHoraInlineController = TextEditingController();
  final _margemController = TextEditingController(text: '50');

  Receita? _receitaSelecionada;
  double _margem = 50;
  double? _valorHora;
  bool _editandoValorHora = false;
  bool _carregandoConfiguracao = false;
  bool _salvando = false;
  bool _erroSemReceita = false;

  @override
  void dispose() {
    _horasInteirasController.dispose();
    _minutosController.dispose();
    _custoEmbalagemController.dispose();
    _custosFixosController.dispose();
    _valorHoraInlineController.dispose();
    _margemController.dispose();
    super.dispose();
  }

  /// Atualiza a margem a partir do slider (ou do carregamento inicial),
  /// mantendo o campo de texto em sincronia.
  void _atualizarMargem(double valor) {
    final novoValor = valor.clamp(0, 200).toDouble();
    setState(() {
      _margem = novoValor;
      _margemController.text = novoValor.round().toString();
    });
  }

  /// Atualiza a margem a partir do que a usuária digitou no campo de texto,
  /// sem mexer no próprio campo (evita o cursor pular enquanto digita).
  void _atualizarMargemPeloTexto(String texto) {
    final numero = parseValorMonetario(texto);
    if (numero == null) return;
    setState(() => _margem = numero.clamp(0, 200).toDouble());
  }

  Future<void> _selecionarReceita(Receita? receita) async {
    setState(() {
      _receitaSelecionada = receita;
      _erroSemReceita = false;
    });
    if (receita == null) return;

    setState(() => _carregandoConfiguracao = true);
    final salvo = await ref
        .read(precificacaoDaoProvider)
        .buscarPorReceita(receita.id);
    final valorHoraPadrao = await ref
        .read(configuracoesGeraisDaoProvider)
        .buscarValorHoraPadrao();
    if (!mounted) return;

    final valorHora = salvo?.valorHora ?? valorHoraPadrao;
    final horasEMinutos = _decompoeEmHorasEMinutos(salvo?.horasTrabalho ?? 0);
    setState(() {
      _horasInteirasController.text = horasEMinutos.$1.toString();
      _minutosController.text = horasEMinutos.$2.toString();
      _custoEmbalagemController.text = formatarQuantidade(
        salvo?.custoEmbalagem ?? 0,
      );
      _custosFixosController.text = formatarQuantidade(
        salvo?.custosFixosPercentual ?? 10,
      );
      _margem = salvo?.margemLucroPercentual ?? 50;
      _margemController.text = _margem.round().toString();
      _valorHora = valorHora;
      _editandoValorHora = valorHora == null;
      _valorHoraInlineController.text = valorHora == null
          ? ''
          : formatarQuantidade(valorHora);
      _carregandoConfiguracao = false;
    });
  }

  Future<void> _confirmarValorHora() async {
    final valor = parseValorMonetario(_valorHoraInlineController.text);
    if (valor == null || valor <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Informe um valor de hora válido.')),
      );
      return;
    }
    await ref
        .read(configuracoesGeraisDaoProvider)
        .definirValorHoraPadrao(valor);
    if (!mounted) return;
    setState(() {
      _valorHora = valor;
      _editandoValorHora = false;
    });
  }

  double get _horas {
    final horas = int.tryParse(_horasInteirasController.text.trim()) ?? 0;
    final minutos = int.tryParse(_minutosController.text.trim()) ?? 0;
    return horas + minutos / 60;
  }

  /// Converte um total de horas em decimal (ex: 1,5) para horas e minutos
  /// inteiros (ex: 1h e 30min), pra preencher os campos ao carregar uma
  /// precificação já salva.
  (int, int) _decompoeEmHorasEMinutos(double horasDecimais) {
    final horas = horasDecimais.truncate();
    var minutos = ((horasDecimais - horas) * 60).round();
    if (minutos == 60) return (horas + 1, 0);
    return (horas, minutos);
  }

  double get _custoEmbalagem =>
      parseValorMonetario(_custoEmbalagemController.text) ?? 0;

  double get _custosFixosPercentual =>
      parseValorMonetario(_custosFixosController.text) ?? 0;

  Future<void> _salvar() async {
    if (_receitaSelecionada == null) {
      setState(() => _erroSemReceita = true);
      return;
    }
    if (!_formKey.currentState!.validate()) return;
    if (_valorHora == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Defina o valor da hora de trabalho antes de salvar.'),
        ),
      );
      return;
    }

    setState(() => _salvando = true);
    try {
      await ref
          .read(precificacaoDaoProvider)
          .salvar(
            receitaId: _receitaSelecionada!.id,
            horasTrabalho: _horas,
            valorHora: _valorHora!,
            custoEmbalagem: _custoEmbalagem,
            custosFixosPercentual: _custosFixosPercentual,
            margemLucroPercentual: _margem,
          );
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Precificação salva.')));
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
    final receitasAsync = ref.watch(listaReceitasProvider);
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Precificação')),
      body: receitasAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (erro, _) =>
            Center(child: Text('Erro ao carregar receitas: $erro')),
        data: (receitas) {
          if (receitas.isEmpty) {
            return const _SemReceitas();
          }

          ReceitaResumo? resumoSelecionado;
          if (_receitaSelecionada != null) {
            for (final resumo in receitas) {
              if (resumo.receita.id == _receitaSelecionada!.id) {
                resumoSelecionado = resumo;
                break;
              }
            }
          }

          final calculo = CalculoPrecificacao(
            custoIngredientes: resumoSelecionado?.custoTotal ?? 0,
            horasTrabalho: _horas,
            valorHora: _valorHora ?? 0,
            custoEmbalagem: _custoEmbalagem,
            custosFixosPercentual: _custosFixosPercentual,
            margemLucroPercentual: _margem,
          );

          return Form(
            key: _formKey,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
              children: [
                DropdownButtonFormField<Receita>(
                  initialValue: _receitaSelecionada,
                  decoration: InputDecoration(
                    labelText: 'Receita',
                    errorText: _erroSemReceita ? 'Selecione uma receita' : null,
                  ),
                  isExpanded: true,
                  items: receitas
                      .map(
                        (resumo) => DropdownMenuItem(
                          value: resumo.receita,
                          child: Text(
                            resumo.receita.nome,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      )
                      .toList(),
                  onChanged: _selecionarReceita,
                ),
                if (_receitaSelecionada != null) ...[
                  const SizedBox(height: 24),
                  if (_carregandoConfiguracao)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 24),
                      child: Center(child: CircularProgressIndicator()),
                    )
                  else ...[
                    CampoHorasTrabalho(
                      horasController: _horasInteirasController,
                      minutosController: _minutosController,
                      onChanged: (_) => setState(() {}),
                    ),
                    const SizedBox(height: 16),
                    CampoValorHora(
                      valorHora: _valorHora,
                      editando: _editandoValorHora,
                      controller: _valorHoraInlineController,
                      onEditar: () => setState(() => _editandoValorHora = true),
                      onConfirmar: _confirmarValorHora,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _custoEmbalagemController,
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      decoration: const InputDecoration(
                        labelText: 'Custo da embalagem (R\$)',
                        hintText: 'Caixa, saco, forminha etc. — opcional',
                      ),
                      onChanged: (_) => setState(() {}),
                      validator: (valor) {
                        final numero = parseValorMonetario(valor ?? '');
                        if (numero == null || numero < 0) {
                          return 'Informe um valor válido';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _custosFixosController,
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      decoration: const InputDecoration(
                        labelText: 'Custos fixos (% sobre o custo direto)',
                      ),
                      onChanged: (_) => setState(() {}),
                      validator: (valor) {
                        final numero = parseValorMonetario(valor ?? '');
                        if (numero == null || numero < 0) {
                          return 'Informe um percentual válido';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Margem de lucro',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        SizedBox(
                          width: 88,
                          child: TextField(
                            controller: _margemController,
                            textAlign: TextAlign.end,
                            keyboardType: const TextInputType.numberWithOptions(
                              decimal: true,
                            ),
                            style: Theme.of(context).textTheme.titleMedium
                                ?.copyWith(
                                  color: colorScheme.primary,
                                  fontWeight: FontWeight.w700,
                                ),
                            decoration: const InputDecoration(
                              suffixText: '%',
                              isDense: true,
                              contentPadding: EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 8,
                              ),
                            ),
                            onChanged: _atualizarMargemPeloTexto,
                            onSubmitted: (_) => _atualizarMargem(_margem),
                          ),
                        ),
                      ],
                    ),
                    Slider(
                      value: _margem,
                      min: 0,
                      max: 200,
                      divisions: 200,
                      label: '${_margem.round()}%',
                      onChanged: _atualizarMargem,
                    ),
                    const SizedBox(height: 16),
                    DetalhamentoPrecificacao(
                      calculo: calculo,
                      rendimento: resumoSelecionado?.receita.rendimento ?? 1,
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
                          : const Text('Salvar precificação'),
                    ),
                  ],
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class _SemReceitas extends StatelessWidget {
  const _SemReceitas();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.calculate_outlined,
              size: 64,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 16),
            Text(
              'Nenhuma receita cadastrada',
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Cadastre uma receita na aba "Receitas" antes de calcular o '
              'preço de venda.',
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
