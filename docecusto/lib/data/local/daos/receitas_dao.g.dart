// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'receitas_dao.dart';

// ignore_for_file: type=lint
mixin _$ReceitasDaoMixin on DatabaseAccessor<AppDatabase> {
  $ReceitasTable get receitas => attachedDatabase.receitas;
  $IngredientesTable get ingredientes => attachedDatabase.ingredientes;
  $ReceitaIngredientesTable get receitaIngredientes =>
      attachedDatabase.receitaIngredientes;
  ReceitasDaoManager get managers => ReceitasDaoManager(this);
}

class ReceitasDaoManager {
  final _$ReceitasDaoMixin _db;
  ReceitasDaoManager(this._db);
  $$ReceitasTableTableManager get receitas =>
      $$ReceitasTableTableManager(_db.attachedDatabase, _db.receitas);
  $$IngredientesTableTableManager get ingredientes =>
      $$IngredientesTableTableManager(_db.attachedDatabase, _db.ingredientes);
  $$ReceitaIngredientesTableTableManager get receitaIngredientes =>
      $$ReceitaIngredientesTableTableManager(
        _db.attachedDatabase,
        _db.receitaIngredientes,
      );
}
