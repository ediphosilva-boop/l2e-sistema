import 'package:docecusto/data/local/daos/configuracoes_gerais_dao.dart';
import 'package:docecusto/data/local/daos/orcamentos_dao.dart';
import 'package:docecusto/data/local/database.dart';
import 'package:docecusto/features/orcamentos/application/orcamento_pdf_service.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('gerarPdfOrcamento', () {
    test('gera um PDF válido com nomes longos, sem lançar exceção', () async {
      final orcamento = Orcamento(
        id: 1,
        clienteId: 1,
        criadoEm: DateTime(2026, 3, 10),
        validadeDias: 7,
        observacoes:
            'Entregar embalado para presente, retirar às 14h no endereço '
            'combinado por telefone com pelo menos um dia de antecedência.',
        desconto: 0,
      );
      final cliente = Cliente(
        id: 1,
        nome: 'Maria Fernanda Albuquerque de Oliveira Santos Rodrigues Pereira',
        telefone: '(11) 99999-0000',
        email: null,
        endereco: null,
      );
      final itens = [
        const ItemOrcamentoRascunho(
          receitaId: 1,
          descricao:
              'Bolo de Chocolate Belga com Recheio de Brigadeiro Gourmet '
              'e Cobertura de Ganache Meio Amargo Artesanal',
          quantidade: 2,
          precoUnitario: 85.9,
        ),
        const ItemOrcamentoRascunho(
          receitaId: 2,
          descricao:
              'Cento de Brigadeiros Gourmet Sortidos (Ninho, Nutella, '
              'Oreo, Beijinho e Maracujá com Chocolate Branco)',
          quantidade: 3,
          precoUnitario: 120.0,
        ),
      ];
      final detalhe = OrcamentoDetalhe(
        orcamento: orcamento,
        cliente: cliente,
        itens: itens,
      );

      final bytes = await gerarPdfOrcamento(
        detalhe: detalhe,
        perfil: const PerfilEmpresa(
          nome: 'Ateliê de Doces da Confeiteira Extraordinária e Premiadíssima',
          telefone: '(11) 99999-0000',
          endereco: 'Rua das Flores, 123 - São Paulo/SP',
          redesSociais: '@ateliedadoceria',
        ),
      );

      expect(bytes, isNotEmpty);
      // Assinatura do formato PDF ("%PDF-"), confirma que é um arquivo válido.
      expect(String.fromCharCodes(bytes.take(5)), '%PDF-');
    });

    test('funciona sem nome de negócio definido e sem observações', () async {
      final orcamento = Orcamento(
        id: 2,
        clienteId: 1,
        criadoEm: DateTime(2026, 1, 1),
        validadeDias: 7,
        observacoes: null,
        desconto: 0,
      );
      final cliente = Cliente(
        id: 1,
        nome: 'Ana',
        telefone: null,
        email: null,
        endereco: null,
      );
      const itens = [
        ItemOrcamentoRascunho(
          descricao: 'Docinho',
          quantidade: 1,
          precoUnitario: 5,
        ),
      ];
      final detalhe = OrcamentoDetalhe(
        orcamento: orcamento,
        cliente: cliente,
        itens: itens,
      );

      final bytes = await gerarPdfOrcamento(
        detalhe: detalhe,
        perfil: const PerfilEmpresa(),
      );

      expect(bytes, isNotEmpty);
      expect(String.fromCharCodes(bytes.take(5)), '%PDF-');
    });

    test('lida com um único item de quantidade fracionária', () async {
      final orcamento = Orcamento(
        id: 3,
        clienteId: 1,
        criadoEm: DateTime(2026, 5, 20),
        validadeDias: 15,
        observacoes: null,
        desconto: 0,
      );
      final cliente = Cliente(
        id: 1,
        nome: 'João',
        telefone: '11999998888',
        email: null,
        endereco: null,
      );
      const itens = [
        ItemOrcamentoRascunho(
          descricao: 'Torta de Limão (fatia)',
          quantidade: 1.5,
          precoUnitario: 12.5,
        ),
      ];
      final detalhe = OrcamentoDetalhe(
        orcamento: orcamento,
        cliente: cliente,
        itens: itens,
      );

      final bytes = await gerarPdfOrcamento(
        detalhe: detalhe,
        perfil: const PerfilEmpresa(nome: 'Doces da Jú'),
      );

      expect(bytes, isNotEmpty);
    });
  });
}
