import 'package:drift/drift.dart';

import '../../../core/units/unidade_medida.dart';
import '../database.dart';
import '../ingrediente_extensions.dart';
import '../tables.dart';

part 'receitas_dao.g.dart';

/// Um ingrediente com a quantidade usada em uma receita, já com o custo
/// proporcional calculado. [id] é o id da linha em `receita_ingredientes`;
/// é nulo enquanto o item ainda não foi salvo (rascunho no formulário).
class ItemReceitaEditavel {
  const ItemReceitaEditavel({
    this.id,
    required this.ingrediente,
    required this.quantidade,
    required this.unidadeMedida,
  });

  final int? id;
  final Ingrediente ingrediente;
  final double quantidade;
  final UnidadeMedida unidadeMedida;

  /// Custo proporcional deste item, convertendo [quantidade] (em
  /// [unidadeMedida]) para a unidade em que o ingrediente tem seu preço
  /// cadastrado.
  double get custo =>
      converterQuantidade(
        quantidade,
        unidadeMedida,
        ingrediente.unidadeMedida,
      ) *
      ingrediente.precoUnidade;

  ItemReceitaEditavel copyWith({
    double? quantidade,
    UnidadeMedida? unidadeMedida,
  }) {
    return ItemReceitaEditavel(
      id: id,
      ingrediente: ingrediente,
      quantidade: quantidade ?? this.quantidade,
      unidadeMedida: unidadeMedida ?? this.unidadeMedida,
    );
  }
}

/// Resumo de uma receita para a tela de listagem: dados da receita + custo
/// total já somado a partir dos ingredientes vinculados.
class ReceitaResumo {
  const ReceitaResumo({
    required this.receita,
    required this.custoTotal,
    required this.totalIngredientes,
  });

  final Receita receita;
  final double custoTotal;
  final int totalIngredientes;
}

@DriftAccessor(tables: [Receitas, ReceitaIngredientes, Ingredientes])
class ReceitasDao extends DatabaseAccessor<AppDatabase>
    with _$ReceitasDaoMixin {
  ReceitasDao(super.db);

  /// Observa a lista de receitas (com filtro opcional por nome), já com o
  /// custo total de cada uma calculado a partir dos ingredientes vinculados.
  /// Reemite automaticamente quando receitas, ingredientes ou os vínculos
  /// entre eles mudam.
  Stream<List<ReceitaResumo>> watchLista({String? filtro}) {
    final consulta = select(receitas).join([
      leftOuterJoin(
        receitaIngredientes,
        receitaIngredientes.receitaId.equalsExp(receitas.id),
      ),
      leftOuterJoin(
        ingredientes,
        ingredientes.id.equalsExp(receitaIngredientes.ingredienteId),
      ),
    ]);

    final termo = filtro?.trim();
    if (termo != null && termo.isNotEmpty) {
      consulta.where(receitas.nome.like('%$termo%'));
    }

    return consulta.watch().map((linhas) {
      final porReceita = <int, List<TypedResult>>{};
      for (final linha in linhas) {
        final receita = linha.readTable(receitas);
        porReceita.putIfAbsent(receita.id, () => []).add(linha);
      }

      final resumos = porReceita.values.map((linhasDaReceita) {
        final receita = linhasDaReceita.first.readTable(receitas);
        var custoTotal = 0.0;
        var totalIngredientes = 0;

        for (final linha in linhasDaReceita) {
          final ingrediente = linha.readTableOrNull(ingredientes);
          final vinculo = linha.readTableOrNull(receitaIngredientes);
          if (ingrediente == null || vinculo == null) continue;
          custoTotal +=
              converterQuantidade(
                vinculo.quantidade,
                vinculo.unidadeMedida,
                ingrediente.unidadeMedida,
              ) *
              ingrediente.precoUnidade;
          totalIngredientes++;
        }

        return ReceitaResumo(
          receita: receita,
          custoTotal: custoTotal,
          totalIngredientes: totalIngredientes,
        );
      }).toList();

      resumos.sort((a, b) => a.receita.nome.compareTo(b.receita.nome));
      return resumos;
    });
  }

  /// Busca os itens (ingrediente + quantidade) já salvos de uma receita,
  /// para pré-preencher o formulário de edição.
  Future<List<ItemReceitaEditavel>> buscarItens(int receitaId) async {
    final consulta =
        select(receitaIngredientes).join([
            innerJoin(
              ingredientes,
              ingredientes.id.equalsExp(receitaIngredientes.ingredienteId),
            ),
          ])
          ..where(receitaIngredientes.receitaId.equals(receitaId))
          ..orderBy([OrderingTerm(expression: ingredientes.nome)]);

    final linhas = await consulta.get();
    return linhas.map((linha) {
      final vinculo = linha.readTable(receitaIngredientes);
      final ingrediente = linha.readTable(ingredientes);
      return ItemReceitaEditavel(
        id: vinculo.id,
        ingrediente: ingrediente,
        quantidade: vinculo.quantidade,
        unidadeMedida: vinculo.unidadeMedida,
      );
    }).toList();
  }

  /// Cria (quando [receitaId] é nulo) ou atualiza uma receita e substitui
  /// integralmente a lista de ingredientes vinculados, em uma transação.
  Future<int> salvar({
    int? receitaId,
    required String nome,
    int? tempoPreparoMinutos,
    required List<ItemReceitaEditavel> itens,
  }) {
    return transaction(() async {
      final int id;
      if (receitaId == null) {
        id = await into(receitas).insert(
          ReceitasCompanion.insert(
            nome: nome,
            tempoPreparoMinutos: Value(tempoPreparoMinutos),
          ),
        );
      } else {
        id = receitaId;
        await (update(receitas)..where((t) => t.id.equals(id))).write(
          ReceitasCompanion(
            nome: Value(nome),
            tempoPreparoMinutos: Value(tempoPreparoMinutos),
            atualizadoEm: Value(DateTime.now()),
          ),
        );
      }

      await (delete(
        receitaIngredientes,
      )..where((t) => t.receitaId.equals(id))).go();

      if (itens.isNotEmpty) {
        await batch((b) {
          b.insertAll(
            receitaIngredientes,
            itens.map(
              (item) => ReceitaIngredientesCompanion.insert(
                receitaId: id,
                ingredienteId: item.ingrediente.id,
                quantidade: item.quantidade,
                unidadeMedida: item.unidadeMedida,
              ),
            ),
          );
        });
      }

      return id;
    });
  }

  Future<int> excluir(int id) {
    return (delete(receitas)..where((t) => t.id.equals(id))).go();
  }

  /// Nomes das receitas que usam o ingrediente [ingredienteId], usado para
  /// avisar a usuária antes de excluir um ingrediente em uso.
  Future<List<String>> nomesReceitasQueUsam(int ingredienteId) async {
    final consulta = selectOnly(receitaIngredientes, distinct: true)
      ..addColumns([receitas.nome])
      ..join([
        innerJoin(
          receitas,
          receitas.id.equalsExp(receitaIngredientes.receitaId),
        ),
      ])
      ..where(receitaIngredientes.ingredienteId.equals(ingredienteId))
      ..orderBy([OrderingTerm(expression: receitas.nome)]);

    final linhas = await consulta.get();
    return linhas.map((linha) => linha.read(receitas.nome)!).toList();
  }
}
