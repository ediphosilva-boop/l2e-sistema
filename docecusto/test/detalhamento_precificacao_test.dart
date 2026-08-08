import 'package:docecusto/core/precificacao/calculo_precificacao.dart';
import 'package:docecusto/core/utils/formatters.dart';
import 'package:docecusto/features/precificacao/presentation/widgets/detalhamento_precificacao.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  const calculo = CalculoPrecificacao(
    custoIngredientes: 20,
    horasTrabalho: 2,
    valorHora: 25,
    custosFixosPercentual: 10,
    margemLucroPercentual: 50,
  );

  Future<void> pump(WidgetTester tester, int rendimento) {
    return tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: DetalhamentoPrecificacao(
            calculo: calculo,
            rendimento: rendimento,
          ),
        ),
      ),
    );
  }

  testWidgets('sem rendimento informado (1), não mostra preço por unidade', (
    tester,
  ) async {
    await pump(tester, 1);

    expect(find.textContaining('receita inteira'), findsNothing);
    expect(find.textContaining('por unidade'), findsNothing);
    expect(find.text('Preço sugerido'), findsOneWidget);
    expect(find.text(formatarMoeda(calculo.precoFinal)), findsOneWidget);
  });

  testWidgets('com rendimento > 1, mostra preço total e por unidade', (
    tester,
  ) async {
    await pump(tester, 25);

    expect(find.text('Preço sugerido (receita inteira)'), findsOneWidget);
    expect(find.text('Preço sugerido por unidade (rende 25)'), findsOneWidget);
    expect(find.text(formatarMoeda(calculo.precoFinal / 25)), findsOneWidget);
  });
}
