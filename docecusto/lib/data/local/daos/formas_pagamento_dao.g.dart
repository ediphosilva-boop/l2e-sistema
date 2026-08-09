// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'formas_pagamento_dao.dart';

// ignore_for_file: type=lint
mixin _$FormasPagamentoDaoMixin on DatabaseAccessor<AppDatabase> {
  $FormasPagamentoTable get formasPagamento => attachedDatabase.formasPagamento;
  FormasPagamentoDaoManager get managers => FormasPagamentoDaoManager(this);
}

class FormasPagamentoDaoManager {
  final _$FormasPagamentoDaoMixin _db;
  FormasPagamentoDaoManager(this._db);
  $$FormasPagamentoTableTableManager get formasPagamento =>
      $$FormasPagamentoTableTableManager(
        _db.attachedDatabase,
        _db.formasPagamento,
      );
}
