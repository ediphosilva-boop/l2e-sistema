// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'orcamentos_dao.dart';

// ignore_for_file: type=lint
mixin _$OrcamentosDaoMixin on DatabaseAccessor<AppDatabase> {
  $ClientesTable get clientes => attachedDatabase.clientes;
  $OrcamentosTable get orcamentos => attachedDatabase.orcamentos;
  $ReceitasTable get receitas => attachedDatabase.receitas;
  $OrcamentoItensTable get orcamentoItens => attachedDatabase.orcamentoItens;
  OrcamentosDaoManager get managers => OrcamentosDaoManager(this);
}

class OrcamentosDaoManager {
  final _$OrcamentosDaoMixin _db;
  OrcamentosDaoManager(this._db);
  $$ClientesTableTableManager get clientes =>
      $$ClientesTableTableManager(_db.attachedDatabase, _db.clientes);
  $$OrcamentosTableTableManager get orcamentos =>
      $$OrcamentosTableTableManager(_db.attachedDatabase, _db.orcamentos);
  $$ReceitasTableTableManager get receitas =>
      $$ReceitasTableTableManager(_db.attachedDatabase, _db.receitas);
  $$OrcamentoItensTableTableManager get orcamentoItens =>
      $$OrcamentoItensTableTableManager(
        _db.attachedDatabase,
        _db.orcamentoItens,
      );
}
