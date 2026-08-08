import 'package:docecusto/data/local/daos/orcamentos_dao.dart';
import 'package:docecusto/data/local/database.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('OrcamentoDetalhe', () {
    final cliente = Cliente(
      id: 1,
      nome: 'Ana',
      telefone: null,
      email: null,
      endereco: null,
    );
    const itens = [
      ItemOrcamentoRascunho(
        descricao: 'Bolo',
        quantidade: 2,
        precoUnitario: 50,
      ),
    ];

    test('total é o subtotal quando não há desconto', () {
      final orcamento = Orcamento(
        id: 1,
        clienteId: 1,
        criadoEm: DateTime(2026, 1, 1),
        validadeDias: 7,
        observacoes: null,
        desconto: 0,
      );
      final detalhe = OrcamentoDetalhe(
        orcamento: orcamento,
        cliente: cliente,
        itens: itens,
      );

      expect(detalhe.subtotal, 100);
      expect(detalhe.desconto, 0);
      expect(detalhe.total, 100);
    });

    test('desconto reduz o total', () {
      final orcamento = Orcamento(
        id: 2,
        clienteId: 1,
        criadoEm: DateTime(2026, 1, 1),
        validadeDias: 7,
        observacoes: null,
        desconto: 30,
      );
      final detalhe = OrcamentoDetalhe(
        orcamento: orcamento,
        cliente: cliente,
        itens: itens,
      );

      expect(detalhe.subtotal, 100);
      expect(detalhe.desconto, 30);
      expect(detalhe.total, 70);
    });

    test(
      'total nunca fica negativo mesmo com desconto maior que o subtotal',
      () {
        final orcamento = Orcamento(
          id: 3,
          clienteId: 1,
          criadoEm: DateTime(2026, 1, 1),
          validadeDias: 7,
          observacoes: null,
          desconto: 500,
        );
        final detalhe = OrcamentoDetalhe(
          orcamento: orcamento,
          cliente: cliente,
          itens: itens,
        );

        expect(detalhe.total, 0);
      },
    );
  });
}
