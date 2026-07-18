// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'configuracoes_gerais_dao.dart';

// ignore_for_file: type=lint
mixin _$ConfiguracoesGeraisDaoMixin on DatabaseAccessor<AppDatabase> {
  $ConfiguracoesGeraisTable get configuracoesGerais =>
      attachedDatabase.configuracoesGerais;
  ConfiguracoesGeraisDaoManager get managers =>
      ConfiguracoesGeraisDaoManager(this);
}

class ConfiguracoesGeraisDaoManager {
  final _$ConfiguracoesGeraisDaoMixin _db;
  ConfiguracoesGeraisDaoManager(this._db);
  $$ConfiguracoesGeraisTableTableManager get configuracoesGerais =>
      $$ConfiguracoesGeraisTableTableManager(
        _db.attachedDatabase,
        _db.configuracoesGerais,
      );
}
