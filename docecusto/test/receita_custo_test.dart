import 'package:docecusto/core/units/unidade_medida.dart';
import 'package:docecusto/data/local/daos/receitas_dao.dart';
import 'package:docecusto/data/local/database.dart';
import 'package:docecusto/data/local/ingrediente_extensions.dart';
import 'package:flutter_test/flutter_test.dart';

Ingrediente _ingrediente({
  required String nome,
  required UnidadeMedida unidade,
  required double preco,
  double quantidadeEmbalagem = 1,
}) {
  final agora = DateTime(2026, 1, 1);
  return Ingrediente(
    id: 1,
    nome: nome,
    unidadeMedida: unidade,
    quantidadeEmbalagem: quantidadeEmbalagem,
    precoEmbalagem: preco,
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

    test('converte xícara para mililitro', () {
      expect(
        converterQuantidade(2, UnidadeMedida.xicara, UnidadeMedida.mililitro),
        480,
      );
    });

    test('converte colher de sopa para mililitro', () {
      expect(
        converterQuantidade(
          3,
          UnidadeMedida.colherSopa,
          UnidadeMedida.mililitro,
        ),
        45,
      );
    });

    test('converte litro para colher de chá', () {
      expect(
        converterQuantidade(0.1, UnidadeMedida.litro, UnidadeMedida.colherCha),
        closeTo(20, 0.001),
      );
    });
  });

  group('Ingrediente por embalagem', () {
    test(
      'preço por unidade é derivado da embalagem (óleo 900 ml por R\$ 8,00)',
      () {
        final oleo = _ingrediente(
          nome: 'Óleo de soja',
          unidade: UnidadeMedida.mililitro,
          quantidadeEmbalagem: 900,
          preco: 8.0,
        );

        expect(oleo.precoUnidade, closeTo(8.0 / 900, 0.0001));
      },
    );

    test('óleo comprado em embalagem usado em colheres de sopa na receita', () {
      final oleo = _ingrediente(
        nome: 'Óleo de soja',
        unidade: UnidadeMedida.mililitro,
        quantidadeEmbalagem: 900,
        preco: 8.0,
      );
      final item = ItemReceitaEditavel(
        ingrediente: oleo,
        quantidade: 2,
        unidadeMedida: UnidadeMedida.colherSopa,
      );

      // 2 colheres de sopa = 30 ml; custo = 30 * (8 / 900).
      expect(item.custo, closeTo(30 * (8.0 / 900), 0.0001));
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
