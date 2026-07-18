import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/precificacao/calculo_precificacao.dart';
import '../../../data/local/database.dart';
import '../../precificacao/application/precificacao_providers.dart';
import '../../receitas/application/receitas_providers.dart';

/// Uma receita que já tem uma precificação salva, com o preço final já
/// calculado (custo dos ingredientes recalculado ao vivo + os parâmetros de
/// mão de obra/custos fixos/margem salvos na tela de Precificação).
class ReceitaPrecificada {
  const ReceitaPrecificada({required this.receita, required this.calculo});

  final Receita receita;
  final CalculoPrecificacao calculo;

  double get precoFinal => calculo.precoFinal;
}

/// Receitas com precificação salva, prontas para virar itens de um
/// orçamento. Só aparecem aqui receitas cuja precificação já foi salva na
/// aba "Preço".
final receitasPrecificadasProvider =
    FutureProvider.autoDispose<List<ReceitaPrecificada>>((ref) async {
      final receitas = await ref.watch(listaReceitasProvider.future);
      final precificacaoDao = ref.watch(precificacaoDaoProvider);

      final resultado = <ReceitaPrecificada>[];
      for (final resumo in receitas) {
        final configuracao = await precificacaoDao.buscarPorReceita(
          resumo.receita.id,
        );
        if (configuracao == null) continue;
        resultado.add(
          ReceitaPrecificada(
            receita: resumo.receita,
            calculo: CalculoPrecificacao(
              custoIngredientes: resumo.custoTotal,
              horasTrabalho: configuracao.horasTrabalho,
              valorHora: configuracao.valorHora,
              custosFixosPercentual: configuracao.custosFixosPercentual,
              margemLucroPercentual: configuracao.margemLucroPercentual,
            ),
          ),
        );
      }

      resultado.sort((a, b) => a.receita.nome.compareTo(b.receita.nome));
      return resultado;
    });
