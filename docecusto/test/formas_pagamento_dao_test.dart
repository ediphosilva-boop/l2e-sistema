import 'package:docecusto/data/local/database.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('FormasPagamentoDao', () {
    late AppDatabase db;

    setUp(() {
      db = AppDatabase.paraTestes(NativeDatabase.memory());
    });

    tearDown(() => db.close());

    test('criar salva nome e desconto percentual', () async {
      final forma = await db.formasPagamentoDao.criar(
        nome: 'Pix',
        descontoPercentual: 10,
      );

      expect(forma.nome, 'Pix');
      expect(forma.descontoPercentual, 10);
    });

    test('desconto percentual padrão é zero quando não informado', () async {
      final forma = await db.formasPagamentoDao.criar(nome: 'Dinheiro');

      expect(forma.descontoPercentual, 0);
    });

    test(
      'watchTodas retorna as formas cadastradas em ordem alfabética',
      () async {
        await db.formasPagamentoDao.criar(nome: 'Pix', descontoPercentual: 10);
        await db.formasPagamentoDao.criar(
          nome: 'Débito',
          descontoPercentual: 5,
        );

        final formas = await db.formasPagamentoDao.watchTodas().first;

        expect(formas.map((f) => f.nome), ['Débito', 'Pix']);
      },
    );
  });
}
