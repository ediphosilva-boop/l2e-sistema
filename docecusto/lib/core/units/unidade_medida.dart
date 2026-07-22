/// Unidades de medida aceitas para ingredientes e itens de receita.
///
/// `xicara`, `colherSopa` e `colherCha` são medidas culinárias de volume
/// (equivalências padrão brasileiras), úteis para lançar quantidades de
/// receita sem precisar converter manualmente para ml.
enum UnidadeMedida {
  grama,
  quilograma,
  mililitro,
  litro,
  xicara,
  colherSopa,
  colherCha,
  unidade,
}

extension UnidadeMedidaX on UnidadeMedida {
  /// Sigla curta usada em listas e resumos (ex: "kg", "un").
  String get sigla => switch (this) {
    UnidadeMedida.grama => 'g',
    UnidadeMedida.quilograma => 'kg',
    UnidadeMedida.mililitro => 'ml',
    UnidadeMedida.litro => 'l',
    UnidadeMedida.xicara => 'xíc',
    UnidadeMedida.colherSopa => 'c.sopa',
    UnidadeMedida.colherCha => 'c.chá',
    UnidadeMedida.unidade => 'un',
  };

  /// Rótulo completo usado em formulários (dropdowns).
  String get rotulo => switch (this) {
    UnidadeMedida.grama => 'Grama (g)',
    UnidadeMedida.quilograma => 'Quilograma (kg)',
    UnidadeMedida.mililitro => 'Mililitro (ml)',
    UnidadeMedida.litro => 'Litro (l)',
    UnidadeMedida.xicara => 'Xícara (240 ml)',
    UnidadeMedida.colherSopa => 'Colher de sopa (15 ml)',
    UnidadeMedida.colherCha => 'Colher de chá (5 ml)',
    UnidadeMedida.unidade => 'Unidade (un)',
  };

  bool get ehMassa =>
      this == UnidadeMedida.grama || this == UnidadeMedida.quilograma;

  bool get ehVolume =>
      this == UnidadeMedida.mililitro ||
      this == UnidadeMedida.litro ||
      this == UnidadeMedida.xicara ||
      this == UnidadeMedida.colherSopa ||
      this == UnidadeMedida.colherCha;

  /// Quantos "gramas" (massa) ou "mililitros" (volume) equivalem a 1 desta
  /// unidade. Serve de base comum para converter dentro da mesma família.
  double get _fatorParaUnidadeBase => switch (this) {
    UnidadeMedida.grama => 1,
    UnidadeMedida.quilograma => 1000,
    UnidadeMedida.mililitro => 1,
    UnidadeMedida.litro => 1000,
    UnidadeMedida.xicara => 240,
    UnidadeMedida.colherSopa => 15,
    UnidadeMedida.colherCha => 5,
    UnidadeMedida.unidade => 1,
  };
}

/// Converte [quantidade] de uma unidade para outra da mesma família (massa:
/// g/kg, volume: ml/l/xícara/colheres, contagem: unidade), passando por uma
/// unidade-base comum (grama ou mililitro).
///
/// Usado pelo cálculo de custo de receitas, onde a quantidade usada na
/// receita pode estar em uma unidade diferente da unidade de compra do
/// ingrediente (ex: receita usa 2 colheres de sopa de um ingrediente
/// comprado por litro).
double converterQuantidade(
  double quantidade,
  UnidadeMedida de,
  UnidadeMedida para,
) {
  if (de == para) return quantidade;

  final mesmaFamilia =
      (de.ehMassa && para.ehMassa) ||
      (de.ehVolume && para.ehVolume) ||
      (de == UnidadeMedida.unidade && para == UnidadeMedida.unidade);

  if (!mesmaFamilia) {
    throw ArgumentError(
      'Não é possível converter de "${de.rotulo}" para "${para.rotulo}": '
      'unidades de famílias diferentes.',
    );
  }

  final quantidadeNaBase = quantidade * de._fatorParaUnidadeBase;
  return quantidadeNaBase / para._fatorParaUnidadeBase;
}

/// Unidades aceitas para o cadastro de compra de um ingrediente (a unidade
/// em que a embalagem é medida). Não inclui medidas culinárias, que só
/// fazem sentido ao usar o ingrediente numa receita.
const unidadesDeCompra = [
  UnidadeMedida.grama,
  UnidadeMedida.quilograma,
  UnidadeMedida.mililitro,
  UnidadeMedida.litro,
  UnidadeMedida.unidade,
];

/// Unidades que podem ser usadas para informar a quantidade de um
/// ingrediente cadastrado em [unidade] (mesma família, para permitir
/// conversão). Ex: ingrediente em litro pode ter a quantidade da receita
/// lançada em ml, xícara ou colheres.
List<UnidadeMedida> unidadesCompativeisCom(UnidadeMedida unidade) {
  if (unidade.ehMassa) {
    return const [UnidadeMedida.grama, UnidadeMedida.quilograma];
  }
  if (unidade.ehVolume) {
    return const [
      UnidadeMedida.mililitro,
      UnidadeMedida.litro,
      UnidadeMedida.xicara,
      UnidadeMedida.colherSopa,
      UnidadeMedida.colherCha,
    ];
  }
  return const [UnidadeMedida.unidade];
}
