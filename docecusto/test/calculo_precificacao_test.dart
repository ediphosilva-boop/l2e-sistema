import 'package:docecusto/core/precificacao/calculo_precificacao.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('CalculoPrecificacao', () {
    test('ingredientes R\$ 20,00 + 2h x R\$ 25,00/h; +10% fixos; margem 50% '
        '=> preço final R\$ 115,50', () {
      const calculo = CalculoPrecificacao(
        custoIngredientes: 20,
        horasTrabalho: 2,
        valorHora: 25,
        custosFixosPercentual: 10,
        margemLucroPercentual: 50,
      );

      expect(calculo.custoMaoDeObra, closeTo(50.0, 0.001));
      expect(calculo.custoDireto, closeTo(70.0, 0.001));
      expect(calculo.valorCustosFixos, closeTo(7.0, 0.001));
      expect(calculo.subtotal, closeTo(77.0, 0.001));
      expect(calculo.valorMargem, closeTo(38.5, 0.001));
      expect(calculo.precoFinal, closeTo(115.5, 0.001));
    });

    test('margem 0% não adiciona nada ao subtotal', () {
      const calculo = CalculoPrecificacao(
        custoIngredientes: 10,
        horasTrabalho: 0,
        valorHora: 0,
        custosFixosPercentual: 0,
        margemLucroPercentual: 0,
      );

      expect(calculo.precoFinal, closeTo(10.0, 0.001));
    });

    test('margem 200% (limite máximo do slider) dobra o subtotal', () {
      const calculo = CalculoPrecificacao(
        custoIngredientes: 10,
        horasTrabalho: 0,
        valorHora: 0,
        custosFixosPercentual: 0,
        margemLucroPercentual: 200,
      );

      expect(calculo.precoFinal, closeTo(30.0, 0.001));
    });

    test('sem horas de trabalho, custo direto é só o dos ingredientes', () {
      const calculo = CalculoPrecificacao(
        custoIngredientes: 15,
        horasTrabalho: 0,
        valorHora: 30,
        custosFixosPercentual: 0,
        margemLucroPercentual: 0,
      );

      expect(calculo.custoMaoDeObra, 0);
      expect(calculo.custoDireto, 15);
    });
  });
}
