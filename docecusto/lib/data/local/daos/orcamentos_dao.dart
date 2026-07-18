import 'package:drift/drift.dart';

import '../database.dart';
import '../tables.dart';

part 'orcamentos_dao.g.dart';

/// Um item de orçamento (receita + quantidade + preço unitário já
/// calculado no momento em que foi adicionado). [id] é o id da linha em
/// `orcamento_itens`; é nulo enquanto o item ainda não foi salvo.
class ItemOrcamentoRascunho {
  const ItemOrcamentoRascunho({
    this.id,
    this.receitaId,
    required this.descricao,
    required this.quantidade,
    required this.precoUnitario,
  });

  final int? id;
  final int? receitaId;
  final String descricao;
  final double quantidade;
  final double precoUnitario;

  double get subtotal => quantidade * precoUnitario;
}

/// Resumo de um orçamento para o histórico: cliente, data e total já
/// somado a partir dos itens.
class OrcamentoResumo {
  const OrcamentoResumo({
    required this.orcamento,
    required this.cliente,
    required this.total,
  });

  final Orcamento orcamento;
  final Cliente cliente;
  final double total;
}

/// Um orçamento completo, com cliente e itens, para exibir na tela de
/// detalhe e gerar o PDF.
class OrcamentoDetalhe {
  const OrcamentoDetalhe({
    required this.orcamento,
    required this.cliente,
    required this.itens,
  });

  final Orcamento orcamento;
  final Cliente cliente;
  final List<ItemOrcamentoRascunho> itens;

  double get total => itens.fold(0, (soma, item) => soma + item.subtotal);
}

@DriftAccessor(tables: [Orcamentos, OrcamentoItens, Clientes])
class OrcamentosDao extends DatabaseAccessor<AppDatabase>
    with _$OrcamentosDaoMixin {
  OrcamentosDao(super.db);

  /// Observa o histórico de orçamentos (mais recentes primeiro), com filtro
  /// opcional pelo nome do cliente, já com o total de cada um calculado a
  /// partir dos itens.
  Stream<List<OrcamentoResumo>> watchHistorico({String? filtro}) {
    final consulta = select(orcamentos).join([
      innerJoin(clientes, clientes.id.equalsExp(orcamentos.clienteId)),
      leftOuterJoin(
        orcamentoItens,
        orcamentoItens.orcamentoId.equalsExp(orcamentos.id),
      ),
    ]);

    final termo = filtro?.trim();
    if (termo != null && termo.isNotEmpty) {
      consulta.where(clientes.nome.like('%$termo%'));
    }

    return consulta.watch().map((linhas) {
      final porOrcamento = <int, List<TypedResult>>{};
      for (final linha in linhas) {
        final orcamento = linha.readTable(orcamentos);
        porOrcamento.putIfAbsent(orcamento.id, () => []).add(linha);
      }

      final resumos = porOrcamento.values.map((linhasDoOrcamento) {
        final orcamento = linhasDoOrcamento.first.readTable(orcamentos);
        final cliente = linhasDoOrcamento.first.readTable(clientes);
        var total = 0.0;
        for (final linha in linhasDoOrcamento) {
          final item = linha.readTableOrNull(orcamentoItens);
          if (item == null) continue;
          total += item.quantidade * item.precoUnitario;
        }
        return OrcamentoResumo(
          orcamento: orcamento,
          cliente: cliente,
          total: total,
        );
      }).toList();

      resumos.sort(
        (a, b) => b.orcamento.criadoEm.compareTo(a.orcamento.criadoEm),
      );
      return resumos;
    });
  }

  /// Busca um orçamento completo (cliente + itens) para reabrir na tela de
  /// detalhe ou gerar o PDF novamente.
  Future<OrcamentoDetalhe> buscarDetalhe(int orcamentoId) async {
    final orcamento = await (select(
      orcamentos,
    )..where((t) => t.id.equals(orcamentoId))).getSingle();
    final cliente = await (select(
      clientes,
    )..where((t) => t.id.equals(orcamento.clienteId))).getSingle();
    final linhasItens = await (select(
      orcamentoItens,
    )..where((t) => t.orcamentoId.equals(orcamentoId))).get();

    final itens = linhasItens
        .map(
          (item) => ItemOrcamentoRascunho(
            id: item.id,
            receitaId: item.receitaId,
            descricao: item.descricao,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
          ),
        )
        .toList();

    return OrcamentoDetalhe(
      orcamento: orcamento,
      cliente: cliente,
      itens: itens,
    );
  }

  /// Cria um novo orçamento com seus itens, em uma transação. Retorna o id
  /// do orçamento criado.
  Future<int> salvar({
    required int clienteId,
    required int validadeDias,
    String? observacoes,
    required List<ItemOrcamentoRascunho> itens,
  }) {
    return transaction(() async {
      final id = await into(orcamentos).insert(
        OrcamentosCompanion.insert(
          clienteId: clienteId,
          validadeDias: Value(validadeDias),
          observacoes: Value(observacoes),
        ),
      );

      await batch((b) {
        b.insertAll(
          orcamentoItens,
          itens.map(
            (item) => OrcamentoItensCompanion.insert(
              orcamentoId: id,
              receitaId: Value(item.receitaId),
              descricao: item.descricao,
              quantidade: Value(item.quantidade),
              precoUnitario: item.precoUnitario,
            ),
          ),
        );
      });

      return id;
    });
  }
}
