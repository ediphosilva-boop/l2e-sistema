import 'package:intl/intl.dart';

final NumberFormat _moedaFormat = NumberFormat.currency(
  locale: 'pt_BR',
  symbol: 'R\$',
);

/// Formata um valor double como moeda brasileira (ex: "R$ 12,50").
String formatarMoeda(double valor) => _moedaFormat.format(valor);

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
