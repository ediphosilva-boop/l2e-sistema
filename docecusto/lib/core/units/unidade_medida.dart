/// Unidades de medida aceitas para ingredientes e itens de receita.
enum UnidadeMedida { grama, quilograma, mililitro, litro, unidade }

extension UnidadeMedidaX on UnidadeMedida {
  /// Sigla curta usada em listas e resumos (ex: "kg", "un").
  String get sigla => switch (this) {
    UnidadeMedida.grama => 'g',
    UnidadeMedida.quilograma => 'kg',
    UnidadeMedida.mililitro => 'ml',
    UnidadeMedida.litro => 'l',
    UnidadeMedida.unidade => 'un',
  };

  /// Rótulo completo usado em formulários (dropdowns).
  String get rotulo => switch (this) {
    UnidadeMedida.grama => 'Grama (g)',
    UnidadeMedida.quilograma => 'Quilograma (kg)',
    UnidadeMedida.mililitro => 'Mililitro (ml)',
    UnidadeMedida.litro => 'Litro (l)',
    UnidadeMedida.unidade => 'Unidade (un)',
  };

  bool get ehMassa =>
      this == UnidadeMedida.grama || this == UnidadeMedida.quilograma;

  bool get ehVolume =>
      this == UnidadeMedida.mililitro || this == UnidadeMedida.litro;
}

/// Converte [quantidade] de uma unidade para outra da mesma família
/// (massa: g/kg, volume: ml/l, contagem: unidade).
///
/// Usado pelo cálculo de custo de receitas, onde a quantidade usada na
/// receita pode estar em uma unidade diferente da unidade de compra do
/// ingrediente (ex: receita usa 250 g de um ingrediente comprado por kg).
double converterQuantidade(
  double quantidade,
  UnidadeMedida de,
  UnidadeMedida para,
) {
  if (de == para) return quantidade;

  const fatorMassaEVolume = 1000.0; // 1 kg = 1000 g · 1 l = 1000 ml

  if (de.ehMassa && para.ehMassa) {
    return de == UnidadeMedida.quilograma
        ? quantidade * fatorMassaEVolume
        : quantidade / fatorMassaEVolume;
  }

  if (de.ehVolume && para.ehVolume) {
    return de == UnidadeMedida.litro
        ? quantidade * fatorMassaEVolume
        : quantidade / fatorMassaEVolume;
  }

  throw ArgumentError(
    'Não é possível converter de "${de.rotulo}" para "${para.rotulo}": '
    'unidades de famílias diferentes.',
  );
}

/// Unidades que podem ser usadas para informar a quantidade de um
/// ingrediente cadastrado em [unidade] (mesma família, para permitir
/// conversão). Ex: ingrediente em kg pode ter quantidade lançada em g ou kg.
List<UnidadeMedida> unidadesCompativeisCom(UnidadeMedida unidade) {
  if (unidade.ehMassa) {
    return const [UnidadeMedida.grama, UnidadeMedida.quilograma];
  }
  if (unidade.ehVolume) {
    return const [UnidadeMedida.mililitro, UnidadeMedida.litro];
  }
  return const [UnidadeMedida.unidade];
}
