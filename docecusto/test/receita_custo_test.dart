import 'package:docecusto/core/units/unidade_medida.dart';
import 'package:docecusto/data/local/daos/receitas_dao.dart';
import 'package:docecusto/data/local/database.dart';
import 'package:flutter_test/flutter_test.dart';

Ingrediente _ingrediente({
  required String nome,
  required UnidadeMedida unidade,
  required double preco,
}) {
  final agora = DateTime(2026, 1, 1);
  return Ingrediente(
    id: 1,
    nome: nome,
    unidadeMedida: unidade,
    precoUnidade: preco,
    criadoEm: agora,
    atualizadoEm: agora,
  );
}

void main() {
  group('converterQuantidade', () {
    test('converte grama para quilograma', () {
      expect(
        converterQuantidade(300, UnidadeMedida.grama, UnidadeMedida.quilograma),
        0.3,
      );
    });

    test('converte litro para mililitro', () {
      expect(
        converterQuantidade(1.5, UnidadeMedida.litro, UnidadeMedida.mililitro),
        1500,
      );
    });

    test('lança erro ao converter entre famílias diferentes', () {
      expect(
        () => converterQuantidade(1, UnidadeMedida.grama, UnidadeMedida.litro),
        throwsArgumentError,
      );
    });
  });

  group('ItemReceitaEditavel.custo', () {
    test('farinha a R\$ 8,00/kg, receita usa 300 g => custo R\$ 2,40', () {
      final farinha = _ingrediente(
        nome: 'Farinha de trigo',
        unidade: UnidadeMedida.quilograma,
        preco: 8,
      );
      final item = ItemReceitaEditavel(
        ingrediente: farinha,
        quantidade: 300,
        unidadeMedida: UnidadeMedida.grama,
      );

      expect(item.custo, closeTo(2.40, 0.001));
    });

    test('quando a unidade da receita é igual à do ingrediente', () {
      final leite = _ingrediente(
        nome: 'Leite',
        unidade: UnidadeMedida.mililitro,
        preco: 0.01,
      );
      final item = ItemReceitaEditavel(
        ingrediente: leite,
        quantidade: 500,
        unidadeMedida: UnidadeMedida.mililitro,
      );

      expect(item.custo, closeTo(5.0, 0.001));
    });

    test('ingrediente por unidade (ovo)', () {
      final ovo = _ingrediente(
        nome: 'Ovo',
        unidade: UnidadeMedida.unidade,
        preco: 0.75,
      );
      final item = ItemReceitaEditavel(
        ingrediente: ovo,
        quantidade: 3,
        unidadeMedida: UnidadeMedida.unidade,
      );

      expect(item.custo, closeTo(2.25, 0.001));
    });
  });
}
