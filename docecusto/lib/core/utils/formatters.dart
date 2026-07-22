import 'package:intl/intl.dart';

final NumberFormat _moedaFormat = NumberFormat.currency(
  locale: 'pt_BR',
  symbol: 'R\$',
);

/// Formata um valor double como moeda brasileira (ex: "R$ 12,50").
String formatarMoeda(double valor) => _moedaFormat.format(valor);

/// Formata um preço "por unidade" (ex: preço por grama ou por ml), que
/// costuma ser um valor bem pequeno e ficaria zerado/impreciso com só 2
/// casas decimais. Usa até 4 casas quando o valor é menor que 10 centavos.
String formatarMoedaPorUnidade(double valor) {
  if (valor.abs() >= 0.1) return formatarMoeda(valor);
  return NumberFormat.currency(
    locale: 'pt_BR',
    symbol: 'R\$',
    decimalDigits: 4,
  ).format(valor);
}

/// Formata uma quantidade (ex: "300" ou "1,5"), sem casas decimais
/// desnecessárias.
String formatarQuantidade(double valor) {
  final padrao = valor == valor.roundToDouble() ? '#,##0' : '#,##0.##';
  return NumberFormat(padrao, 'pt_BR').format(valor);
}

/// Converte texto digitado pelo usuário (aceita vírgula ou ponto como
/// separador decimal) em double. Retorna null se o texto não for numérico.
double? parseValorMonetario(String texto) {
  var normalizado = texto.trim();
  if (normalizado.isEmpty) return null;

  final temVirgula = normalizado.contains(',');
  final temPonto = normalizado.contains('.');

  if (temVirgula && temPonto) {
    // Formato "1.234,56": ponto é milhar, vírgula é decimal.
    normalizado = normalizado.replaceAll('.', '').replaceAll(',', '.');
  } else if (temVirgula) {
    normalizado = normalizado.replaceAll(',', '.');
  }

  return double.tryParse(normalizado);
}
