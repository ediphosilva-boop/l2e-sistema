import 'package:flutter/services.dart';

/// Formata o telefone conforme a usuária digita, no padrão brasileiro:
/// (11) 98765-4321 (celular, 11 dígitos) ou (11) 3456-7890 (fixo, 10
/// dígitos) — a posição do hífen muda sozinha ao digitar o 11º dígito.
class TelefoneInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final digitos = newValue.text.replaceAll(RegExp(r'[^0-9]'), '');
    final limitados = digitos.length > 11 ? digitos.substring(0, 11) : digitos;
    final ehCelular = limitados.length == 11;
    final posicaoHifen = ehCelular ? 6 : 5;

    final buffer = StringBuffer();
    for (var i = 0; i < limitados.length; i++) {
      if (i == 0) buffer.write('(');
      buffer.write(limitados[i]);
      if (i == 1) buffer.write(') ');
      if (i == posicaoHifen) buffer.write('-');
    }

    final texto = buffer.toString();
    return TextEditingValue(
      text: texto,
      selection: TextSelection.collapsed(offset: texto.length),
    );
  }
}
