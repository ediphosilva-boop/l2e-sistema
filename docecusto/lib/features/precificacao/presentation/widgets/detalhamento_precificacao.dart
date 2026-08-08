import 'package:flutter/material.dart';

import '../../../../core/precificacao/calculo_precificacao.dart';
import '../../../../core/utils/formatters.dart';

/// Lista o detalhamento completo do cálculo: custo dos ingredientes, mão de
/// obra, custos fixos, subtotal, margem em R$ e preço final sugerido.
class DetalhamentoPrecificacao extends StatelessWidget {
  const DetalhamentoPrecificacao({
    super.key,
    required this.calculo,
    this.rendimento = 1,
  });

  final CalculoPrecificacao calculo;

  /// Quantas porções/unidades a receita rende. Quando maior que 1, mostra
  /// também o preço sugerido por unidade — útil quando a receita é feita em
  /// lote (ex: 25 brownies) mas vendida por unidade.
  final int rendimento;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: colorScheme.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _Linha(
            rotulo: 'Custo dos ingredientes',
            valor: calculo.custoIngredientes,
          ),
          _Linha(rotulo: 'Mão de obra', valor: calculo.custoMaoDeObra),
          if (calculo.custoEmbalagem > 0)
            _Linha(rotulo: 'Embalagem', valor: calculo.custoEmbalagem),
          _Linha(
            rotulo:
                'Custos fixos (${_formatarPercentual(calculo.custosFixosPercentual)})',
            valor: calculo.valorCustosFixos,
          ),
          const Divider(height: 24),
          _Linha(rotulo: 'Subtotal', valor: calculo.subtotal, destaque: true),
          _Linha(
            rotulo:
                'Margem de lucro (${_formatarPercentual(calculo.margemLucroPercentual)})',
            valor: calculo.valorMargem,
          ),
          const Divider(height: 24),
          _Linha(
            rotulo: rendimento > 1
                ? 'Preço sugerido (receita inteira)'
                : 'Preço sugerido',
            valor: calculo.precoFinal,
            destaque: true,
            grande: rendimento <= 1,
            cor: colorScheme.primary,
          ),
          if (rendimento > 1)
            _Linha(
              rotulo: 'Preço sugerido por unidade (rende $rendimento)',
              valor: calculo.precoFinal / rendimento,
              destaque: true,
              grande: true,
              cor: colorScheme.primary,
            ),
        ],
      ),
    );
  }

  static String _formatarPercentual(double valor) {
    final inteiro = valor == valor.roundToDouble();
    return inteiro ? '${valor.round()}%' : '${valor.toStringAsFixed(1)}%';
  }
}

class _Linha extends StatelessWidget {
  const _Linha({
    required this.rotulo,
    required this.valor,
    this.destaque = false,
    this.grande = false,
    this.cor,
  });

  final String rotulo;
  final double valor;
  final bool destaque;
  final bool grande;
  final Color? cor;

  @override
  Widget build(BuildContext context) {
    final estiloBase = grande
        ? Theme.of(context).textTheme.titleLarge
        : Theme.of(context).textTheme.bodyLarge;
    final estilo = estiloBase?.copyWith(
      fontWeight: destaque ? FontWeight.w700 : FontWeight.w400,
      color: cor,
    );
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(child: Text(rotulo, style: estilo)),
          Text(formatarMoeda(valor), style: estilo),
        ],
      ),
    );
  }
}
