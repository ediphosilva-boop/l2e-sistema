import 'package:docecusto/core/utils/formatters.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('formatarTelefone', () {
    test('formata celular de 11 dígitos', () {
      expect(formatarTelefone('11987654321'), '(11) 98765-4321');
    });

    test('formata fixo de 10 dígitos', () {
      expect(formatarTelefone('1134567890'), '(11) 3456-7890');
    });

    test('mantém pontuação já digitada corretamente', () {
      expect(formatarTelefone('(11) 98765-4321'), '(11) 98765-4321');
    });

    test('remove o DDI 55 quando presente', () {
      expect(formatarTelefone('5511987654321'), '(11) 98765-4321');
    });

    test('devolve o texto original se não tiver 10 ou 11 dígitos', () {
      expect(formatarTelefone('123'), '123');
    });

    test('string vazia ou nula devolve vazio', () {
      expect(formatarTelefone(''), '');
      expect(formatarTelefone(null), '');
    });
  });
}
