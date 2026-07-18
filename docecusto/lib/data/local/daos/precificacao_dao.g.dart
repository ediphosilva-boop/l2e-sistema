// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'precificacao_dao.dart';

// ignore_for_file: type=lint
mixin _$PrecificacaoDaoMixin on DatabaseAccessor<AppDatabase> {
  $ReceitasTable get receitas => attachedDatabase.receitas;
  $ConfiguracoesPrecificacaoTable get configuracoesPrecificacao =>
      attachedDatabase.configuracoesPrecificacao;
  PrecificacaoDaoManager get managers => PrecificacaoDaoManager(this);
}

class PrecificacaoDaoManager {
  final _$PrecificacaoDaoMixin _db;
  PrecificacaoDaoManager(this._db);
  $$ReceitasTableTableManager get receitas =>
      $$ReceitasTableTableManager(_db.attachedDatabase, _db.receitas);
  $$ConfiguracoesPrecificacaoTableTableManager get configuracoesPrecificacao =>
      $$ConfiguracoesPrecificacaoTableTableManager(
        _db.attachedDatabase,
        _db.configuracoesPrecificacao,
      );
}
