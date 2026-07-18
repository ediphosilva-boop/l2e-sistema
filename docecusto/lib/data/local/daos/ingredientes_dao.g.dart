// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'ingredientes_dao.dart';

// ignore_for_file: type=lint
mixin _$IngredientesDaoMixin on DatabaseAccessor<AppDatabase> {
  $IngredientesTable get ingredientes => attachedDatabase.ingredientes;
  IngredientesDaoManager get managers => IngredientesDaoManager(this);
}

class IngredientesDaoManager {
  final _$IngredientesDaoMixin _db;
  IngredientesDaoManager(this._db);
  $$IngredientesTableTableManager get ingredientes =>
      $$IngredientesTableTableManager(_db.attachedDatabase, _db.ingredientes);
}
