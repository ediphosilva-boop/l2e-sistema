import 'database.dart';

extension IngredienteX on Ingrediente {
  /// Preço por unidade de medida, derivado do preço pago pela embalagem
  /// dividido pela quantidade que ela contém (ex: R$ 8,00 / 900 ml).
  double get precoUnidade => precoEmbalagem / quantidadeEmbalagem;
}
