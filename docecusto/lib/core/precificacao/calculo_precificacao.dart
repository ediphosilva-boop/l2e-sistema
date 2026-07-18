/// Cálculo puro do preço sugerido de venda de uma receita, a partir do
/// custo dos ingredientes, mão de obra, custos fixos (percentual sobre o
/// custo direto) e margem de lucro desejada (percentual sobre o subtotal).
///
/// Exemplo: ingredientes R$ 20,00 + 2h × R$ 25,00/h de mão de obra = R$ 70,00
/// de custo direto; +10% de custos fixos = R$ 77,00; margem de 50% sobre o
/// subtotal = R$ 115,50 de preço final.
class CalculoPrecificacao {
  const CalculoPrecificacao({
    required this.custoIngredientes,
    required this.horasTrabalho,
    required this.valorHora,
    required this.custosFixosPercentual,
    required this.margemLucroPercentual,
  });

  final double custoIngredientes;
  final double horasTrabalho;
  final double valorHora;

  /// Percentual (0-100+) aplicado sobre o custo direto.
  final double custosFixosPercentual;

  /// Percentual (0-200 na tela) aplicado sobre o subtotal.
  final double margemLucroPercentual;

  double get custoMaoDeObra => horasTrabalho * valorHora;

  double get custoDireto => custoIngredientes + custoMaoDeObra;

  double get valorCustosFixos => custoDireto * (custosFixosPercentual / 100);

  double get subtotal => custoDireto + valorCustosFixos;

  double get valorMargem => subtotal * (margemLucroPercentual / 100);

  double get precoFinal => subtotal + valorMargem;
}
