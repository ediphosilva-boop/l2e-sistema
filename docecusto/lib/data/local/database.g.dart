// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'database.dart';

// ignore_for_file: type=lint
class $IngredientesTable extends Ingredientes
    with TableInfo<$IngredientesTable, Ingrediente> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $IngredientesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'PRIMARY KEY AUTOINCREMENT',
    ),
  );
  static const VerificationMeta _nomeMeta = const VerificationMeta('nome');
  @override
  late final GeneratedColumn<String> nome = GeneratedColumn<String>(
    'nome',
    aliasedName,
    false,
    additionalChecks: GeneratedColumn.checkTextLength(
      minTextLength: 1,
      maxTextLength: 120,
    ),
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  late final GeneratedColumnWithTypeConverter<UnidadeMedida, String>
  unidadeMedida = GeneratedColumn<String>(
    'unidade_medida',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  ).withConverter<UnidadeMedida>($IngredientesTable.$converterunidadeMedida);
  static const VerificationMeta _precoUnidadeMeta = const VerificationMeta(
    'precoUnidade',
  );
  @override
  late final GeneratedColumn<double> precoUnidade = GeneratedColumn<double>(
    'preco_unidade',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _criadoEmMeta = const VerificationMeta(
    'criadoEm',
  );
  @override
  late final GeneratedColumn<DateTime> criadoEm = GeneratedColumn<DateTime>(
    'criado_em',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  static const VerificationMeta _atualizadoEmMeta = const VerificationMeta(
    'atualizadoEm',
  );
  @override
  late final GeneratedColumn<DateTime> atualizadoEm = GeneratedColumn<DateTime>(
    'atualizado_em',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    nome,
    unidadeMedida,
    precoUnidade,
    criadoEm,
    atualizadoEm,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'ingredientes';
  @override
  VerificationContext validateIntegrity(
    Insertable<Ingrediente> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('nome')) {
      context.handle(
        _nomeMeta,
        nome.isAcceptableOrUnknown(data['nome']!, _nomeMeta),
      );
    } else if (isInserting) {
      context.missing(_nomeMeta);
    }
    if (data.containsKey('preco_unidade')) {
      context.handle(
        _precoUnidadeMeta,
        precoUnidade.isAcceptableOrUnknown(
          data['preco_unidade']!,
          _precoUnidadeMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_precoUnidadeMeta);
    }
    if (data.containsKey('criado_em')) {
      context.handle(
        _criadoEmMeta,
        criadoEm.isAcceptableOrUnknown(data['criado_em']!, _criadoEmMeta),
      );
    }
    if (data.containsKey('atualizado_em')) {
      context.handle(
        _atualizadoEmMeta,
        atualizadoEm.isAcceptableOrUnknown(
          data['atualizado_em']!,
          _atualizadoEmMeta,
        ),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Ingrediente map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Ingrediente(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      nome: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}nome'],
      )!,
      unidadeMedida: $IngredientesTable.$converterunidadeMedida.fromSql(
        attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}unidade_medida'],
        )!,
      ),
      precoUnidade: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}preco_unidade'],
      )!,
      criadoEm: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}criado_em'],
      )!,
      atualizadoEm: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}atualizado_em'],
      )!,
    );
  }

  @override
  $IngredientesTable createAlias(String alias) {
    return $IngredientesTable(attachedDatabase, alias);
  }

  static JsonTypeConverter2<UnidadeMedida, String, String>
  $converterunidadeMedida = const EnumNameConverter<UnidadeMedida>(
    UnidadeMedida.values,
  );
}

class Ingrediente extends DataClass implements Insertable<Ingrediente> {
  final int id;
  final String nome;
  final UnidadeMedida unidadeMedida;
  final double precoUnidade;
  final DateTime criadoEm;
  final DateTime atualizadoEm;
  const Ingrediente({
    required this.id,
    required this.nome,
    required this.unidadeMedida,
    required this.precoUnidade,
    required this.criadoEm,
    required this.atualizadoEm,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['nome'] = Variable<String>(nome);
    {
      map['unidade_medida'] = Variable<String>(
        $IngredientesTable.$converterunidadeMedida.toSql(unidadeMedida),
      );
    }
    map['preco_unidade'] = Variable<double>(precoUnidade);
    map['criado_em'] = Variable<DateTime>(criadoEm);
    map['atualizado_em'] = Variable<DateTime>(atualizadoEm);
    return map;
  }

  IngredientesCompanion toCompanion(bool nullToAbsent) {
    return IngredientesCompanion(
      id: Value(id),
      nome: Value(nome),
      unidadeMedida: Value(unidadeMedida),
      precoUnidade: Value(precoUnidade),
      criadoEm: Value(criadoEm),
      atualizadoEm: Value(atualizadoEm),
    );
  }

  factory Ingrediente.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Ingrediente(
      id: serializer.fromJson<int>(json['id']),
      nome: serializer.fromJson<String>(json['nome']),
      unidadeMedida: $IngredientesTable.$converterunidadeMedida.fromJson(
        serializer.fromJson<String>(json['unidadeMedida']),
      ),
      precoUnidade: serializer.fromJson<double>(json['precoUnidade']),
      criadoEm: serializer.fromJson<DateTime>(json['criadoEm']),
      atualizadoEm: serializer.fromJson<DateTime>(json['atualizadoEm']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'nome': serializer.toJson<String>(nome),
      'unidadeMedida': serializer.toJson<String>(
        $IngredientesTable.$converterunidadeMedida.toJson(unidadeMedida),
      ),
      'precoUnidade': serializer.toJson<double>(precoUnidade),
      'criadoEm': serializer.toJson<DateTime>(criadoEm),
      'atualizadoEm': serializer.toJson<DateTime>(atualizadoEm),
    };
  }

  Ingrediente copyWith({
    int? id,
    String? nome,
    UnidadeMedida? unidadeMedida,
    double? precoUnidade,
    DateTime? criadoEm,
    DateTime? atualizadoEm,
  }) => Ingrediente(
    id: id ?? this.id,
    nome: nome ?? this.nome,
    unidadeMedida: unidadeMedida ?? this.unidadeMedida,
    precoUnidade: precoUnidade ?? this.precoUnidade,
    criadoEm: criadoEm ?? this.criadoEm,
    atualizadoEm: atualizadoEm ?? this.atualizadoEm,
  );
  Ingrediente copyWithCompanion(IngredientesCompanion data) {
    return Ingrediente(
      id: data.id.present ? data.id.value : this.id,
      nome: data.nome.present ? data.nome.value : this.nome,
      unidadeMedida: data.unidadeMedida.present
          ? data.unidadeMedida.value
          : this.unidadeMedida,
      precoUnidade: data.precoUnidade.present
          ? data.precoUnidade.value
          : this.precoUnidade,
      criadoEm: data.criadoEm.present ? data.criadoEm.value : this.criadoEm,
      atualizadoEm: data.atualizadoEm.present
          ? data.atualizadoEm.value
          : this.atualizadoEm,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Ingrediente(')
          ..write('id: $id, ')
          ..write('nome: $nome, ')
          ..write('unidadeMedida: $unidadeMedida, ')
          ..write('precoUnidade: $precoUnidade, ')
          ..write('criadoEm: $criadoEm, ')
          ..write('atualizadoEm: $atualizadoEm')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    nome,
    unidadeMedida,
    precoUnidade,
    criadoEm,
    atualizadoEm,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Ingrediente &&
          other.id == this.id &&
          other.nome == this.nome &&
          other.unidadeMedida == this.unidadeMedida &&
          other.precoUnidade == this.precoUnidade &&
          other.criadoEm == this.criadoEm &&
          other.atualizadoEm == this.atualizadoEm);
}

class IngredientesCompanion extends UpdateCompanion<Ingrediente> {
  final Value<int> id;
  final Value<String> nome;
  final Value<UnidadeMedida> unidadeMedida;
  final Value<double> precoUnidade;
  final Value<DateTime> criadoEm;
  final Value<DateTime> atualizadoEm;
  const IngredientesCompanion({
    this.id = const Value.absent(),
    this.nome = const Value.absent(),
    this.unidadeMedida = const Value.absent(),
    this.precoUnidade = const Value.absent(),
    this.criadoEm = const Value.absent(),
    this.atualizadoEm = const Value.absent(),
  });
  IngredientesCompanion.insert({
    this.id = const Value.absent(),
    required String nome,
    required UnidadeMedida unidadeMedida,
    required double precoUnidade,
    this.criadoEm = const Value.absent(),
    this.atualizadoEm = const Value.absent(),
  }) : nome = Value(nome),
       unidadeMedida = Value(unidadeMedida),
       precoUnidade = Value(precoUnidade);
  static Insertable<Ingrediente> custom({
    Expression<int>? id,
    Expression<String>? nome,
    Expression<String>? unidadeMedida,
    Expression<double>? precoUnidade,
    Expression<DateTime>? criadoEm,
    Expression<DateTime>? atualizadoEm,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (nome != null) 'nome': nome,
      if (unidadeMedida != null) 'unidade_medida': unidadeMedida,
      if (precoUnidade != null) 'preco_unidade': precoUnidade,
      if (criadoEm != null) 'criado_em': criadoEm,
      if (atualizadoEm != null) 'atualizado_em': atualizadoEm,
    });
  }

  IngredientesCompanion copyWith({
    Value<int>? id,
    Value<String>? nome,
    Value<UnidadeMedida>? unidadeMedida,
    Value<double>? precoUnidade,
    Value<DateTime>? criadoEm,
    Value<DateTime>? atualizadoEm,
  }) {
    return IngredientesCompanion(
      id: id ?? this.id,
      nome: nome ?? this.nome,
      unidadeMedida: unidadeMedida ?? this.unidadeMedida,
      precoUnidade: precoUnidade ?? this.precoUnidade,
      criadoEm: criadoEm ?? this.criadoEm,
      atualizadoEm: atualizadoEm ?? this.atualizadoEm,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (nome.present) {
      map['nome'] = Variable<String>(nome.value);
    }
    if (unidadeMedida.present) {
      map['unidade_medida'] = Variable<String>(
        $IngredientesTable.$converterunidadeMedida.toSql(unidadeMedida.value),
      );
    }
    if (precoUnidade.present) {
      map['preco_unidade'] = Variable<double>(precoUnidade.value);
    }
    if (criadoEm.present) {
      map['criado_em'] = Variable<DateTime>(criadoEm.value);
    }
    if (atualizadoEm.present) {
      map['atualizado_em'] = Variable<DateTime>(atualizadoEm.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('IngredientesCompanion(')
          ..write('id: $id, ')
          ..write('nome: $nome, ')
          ..write('unidadeMedida: $unidadeMedida, ')
          ..write('precoUnidade: $precoUnidade, ')
          ..write('criadoEm: $criadoEm, ')
          ..write('atualizadoEm: $atualizadoEm')
          ..write(')'))
        .toString();
  }
}

class $ReceitasTable extends Receitas with TableInfo<$ReceitasTable, Receita> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ReceitasTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'PRIMARY KEY AUTOINCREMENT',
    ),
  );
  static const VerificationMeta _nomeMeta = const VerificationMeta('nome');
  @override
  late final GeneratedColumn<String> nome = GeneratedColumn<String>(
    'nome',
    aliasedName,
    false,
    additionalChecks: GeneratedColumn.checkTextLength(
      minTextLength: 1,
      maxTextLength: 120,
    ),
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _modoPreparoMeta = const VerificationMeta(
    'modoPreparo',
  );
  @override
  late final GeneratedColumn<String> modoPreparo = GeneratedColumn<String>(
    'modo_preparo',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _rendimentoMeta = const VerificationMeta(
    'rendimento',
  );
  @override
  late final GeneratedColumn<int> rendimento = GeneratedColumn<int>(
    'rendimento',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(1),
  );
  static const VerificationMeta _tempoPreparoMinutosMeta =
      const VerificationMeta('tempoPreparoMinutos');
  @override
  late final GeneratedColumn<int> tempoPreparoMinutos = GeneratedColumn<int>(
    'tempo_preparo_minutos',
    aliasedName,
    true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _criadoEmMeta = const VerificationMeta(
    'criadoEm',
  );
  @override
  late final GeneratedColumn<DateTime> criadoEm = GeneratedColumn<DateTime>(
    'criado_em',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  static const VerificationMeta _atualizadoEmMeta = const VerificationMeta(
    'atualizadoEm',
  );
  @override
  late final GeneratedColumn<DateTime> atualizadoEm = GeneratedColumn<DateTime>(
    'atualizado_em',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    nome,
    modoPreparo,
    rendimento,
    tempoPreparoMinutos,
    criadoEm,
    atualizadoEm,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'receitas';
  @override
  VerificationContext validateIntegrity(
    Insertable<Receita> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('nome')) {
      context.handle(
        _nomeMeta,
        nome.isAcceptableOrUnknown(data['nome']!, _nomeMeta),
      );
    } else if (isInserting) {
      context.missing(_nomeMeta);
    }
    if (data.containsKey('modo_preparo')) {
      context.handle(
        _modoPreparoMeta,
        modoPreparo.isAcceptableOrUnknown(
          data['modo_preparo']!,
          _modoPreparoMeta,
        ),
      );
    }
    if (data.containsKey('rendimento')) {
      context.handle(
        _rendimentoMeta,
        rendimento.isAcceptableOrUnknown(data['rendimento']!, _rendimentoMeta),
      );
    }
    if (data.containsKey('tempo_preparo_minutos')) {
      context.handle(
        _tempoPreparoMinutosMeta,
        tempoPreparoMinutos.isAcceptableOrUnknown(
          data['tempo_preparo_minutos']!,
          _tempoPreparoMinutosMeta,
        ),
      );
    }
    if (data.containsKey('criado_em')) {
      context.handle(
        _criadoEmMeta,
        criadoEm.isAcceptableOrUnknown(data['criado_em']!, _criadoEmMeta),
      );
    }
    if (data.containsKey('atualizado_em')) {
      context.handle(
        _atualizadoEmMeta,
        atualizadoEm.isAcceptableOrUnknown(
          data['atualizado_em']!,
          _atualizadoEmMeta,
        ),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Receita map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Receita(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      nome: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}nome'],
      )!,
      modoPreparo: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}modo_preparo'],
      ),
      rendimento: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}rendimento'],
      )!,
      tempoPreparoMinutos: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}tempo_preparo_minutos'],
      ),
      criadoEm: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}criado_em'],
      )!,
      atualizadoEm: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}atualizado_em'],
      )!,
    );
  }

  @override
  $ReceitasTable createAlias(String alias) {
    return $ReceitasTable(attachedDatabase, alias);
  }
}

class Receita extends DataClass implements Insertable<Receita> {
  final int id;
  final String nome;
  final String? modoPreparo;
  final int rendimento;
  final int? tempoPreparoMinutos;
  final DateTime criadoEm;
  final DateTime atualizadoEm;
  const Receita({
    required this.id,
    required this.nome,
    this.modoPreparo,
    required this.rendimento,
    this.tempoPreparoMinutos,
    required this.criadoEm,
    required this.atualizadoEm,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['nome'] = Variable<String>(nome);
    if (!nullToAbsent || modoPreparo != null) {
      map['modo_preparo'] = Variable<String>(modoPreparo);
    }
    map['rendimento'] = Variable<int>(rendimento);
    if (!nullToAbsent || tempoPreparoMinutos != null) {
      map['tempo_preparo_minutos'] = Variable<int>(tempoPreparoMinutos);
    }
    map['criado_em'] = Variable<DateTime>(criadoEm);
    map['atualizado_em'] = Variable<DateTime>(atualizadoEm);
    return map;
  }

  ReceitasCompanion toCompanion(bool nullToAbsent) {
    return ReceitasCompanion(
      id: Value(id),
      nome: Value(nome),
      modoPreparo: modoPreparo == null && nullToAbsent
          ? const Value.absent()
          : Value(modoPreparo),
      rendimento: Value(rendimento),
      tempoPreparoMinutos: tempoPreparoMinutos == null && nullToAbsent
          ? const Value.absent()
          : Value(tempoPreparoMinutos),
      criadoEm: Value(criadoEm),
      atualizadoEm: Value(atualizadoEm),
    );
  }

  factory Receita.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Receita(
      id: serializer.fromJson<int>(json['id']),
      nome: serializer.fromJson<String>(json['nome']),
      modoPreparo: serializer.fromJson<String?>(json['modoPreparo']),
      rendimento: serializer.fromJson<int>(json['rendimento']),
      tempoPreparoMinutos: serializer.fromJson<int?>(
        json['tempoPreparoMinutos'],
      ),
      criadoEm: serializer.fromJson<DateTime>(json['criadoEm']),
      atualizadoEm: serializer.fromJson<DateTime>(json['atualizadoEm']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'nome': serializer.toJson<String>(nome),
      'modoPreparo': serializer.toJson<String?>(modoPreparo),
      'rendimento': serializer.toJson<int>(rendimento),
      'tempoPreparoMinutos': serializer.toJson<int?>(tempoPreparoMinutos),
      'criadoEm': serializer.toJson<DateTime>(criadoEm),
      'atualizadoEm': serializer.toJson<DateTime>(atualizadoEm),
    };
  }

  Receita copyWith({
    int? id,
    String? nome,
    Value<String?> modoPreparo = const Value.absent(),
    int? rendimento,
    Value<int?> tempoPreparoMinutos = const Value.absent(),
    DateTime? criadoEm,
    DateTime? atualizadoEm,
  }) => Receita(
    id: id ?? this.id,
    nome: nome ?? this.nome,
    modoPreparo: modoPreparo.present ? modoPreparo.value : this.modoPreparo,
    rendimento: rendimento ?? this.rendimento,
    tempoPreparoMinutos: tempoPreparoMinutos.present
        ? tempoPreparoMinutos.value
        : this.tempoPreparoMinutos,
    criadoEm: criadoEm ?? this.criadoEm,
    atualizadoEm: atualizadoEm ?? this.atualizadoEm,
  );
  Receita copyWithCompanion(ReceitasCompanion data) {
    return Receita(
      id: data.id.present ? data.id.value : this.id,
      nome: data.nome.present ? data.nome.value : this.nome,
      modoPreparo: data.modoPreparo.present
          ? data.modoPreparo.value
          : this.modoPreparo,
      rendimento: data.rendimento.present
          ? data.rendimento.value
          : this.rendimento,
      tempoPreparoMinutos: data.tempoPreparoMinutos.present
          ? data.tempoPreparoMinutos.value
          : this.tempoPreparoMinutos,
      criadoEm: data.criadoEm.present ? data.criadoEm.value : this.criadoEm,
      atualizadoEm: data.atualizadoEm.present
          ? data.atualizadoEm.value
          : this.atualizadoEm,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Receita(')
          ..write('id: $id, ')
          ..write('nome: $nome, ')
          ..write('modoPreparo: $modoPreparo, ')
          ..write('rendimento: $rendimento, ')
          ..write('tempoPreparoMinutos: $tempoPreparoMinutos, ')
          ..write('criadoEm: $criadoEm, ')
          ..write('atualizadoEm: $atualizadoEm')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    nome,
    modoPreparo,
    rendimento,
    tempoPreparoMinutos,
    criadoEm,
    atualizadoEm,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Receita &&
          other.id == this.id &&
          other.nome == this.nome &&
          other.modoPreparo == this.modoPreparo &&
          other.rendimento == this.rendimento &&
          other.tempoPreparoMinutos == this.tempoPreparoMinutos &&
          other.criadoEm == this.criadoEm &&
          other.atualizadoEm == this.atualizadoEm);
}

class ReceitasCompanion extends UpdateCompanion<Receita> {
  final Value<int> id;
  final Value<String> nome;
  final Value<String?> modoPreparo;
  final Value<int> rendimento;
  final Value<int?> tempoPreparoMinutos;
  final Value<DateTime> criadoEm;
  final Value<DateTime> atualizadoEm;
  const ReceitasCompanion({
    this.id = const Value.absent(),
    this.nome = const Value.absent(),
    this.modoPreparo = const Value.absent(),
    this.rendimento = const Value.absent(),
    this.tempoPreparoMinutos = const Value.absent(),
    this.criadoEm = const Value.absent(),
    this.atualizadoEm = const Value.absent(),
  });
  ReceitasCompanion.insert({
    this.id = const Value.absent(),
    required String nome,
    this.modoPreparo = const Value.absent(),
    this.rendimento = const Value.absent(),
    this.tempoPreparoMinutos = const Value.absent(),
    this.criadoEm = const Value.absent(),
    this.atualizadoEm = const Value.absent(),
  }) : nome = Value(nome);
  static Insertable<Receita> custom({
    Expression<int>? id,
    Expression<String>? nome,
    Expression<String>? modoPreparo,
    Expression<int>? rendimento,
    Expression<int>? tempoPreparoMinutos,
    Expression<DateTime>? criadoEm,
    Expression<DateTime>? atualizadoEm,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (nome != null) 'nome': nome,
      if (modoPreparo != null) 'modo_preparo': modoPreparo,
      if (rendimento != null) 'rendimento': rendimento,
      if (tempoPreparoMinutos != null)
        'tempo_preparo_minutos': tempoPreparoMinutos,
      if (criadoEm != null) 'criado_em': criadoEm,
      if (atualizadoEm != null) 'atualizado_em': atualizadoEm,
    });
  }

  ReceitasCompanion copyWith({
    Value<int>? id,
    Value<String>? nome,
    Value<String?>? modoPreparo,
    Value<int>? rendimento,
    Value<int?>? tempoPreparoMinutos,
    Value<DateTime>? criadoEm,
    Value<DateTime>? atualizadoEm,
  }) {
    return ReceitasCompanion(
      id: id ?? this.id,
      nome: nome ?? this.nome,
      modoPreparo: modoPreparo ?? this.modoPreparo,
      rendimento: rendimento ?? this.rendimento,
      tempoPreparoMinutos: tempoPreparoMinutos ?? this.tempoPreparoMinutos,
      criadoEm: criadoEm ?? this.criadoEm,
      atualizadoEm: atualizadoEm ?? this.atualizadoEm,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (nome.present) {
      map['nome'] = Variable<String>(nome.value);
    }
    if (modoPreparo.present) {
      map['modo_preparo'] = Variable<String>(modoPreparo.value);
    }
    if (rendimento.present) {
      map['rendimento'] = Variable<int>(rendimento.value);
    }
    if (tempoPreparoMinutos.present) {
      map['tempo_preparo_minutos'] = Variable<int>(tempoPreparoMinutos.value);
    }
    if (criadoEm.present) {
      map['criado_em'] = Variable<DateTime>(criadoEm.value);
    }
    if (atualizadoEm.present) {
      map['atualizado_em'] = Variable<DateTime>(atualizadoEm.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ReceitasCompanion(')
          ..write('id: $id, ')
          ..write('nome: $nome, ')
          ..write('modoPreparo: $modoPreparo, ')
          ..write('rendimento: $rendimento, ')
          ..write('tempoPreparoMinutos: $tempoPreparoMinutos, ')
          ..write('criadoEm: $criadoEm, ')
          ..write('atualizadoEm: $atualizadoEm')
          ..write(')'))
        .toString();
  }
}

class $ReceitaIngredientesTable extends ReceitaIngredientes
    with TableInfo<$ReceitaIngredientesTable, ReceitaIngrediente> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ReceitaIngredientesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'PRIMARY KEY AUTOINCREMENT',
    ),
  );
  static const VerificationMeta _receitaIdMeta = const VerificationMeta(
    'receitaId',
  );
  @override
  late final GeneratedColumn<int> receitaId = GeneratedColumn<int>(
    'receita_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'REFERENCES receitas (id) ON DELETE CASCADE',
    ),
  );
  static const VerificationMeta _ingredienteIdMeta = const VerificationMeta(
    'ingredienteId',
  );
  @override
  late final GeneratedColumn<int> ingredienteId = GeneratedColumn<int>(
    'ingrediente_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'REFERENCES ingredientes (id) ON DELETE CASCADE',
    ),
  );
  static const VerificationMeta _quantidadeMeta = const VerificationMeta(
    'quantidade',
  );
  @override
  late final GeneratedColumn<double> quantidade = GeneratedColumn<double>(
    'quantidade',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: true,
  );
  @override
  late final GeneratedColumnWithTypeConverter<UnidadeMedida, String>
  unidadeMedida =
      GeneratedColumn<String>(
        'unidade_medida',
        aliasedName,
        false,
        type: DriftSqlType.string,
        requiredDuringInsert: true,
      ).withConverter<UnidadeMedida>(
        $ReceitaIngredientesTable.$converterunidadeMedida,
      );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    receitaId,
    ingredienteId,
    quantidade,
    unidadeMedida,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'receita_ingredientes';
  @override
  VerificationContext validateIntegrity(
    Insertable<ReceitaIngrediente> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('receita_id')) {
      context.handle(
        _receitaIdMeta,
        receitaId.isAcceptableOrUnknown(data['receita_id']!, _receitaIdMeta),
      );
    } else if (isInserting) {
      context.missing(_receitaIdMeta);
    }
    if (data.containsKey('ingrediente_id')) {
      context.handle(
        _ingredienteIdMeta,
        ingredienteId.isAcceptableOrUnknown(
          data['ingrediente_id']!,
          _ingredienteIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_ingredienteIdMeta);
    }
    if (data.containsKey('quantidade')) {
      context.handle(
        _quantidadeMeta,
        quantidade.isAcceptableOrUnknown(data['quantidade']!, _quantidadeMeta),
      );
    } else if (isInserting) {
      context.missing(_quantidadeMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  ReceitaIngrediente map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return ReceitaIngrediente(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      receitaId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}receita_id'],
      )!,
      ingredienteId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}ingrediente_id'],
      )!,
      quantidade: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}quantidade'],
      )!,
      unidadeMedida: $ReceitaIngredientesTable.$converterunidadeMedida.fromSql(
        attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}unidade_medida'],
        )!,
      ),
    );
  }

  @override
  $ReceitaIngredientesTable createAlias(String alias) {
    return $ReceitaIngredientesTable(attachedDatabase, alias);
  }

  static JsonTypeConverter2<UnidadeMedida, String, String>
  $converterunidadeMedida = const EnumNameConverter<UnidadeMedida>(
    UnidadeMedida.values,
  );
}

class ReceitaIngrediente extends DataClass
    implements Insertable<ReceitaIngrediente> {
  final int id;
  final int receitaId;
  final int ingredienteId;
  final double quantidade;
  final UnidadeMedida unidadeMedida;
  const ReceitaIngrediente({
    required this.id,
    required this.receitaId,
    required this.ingredienteId,
    required this.quantidade,
    required this.unidadeMedida,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['receita_id'] = Variable<int>(receitaId);
    map['ingrediente_id'] = Variable<int>(ingredienteId);
    map['quantidade'] = Variable<double>(quantidade);
    {
      map['unidade_medida'] = Variable<String>(
        $ReceitaIngredientesTable.$converterunidadeMedida.toSql(unidadeMedida),
      );
    }
    return map;
  }

  ReceitaIngredientesCompanion toCompanion(bool nullToAbsent) {
    return ReceitaIngredientesCompanion(
      id: Value(id),
      receitaId: Value(receitaId),
      ingredienteId: Value(ingredienteId),
      quantidade: Value(quantidade),
      unidadeMedida: Value(unidadeMedida),
    );
  }

  factory ReceitaIngrediente.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return ReceitaIngrediente(
      id: serializer.fromJson<int>(json['id']),
      receitaId: serializer.fromJson<int>(json['receitaId']),
      ingredienteId: serializer.fromJson<int>(json['ingredienteId']),
      quantidade: serializer.fromJson<double>(json['quantidade']),
      unidadeMedida: $ReceitaIngredientesTable.$converterunidadeMedida.fromJson(
        serializer.fromJson<String>(json['unidadeMedida']),
      ),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'receitaId': serializer.toJson<int>(receitaId),
      'ingredienteId': serializer.toJson<int>(ingredienteId),
      'quantidade': serializer.toJson<double>(quantidade),
      'unidadeMedida': serializer.toJson<String>(
        $ReceitaIngredientesTable.$converterunidadeMedida.toJson(unidadeMedida),
      ),
    };
  }

  ReceitaIngrediente copyWith({
    int? id,
    int? receitaId,
    int? ingredienteId,
    double? quantidade,
    UnidadeMedida? unidadeMedida,
  }) => ReceitaIngrediente(
    id: id ?? this.id,
    receitaId: receitaId ?? this.receitaId,
    ingredienteId: ingredienteId ?? this.ingredienteId,
    quantidade: quantidade ?? this.quantidade,
    unidadeMedida: unidadeMedida ?? this.unidadeMedida,
  );
  ReceitaIngrediente copyWithCompanion(ReceitaIngredientesCompanion data) {
    return ReceitaIngrediente(
      id: data.id.present ? data.id.value : this.id,
      receitaId: data.receitaId.present ? data.receitaId.value : this.receitaId,
      ingredienteId: data.ingredienteId.present
          ? data.ingredienteId.value
          : this.ingredienteId,
      quantidade: data.quantidade.present
          ? data.quantidade.value
          : this.quantidade,
      unidadeMedida: data.unidadeMedida.present
          ? data.unidadeMedida.value
          : this.unidadeMedida,
    );
  }

  @override
  String toString() {
    return (StringBuffer('ReceitaIngrediente(')
          ..write('id: $id, ')
          ..write('receitaId: $receitaId, ')
          ..write('ingredienteId: $ingredienteId, ')
          ..write('quantidade: $quantidade, ')
          ..write('unidadeMedida: $unidadeMedida')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, receitaId, ingredienteId, quantidade, unidadeMedida);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is ReceitaIngrediente &&
          other.id == this.id &&
          other.receitaId == this.receitaId &&
          other.ingredienteId == this.ingredienteId &&
          other.quantidade == this.quantidade &&
          other.unidadeMedida == this.unidadeMedida);
}

class ReceitaIngredientesCompanion extends UpdateCompanion<ReceitaIngrediente> {
  final Value<int> id;
  final Value<int> receitaId;
  final Value<int> ingredienteId;
  final Value<double> quantidade;
  final Value<UnidadeMedida> unidadeMedida;
  const ReceitaIngredientesCompanion({
    this.id = const Value.absent(),
    this.receitaId = const Value.absent(),
    this.ingredienteId = const Value.absent(),
    this.quantidade = const Value.absent(),
    this.unidadeMedida = const Value.absent(),
  });
  ReceitaIngredientesCompanion.insert({
    this.id = const Value.absent(),
    required int receitaId,
    required int ingredienteId,
    required double quantidade,
    required UnidadeMedida unidadeMedida,
  }) : receitaId = Value(receitaId),
       ingredienteId = Value(ingredienteId),
       quantidade = Value(quantidade),
       unidadeMedida = Value(unidadeMedida);
  static Insertable<ReceitaIngrediente> custom({
    Expression<int>? id,
    Expression<int>? receitaId,
    Expression<int>? ingredienteId,
    Expression<double>? quantidade,
    Expression<String>? unidadeMedida,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (receitaId != null) 'receita_id': receitaId,
      if (ingredienteId != null) 'ingrediente_id': ingredienteId,
      if (quantidade != null) 'quantidade': quantidade,
      if (unidadeMedida != null) 'unidade_medida': unidadeMedida,
    });
  }

  ReceitaIngredientesCompanion copyWith({
    Value<int>? id,
    Value<int>? receitaId,
    Value<int>? ingredienteId,
    Value<double>? quantidade,
    Value<UnidadeMedida>? unidadeMedida,
  }) {
    return ReceitaIngredientesCompanion(
      id: id ?? this.id,
      receitaId: receitaId ?? this.receitaId,
      ingredienteId: ingredienteId ?? this.ingredienteId,
      quantidade: quantidade ?? this.quantidade,
      unidadeMedida: unidadeMedida ?? this.unidadeMedida,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (receitaId.present) {
      map['receita_id'] = Variable<int>(receitaId.value);
    }
    if (ingredienteId.present) {
      map['ingrediente_id'] = Variable<int>(ingredienteId.value);
    }
    if (quantidade.present) {
      map['quantidade'] = Variable<double>(quantidade.value);
    }
    if (unidadeMedida.present) {
      map['unidade_medida'] = Variable<String>(
        $ReceitaIngredientesTable.$converterunidadeMedida.toSql(
          unidadeMedida.value,
        ),
      );
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ReceitaIngredientesCompanion(')
          ..write('id: $id, ')
          ..write('receitaId: $receitaId, ')
          ..write('ingredienteId: $ingredienteId, ')
          ..write('quantidade: $quantidade, ')
          ..write('unidadeMedida: $unidadeMedida')
          ..write(')'))
        .toString();
  }
}

class $ConfiguracoesPrecificacaoTable extends ConfiguracoesPrecificacao
    with TableInfo<$ConfiguracoesPrecificacaoTable, ConfiguracaoPrecificacao> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ConfiguracoesPrecificacaoTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'PRIMARY KEY AUTOINCREMENT',
    ),
  );
  static const VerificationMeta _receitaIdMeta = const VerificationMeta(
    'receitaId',
  );
  @override
  late final GeneratedColumn<int> receitaId = GeneratedColumn<int>(
    'receita_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'UNIQUE REFERENCES receitas (id) ON DELETE CASCADE',
    ),
  );
  static const VerificationMeta _horasTrabalhoMeta = const VerificationMeta(
    'horasTrabalho',
  );
  @override
  late final GeneratedColumn<double> horasTrabalho = GeneratedColumn<double>(
    'horas_trabalho',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: false,
    defaultValue: const Constant(0),
  );
  static const VerificationMeta _valorHoraMeta = const VerificationMeta(
    'valorHora',
  );
  @override
  late final GeneratedColumn<double> valorHora = GeneratedColumn<double>(
    'valor_hora',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: false,
    defaultValue: const Constant(0),
  );
  static const VerificationMeta _custosFixosPercentualMeta =
      const VerificationMeta('custosFixosPercentual');
  @override
  late final GeneratedColumn<double> custosFixosPercentual =
      GeneratedColumn<double>(
        'custos_fixos_percentual',
        aliasedName,
        false,
        type: DriftSqlType.double,
        requiredDuringInsert: false,
        defaultValue: const Constant(0),
      );
  static const VerificationMeta _margemLucroPercentualMeta =
      const VerificationMeta('margemLucroPercentual');
  @override
  late final GeneratedColumn<double> margemLucroPercentual =
      GeneratedColumn<double>(
        'margem_lucro_percentual',
        aliasedName,
        false,
        type: DriftSqlType.double,
        requiredDuringInsert: false,
        defaultValue: const Constant(50),
      );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    receitaId,
    horasTrabalho,
    valorHora,
    custosFixosPercentual,
    margemLucroPercentual,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'configuracoes_precificacao';
  @override
  VerificationContext validateIntegrity(
    Insertable<ConfiguracaoPrecificacao> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('receita_id')) {
      context.handle(
        _receitaIdMeta,
        receitaId.isAcceptableOrUnknown(data['receita_id']!, _receitaIdMeta),
      );
    } else if (isInserting) {
      context.missing(_receitaIdMeta);
    }
    if (data.containsKey('horas_trabalho')) {
      context.handle(
        _horasTrabalhoMeta,
        horasTrabalho.isAcceptableOrUnknown(
          data['horas_trabalho']!,
          _horasTrabalhoMeta,
        ),
      );
    }
    if (data.containsKey('valor_hora')) {
      context.handle(
        _valorHoraMeta,
        valorHora.isAcceptableOrUnknown(data['valor_hora']!, _valorHoraMeta),
      );
    }
    if (data.containsKey('custos_fixos_percentual')) {
      context.handle(
        _custosFixosPercentualMeta,
        custosFixosPercentual.isAcceptableOrUnknown(
          data['custos_fixos_percentual']!,
          _custosFixosPercentualMeta,
        ),
      );
    }
    if (data.containsKey('margem_lucro_percentual')) {
      context.handle(
        _margemLucroPercentualMeta,
        margemLucroPercentual.isAcceptableOrUnknown(
          data['margem_lucro_percentual']!,
          _margemLucroPercentualMeta,
        ),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  ConfiguracaoPrecificacao map(
    Map<String, dynamic> data, {
    String? tablePrefix,
  }) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return ConfiguracaoPrecificacao(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      receitaId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}receita_id'],
      )!,
      horasTrabalho: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}horas_trabalho'],
      )!,
      valorHora: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}valor_hora'],
      )!,
      custosFixosPercentual: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}custos_fixos_percentual'],
      )!,
      margemLucroPercentual: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}margem_lucro_percentual'],
      )!,
    );
  }

  @override
  $ConfiguracoesPrecificacaoTable createAlias(String alias) {
    return $ConfiguracoesPrecificacaoTable(attachedDatabase, alias);
  }
}

class ConfiguracaoPrecificacao extends DataClass
    implements Insertable<ConfiguracaoPrecificacao> {
  final int id;
  final int receitaId;
  final double horasTrabalho;
  final double valorHora;
  final double custosFixosPercentual;
  final double margemLucroPercentual;
  const ConfiguracaoPrecificacao({
    required this.id,
    required this.receitaId,
    required this.horasTrabalho,
    required this.valorHora,
    required this.custosFixosPercentual,
    required this.margemLucroPercentual,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['receita_id'] = Variable<int>(receitaId);
    map['horas_trabalho'] = Variable<double>(horasTrabalho);
    map['valor_hora'] = Variable<double>(valorHora);
    map['custos_fixos_percentual'] = Variable<double>(custosFixosPercentual);
    map['margem_lucro_percentual'] = Variable<double>(margemLucroPercentual);
    return map;
  }

  ConfiguracoesPrecificacaoCompanion toCompanion(bool nullToAbsent) {
    return ConfiguracoesPrecificacaoCompanion(
      id: Value(id),
      receitaId: Value(receitaId),
      horasTrabalho: Value(horasTrabalho),
      valorHora: Value(valorHora),
      custosFixosPercentual: Value(custosFixosPercentual),
      margemLucroPercentual: Value(margemLucroPercentual),
    );
  }

  factory ConfiguracaoPrecificacao.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return ConfiguracaoPrecificacao(
      id: serializer.fromJson<int>(json['id']),
      receitaId: serializer.fromJson<int>(json['receitaId']),
      horasTrabalho: serializer.fromJson<double>(json['horasTrabalho']),
      valorHora: serializer.fromJson<double>(json['valorHora']),
      custosFixosPercentual: serializer.fromJson<double>(
        json['custosFixosPercentual'],
      ),
      margemLucroPercentual: serializer.fromJson<double>(
        json['margemLucroPercentual'],
      ),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'receitaId': serializer.toJson<int>(receitaId),
      'horasTrabalho': serializer.toJson<double>(horasTrabalho),
      'valorHora': serializer.toJson<double>(valorHora),
      'custosFixosPercentual': serializer.toJson<double>(custosFixosPercentual),
      'margemLucroPercentual': serializer.toJson<double>(margemLucroPercentual),
    };
  }

  ConfiguracaoPrecificacao copyWith({
    int? id,
    int? receitaId,
    double? horasTrabalho,
    double? valorHora,
    double? custosFixosPercentual,
    double? margemLucroPercentual,
  }) => ConfiguracaoPrecificacao(
    id: id ?? this.id,
    receitaId: receitaId ?? this.receitaId,
    horasTrabalho: horasTrabalho ?? this.horasTrabalho,
    valorHora: valorHora ?? this.valorHora,
    custosFixosPercentual: custosFixosPercentual ?? this.custosFixosPercentual,
    margemLucroPercentual: margemLucroPercentual ?? this.margemLucroPercentual,
  );
  ConfiguracaoPrecificacao copyWithCompanion(
    ConfiguracoesPrecificacaoCompanion data,
  ) {
    return ConfiguracaoPrecificacao(
      id: data.id.present ? data.id.value : this.id,
      receitaId: data.receitaId.present ? data.receitaId.value : this.receitaId,
      horasTrabalho: data.horasTrabalho.present
          ? data.horasTrabalho.value
          : this.horasTrabalho,
      valorHora: data.valorHora.present ? data.valorHora.value : this.valorHora,
      custosFixosPercentual: data.custosFixosPercentual.present
          ? data.custosFixosPercentual.value
          : this.custosFixosPercentual,
      margemLucroPercentual: data.margemLucroPercentual.present
          ? data.margemLucroPercentual.value
          : this.margemLucroPercentual,
    );
  }

  @override
  String toString() {
    return (StringBuffer('ConfiguracaoPrecificacao(')
          ..write('id: $id, ')
          ..write('receitaId: $receitaId, ')
          ..write('horasTrabalho: $horasTrabalho, ')
          ..write('valorHora: $valorHora, ')
          ..write('custosFixosPercentual: $custosFixosPercentual, ')
          ..write('margemLucroPercentual: $margemLucroPercentual')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    receitaId,
    horasTrabalho,
    valorHora,
    custosFixosPercentual,
    margemLucroPercentual,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is ConfiguracaoPrecificacao &&
          other.id == this.id &&
          other.receitaId == this.receitaId &&
          other.horasTrabalho == this.horasTrabalho &&
          other.valorHora == this.valorHora &&
          other.custosFixosPercentual == this.custosFixosPercentual &&
          other.margemLucroPercentual == this.margemLucroPercentual);
}

class ConfiguracoesPrecificacaoCompanion
    extends UpdateCompanion<ConfiguracaoPrecificacao> {
  final Value<int> id;
  final Value<int> receitaId;
  final Value<double> horasTrabalho;
  final Value<double> valorHora;
  final Value<double> custosFixosPercentual;
  final Value<double> margemLucroPercentual;
  const ConfiguracoesPrecificacaoCompanion({
    this.id = const Value.absent(),
    this.receitaId = const Value.absent(),
    this.horasTrabalho = const Value.absent(),
    this.valorHora = const Value.absent(),
    this.custosFixosPercentual = const Value.absent(),
    this.margemLucroPercentual = const Value.absent(),
  });
  ConfiguracoesPrecificacaoCompanion.insert({
    this.id = const Value.absent(),
    required int receitaId,
    this.horasTrabalho = const Value.absent(),
    this.valorHora = const Value.absent(),
    this.custosFixosPercentual = const Value.absent(),
    this.margemLucroPercentual = const Value.absent(),
  }) : receitaId = Value(receitaId);
  static Insertable<ConfiguracaoPrecificacao> custom({
    Expression<int>? id,
    Expression<int>? receitaId,
    Expression<double>? horasTrabalho,
    Expression<double>? valorHora,
    Expression<double>? custosFixosPercentual,
    Expression<double>? margemLucroPercentual,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (receitaId != null) 'receita_id': receitaId,
      if (horasTrabalho != null) 'horas_trabalho': horasTrabalho,
      if (valorHora != null) 'valor_hora': valorHora,
      if (custosFixosPercentual != null)
        'custos_fixos_percentual': custosFixosPercentual,
      if (margemLucroPercentual != null)
        'margem_lucro_percentual': margemLucroPercentual,
    });
  }

  ConfiguracoesPrecificacaoCompanion copyWith({
    Value<int>? id,
    Value<int>? receitaId,
    Value<double>? horasTrabalho,
    Value<double>? valorHora,
    Value<double>? custosFixosPercentual,
    Value<double>? margemLucroPercentual,
  }) {
    return ConfiguracoesPrecificacaoCompanion(
      id: id ?? this.id,
      receitaId: receitaId ?? this.receitaId,
      horasTrabalho: horasTrabalho ?? this.horasTrabalho,
      valorHora: valorHora ?? this.valorHora,
      custosFixosPercentual:
          custosFixosPercentual ?? this.custosFixosPercentual,
      margemLucroPercentual:
          margemLucroPercentual ?? this.margemLucroPercentual,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (receitaId.present) {
      map['receita_id'] = Variable<int>(receitaId.value);
    }
    if (horasTrabalho.present) {
      map['horas_trabalho'] = Variable<double>(horasTrabalho.value);
    }
    if (valorHora.present) {
      map['valor_hora'] = Variable<double>(valorHora.value);
    }
    if (custosFixosPercentual.present) {
      map['custos_fixos_percentual'] = Variable<double>(
        custosFixosPercentual.value,
      );
    }
    if (margemLucroPercentual.present) {
      map['margem_lucro_percentual'] = Variable<double>(
        margemLucroPercentual.value,
      );
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ConfiguracoesPrecificacaoCompanion(')
          ..write('id: $id, ')
          ..write('receitaId: $receitaId, ')
          ..write('horasTrabalho: $horasTrabalho, ')
          ..write('valorHora: $valorHora, ')
          ..write('custosFixosPercentual: $custosFixosPercentual, ')
          ..write('margemLucroPercentual: $margemLucroPercentual')
          ..write(')'))
        .toString();
  }
}

class $ConfiguracoesGeraisTable extends ConfiguracoesGerais
    with TableInfo<$ConfiguracoesGeraisTable, ConfiguracaoGeral> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ConfiguracoesGeraisTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _valorHoraPadraoMeta = const VerificationMeta(
    'valorHoraPadrao',
  );
  @override
  late final GeneratedColumn<double> valorHoraPadrao = GeneratedColumn<double>(
    'valor_hora_padrao',
    aliasedName,
    true,
    type: DriftSqlType.double,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [id, valorHoraPadrao];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'configuracoes_gerais';
  @override
  VerificationContext validateIntegrity(
    Insertable<ConfiguracaoGeral> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('valor_hora_padrao')) {
      context.handle(
        _valorHoraPadraoMeta,
        valorHoraPadrao.isAcceptableOrUnknown(
          data['valor_hora_padrao']!,
          _valorHoraPadraoMeta,
        ),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  ConfiguracaoGeral map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return ConfiguracaoGeral(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      valorHoraPadrao: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}valor_hora_padrao'],
      ),
    );
  }

  @override
  $ConfiguracoesGeraisTable createAlias(String alias) {
    return $ConfiguracoesGeraisTable(attachedDatabase, alias);
  }
}

class ConfiguracaoGeral extends DataClass
    implements Insertable<ConfiguracaoGeral> {
  final int id;
  final double? valorHoraPadrao;
  const ConfiguracaoGeral({required this.id, this.valorHoraPadrao});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    if (!nullToAbsent || valorHoraPadrao != null) {
      map['valor_hora_padrao'] = Variable<double>(valorHoraPadrao);
    }
    return map;
  }

  ConfiguracoesGeraisCompanion toCompanion(bool nullToAbsent) {
    return ConfiguracoesGeraisCompanion(
      id: Value(id),
      valorHoraPadrao: valorHoraPadrao == null && nullToAbsent
          ? const Value.absent()
          : Value(valorHoraPadrao),
    );
  }

  factory ConfiguracaoGeral.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return ConfiguracaoGeral(
      id: serializer.fromJson<int>(json['id']),
      valorHoraPadrao: serializer.fromJson<double?>(json['valorHoraPadrao']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'valorHoraPadrao': serializer.toJson<double?>(valorHoraPadrao),
    };
  }

  ConfiguracaoGeral copyWith({
    int? id,
    Value<double?> valorHoraPadrao = const Value.absent(),
  }) => ConfiguracaoGeral(
    id: id ?? this.id,
    valorHoraPadrao: valorHoraPadrao.present
        ? valorHoraPadrao.value
        : this.valorHoraPadrao,
  );
  ConfiguracaoGeral copyWithCompanion(ConfiguracoesGeraisCompanion data) {
    return ConfiguracaoGeral(
      id: data.id.present ? data.id.value : this.id,
      valorHoraPadrao: data.valorHoraPadrao.present
          ? data.valorHoraPadrao.value
          : this.valorHoraPadrao,
    );
  }

  @override
  String toString() {
    return (StringBuffer('ConfiguracaoGeral(')
          ..write('id: $id, ')
          ..write('valorHoraPadrao: $valorHoraPadrao')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, valorHoraPadrao);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is ConfiguracaoGeral &&
          other.id == this.id &&
          other.valorHoraPadrao == this.valorHoraPadrao);
}

class ConfiguracoesGeraisCompanion extends UpdateCompanion<ConfiguracaoGeral> {
  final Value<int> id;
  final Value<double?> valorHoraPadrao;
  const ConfiguracoesGeraisCompanion({
    this.id = const Value.absent(),
    this.valorHoraPadrao = const Value.absent(),
  });
  ConfiguracoesGeraisCompanion.insert({
    this.id = const Value.absent(),
    this.valorHoraPadrao = const Value.absent(),
  });
  static Insertable<ConfiguracaoGeral> custom({
    Expression<int>? id,
    Expression<double>? valorHoraPadrao,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (valorHoraPadrao != null) 'valor_hora_padrao': valorHoraPadrao,
    });
  }

  ConfiguracoesGeraisCompanion copyWith({
    Value<int>? id,
    Value<double?>? valorHoraPadrao,
  }) {
    return ConfiguracoesGeraisCompanion(
      id: id ?? this.id,
      valorHoraPadrao: valorHoraPadrao ?? this.valorHoraPadrao,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (valorHoraPadrao.present) {
      map['valor_hora_padrao'] = Variable<double>(valorHoraPadrao.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ConfiguracoesGeraisCompanion(')
          ..write('id: $id, ')
          ..write('valorHoraPadrao: $valorHoraPadrao')
          ..write(')'))
        .toString();
  }
}

class $ClientesTable extends Clientes with TableInfo<$ClientesTable, Cliente> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ClientesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'PRIMARY KEY AUTOINCREMENT',
    ),
  );
  static const VerificationMeta _nomeMeta = const VerificationMeta('nome');
  @override
  late final GeneratedColumn<String> nome = GeneratedColumn<String>(
    'nome',
    aliasedName,
    false,
    additionalChecks: GeneratedColumn.checkTextLength(
      minTextLength: 1,
      maxTextLength: 120,
    ),
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _telefoneMeta = const VerificationMeta(
    'telefone',
  );
  @override
  late final GeneratedColumn<String> telefone = GeneratedColumn<String>(
    'telefone',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _emailMeta = const VerificationMeta('email');
  @override
  late final GeneratedColumn<String> email = GeneratedColumn<String>(
    'email',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _enderecoMeta = const VerificationMeta(
    'endereco',
  );
  @override
  late final GeneratedColumn<String> endereco = GeneratedColumn<String>(
    'endereco',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [id, nome, telefone, email, endereco];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'clientes';
  @override
  VerificationContext validateIntegrity(
    Insertable<Cliente> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('nome')) {
      context.handle(
        _nomeMeta,
        nome.isAcceptableOrUnknown(data['nome']!, _nomeMeta),
      );
    } else if (isInserting) {
      context.missing(_nomeMeta);
    }
    if (data.containsKey('telefone')) {
      context.handle(
        _telefoneMeta,
        telefone.isAcceptableOrUnknown(data['telefone']!, _telefoneMeta),
      );
    }
    if (data.containsKey('email')) {
      context.handle(
        _emailMeta,
        email.isAcceptableOrUnknown(data['email']!, _emailMeta),
      );
    }
    if (data.containsKey('endereco')) {
      context.handle(
        _enderecoMeta,
        endereco.isAcceptableOrUnknown(data['endereco']!, _enderecoMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Cliente map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Cliente(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      nome: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}nome'],
      )!,
      telefone: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}telefone'],
      ),
      email: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}email'],
      ),
      endereco: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}endereco'],
      ),
    );
  }

  @override
  $ClientesTable createAlias(String alias) {
    return $ClientesTable(attachedDatabase, alias);
  }
}

class Cliente extends DataClass implements Insertable<Cliente> {
  final int id;
  final String nome;
  final String? telefone;
  final String? email;
  final String? endereco;
  const Cliente({
    required this.id,
    required this.nome,
    this.telefone,
    this.email,
    this.endereco,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['nome'] = Variable<String>(nome);
    if (!nullToAbsent || telefone != null) {
      map['telefone'] = Variable<String>(telefone);
    }
    if (!nullToAbsent || email != null) {
      map['email'] = Variable<String>(email);
    }
    if (!nullToAbsent || endereco != null) {
      map['endereco'] = Variable<String>(endereco);
    }
    return map;
  }

  ClientesCompanion toCompanion(bool nullToAbsent) {
    return ClientesCompanion(
      id: Value(id),
      nome: Value(nome),
      telefone: telefone == null && nullToAbsent
          ? const Value.absent()
          : Value(telefone),
      email: email == null && nullToAbsent
          ? const Value.absent()
          : Value(email),
      endereco: endereco == null && nullToAbsent
          ? const Value.absent()
          : Value(endereco),
    );
  }

  factory Cliente.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Cliente(
      id: serializer.fromJson<int>(json['id']),
      nome: serializer.fromJson<String>(json['nome']),
      telefone: serializer.fromJson<String?>(json['telefone']),
      email: serializer.fromJson<String?>(json['email']),
      endereco: serializer.fromJson<String?>(json['endereco']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'nome': serializer.toJson<String>(nome),
      'telefone': serializer.toJson<String?>(telefone),
      'email': serializer.toJson<String?>(email),
      'endereco': serializer.toJson<String?>(endereco),
    };
  }

  Cliente copyWith({
    int? id,
    String? nome,
    Value<String?> telefone = const Value.absent(),
    Value<String?> email = const Value.absent(),
    Value<String?> endereco = const Value.absent(),
  }) => Cliente(
    id: id ?? this.id,
    nome: nome ?? this.nome,
    telefone: telefone.present ? telefone.value : this.telefone,
    email: email.present ? email.value : this.email,
    endereco: endereco.present ? endereco.value : this.endereco,
  );
  Cliente copyWithCompanion(ClientesCompanion data) {
    return Cliente(
      id: data.id.present ? data.id.value : this.id,
      nome: data.nome.present ? data.nome.value : this.nome,
      telefone: data.telefone.present ? data.telefone.value : this.telefone,
      email: data.email.present ? data.email.value : this.email,
      endereco: data.endereco.present ? data.endereco.value : this.endereco,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Cliente(')
          ..write('id: $id, ')
          ..write('nome: $nome, ')
          ..write('telefone: $telefone, ')
          ..write('email: $email, ')
          ..write('endereco: $endereco')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, nome, telefone, email, endereco);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Cliente &&
          other.id == this.id &&
          other.nome == this.nome &&
          other.telefone == this.telefone &&
          other.email == this.email &&
          other.endereco == this.endereco);
}

class ClientesCompanion extends UpdateCompanion<Cliente> {
  final Value<int> id;
  final Value<String> nome;
  final Value<String?> telefone;
  final Value<String?> email;
  final Value<String?> endereco;
  const ClientesCompanion({
    this.id = const Value.absent(),
    this.nome = const Value.absent(),
    this.telefone = const Value.absent(),
    this.email = const Value.absent(),
    this.endereco = const Value.absent(),
  });
  ClientesCompanion.insert({
    this.id = const Value.absent(),
    required String nome,
    this.telefone = const Value.absent(),
    this.email = const Value.absent(),
    this.endereco = const Value.absent(),
  }) : nome = Value(nome);
  static Insertable<Cliente> custom({
    Expression<int>? id,
    Expression<String>? nome,
    Expression<String>? telefone,
    Expression<String>? email,
    Expression<String>? endereco,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (nome != null) 'nome': nome,
      if (telefone != null) 'telefone': telefone,
      if (email != null) 'email': email,
      if (endereco != null) 'endereco': endereco,
    });
  }

  ClientesCompanion copyWith({
    Value<int>? id,
    Value<String>? nome,
    Value<String?>? telefone,
    Value<String?>? email,
    Value<String?>? endereco,
  }) {
    return ClientesCompanion(
      id: id ?? this.id,
      nome: nome ?? this.nome,
      telefone: telefone ?? this.telefone,
      email: email ?? this.email,
      endereco: endereco ?? this.endereco,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (nome.present) {
      map['nome'] = Variable<String>(nome.value);
    }
    if (telefone.present) {
      map['telefone'] = Variable<String>(telefone.value);
    }
    if (email.present) {
      map['email'] = Variable<String>(email.value);
    }
    if (endereco.present) {
      map['endereco'] = Variable<String>(endereco.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ClientesCompanion(')
          ..write('id: $id, ')
          ..write('nome: $nome, ')
          ..write('telefone: $telefone, ')
          ..write('email: $email, ')
          ..write('endereco: $endereco')
          ..write(')'))
        .toString();
  }
}

class $OrcamentosTable extends Orcamentos
    with TableInfo<$OrcamentosTable, Orcamento> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $OrcamentosTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'PRIMARY KEY AUTOINCREMENT',
    ),
  );
  static const VerificationMeta _clienteIdMeta = const VerificationMeta(
    'clienteId',
  );
  @override
  late final GeneratedColumn<int> clienteId = GeneratedColumn<int>(
    'cliente_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'REFERENCES clientes (id) ON DELETE RESTRICT',
    ),
  );
  static const VerificationMeta _criadoEmMeta = const VerificationMeta(
    'criadoEm',
  );
  @override
  late final GeneratedColumn<DateTime> criadoEm = GeneratedColumn<DateTime>(
    'criado_em',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  static const VerificationMeta _validadeDiasMeta = const VerificationMeta(
    'validadeDias',
  );
  @override
  late final GeneratedColumn<int> validadeDias = GeneratedColumn<int>(
    'validade_dias',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(7),
  );
  static const VerificationMeta _observacoesMeta = const VerificationMeta(
    'observacoes',
  );
  @override
  late final GeneratedColumn<String> observacoes = GeneratedColumn<String>(
    'observacoes',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    clienteId,
    criadoEm,
    validadeDias,
    observacoes,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'orcamentos';
  @override
  VerificationContext validateIntegrity(
    Insertable<Orcamento> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('cliente_id')) {
      context.handle(
        _clienteIdMeta,
        clienteId.isAcceptableOrUnknown(data['cliente_id']!, _clienteIdMeta),
      );
    } else if (isInserting) {
      context.missing(_clienteIdMeta);
    }
    if (data.containsKey('criado_em')) {
      context.handle(
        _criadoEmMeta,
        criadoEm.isAcceptableOrUnknown(data['criado_em']!, _criadoEmMeta),
      );
    }
    if (data.containsKey('validade_dias')) {
      context.handle(
        _validadeDiasMeta,
        validadeDias.isAcceptableOrUnknown(
          data['validade_dias']!,
          _validadeDiasMeta,
        ),
      );
    }
    if (data.containsKey('observacoes')) {
      context.handle(
        _observacoesMeta,
        observacoes.isAcceptableOrUnknown(
          data['observacoes']!,
          _observacoesMeta,
        ),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Orcamento map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Orcamento(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      clienteId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}cliente_id'],
      )!,
      criadoEm: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}criado_em'],
      )!,
      validadeDias: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}validade_dias'],
      )!,
      observacoes: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}observacoes'],
      ),
    );
  }

  @override
  $OrcamentosTable createAlias(String alias) {
    return $OrcamentosTable(attachedDatabase, alias);
  }
}

class Orcamento extends DataClass implements Insertable<Orcamento> {
  final int id;
  final int clienteId;
  final DateTime criadoEm;
  final int validadeDias;
  final String? observacoes;
  const Orcamento({
    required this.id,
    required this.clienteId,
    required this.criadoEm,
    required this.validadeDias,
    this.observacoes,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['cliente_id'] = Variable<int>(clienteId);
    map['criado_em'] = Variable<DateTime>(criadoEm);
    map['validade_dias'] = Variable<int>(validadeDias);
    if (!nullToAbsent || observacoes != null) {
      map['observacoes'] = Variable<String>(observacoes);
    }
    return map;
  }

  OrcamentosCompanion toCompanion(bool nullToAbsent) {
    return OrcamentosCompanion(
      id: Value(id),
      clienteId: Value(clienteId),
      criadoEm: Value(criadoEm),
      validadeDias: Value(validadeDias),
      observacoes: observacoes == null && nullToAbsent
          ? const Value.absent()
          : Value(observacoes),
    );
  }

  factory Orcamento.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Orcamento(
      id: serializer.fromJson<int>(json['id']),
      clienteId: serializer.fromJson<int>(json['clienteId']),
      criadoEm: serializer.fromJson<DateTime>(json['criadoEm']),
      validadeDias: serializer.fromJson<int>(json['validadeDias']),
      observacoes: serializer.fromJson<String?>(json['observacoes']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'clienteId': serializer.toJson<int>(clienteId),
      'criadoEm': serializer.toJson<DateTime>(criadoEm),
      'validadeDias': serializer.toJson<int>(validadeDias),
      'observacoes': serializer.toJson<String?>(observacoes),
    };
  }

  Orcamento copyWith({
    int? id,
    int? clienteId,
    DateTime? criadoEm,
    int? validadeDias,
    Value<String?> observacoes = const Value.absent(),
  }) => Orcamento(
    id: id ?? this.id,
    clienteId: clienteId ?? this.clienteId,
    criadoEm: criadoEm ?? this.criadoEm,
    validadeDias: validadeDias ?? this.validadeDias,
    observacoes: observacoes.present ? observacoes.value : this.observacoes,
  );
  Orcamento copyWithCompanion(OrcamentosCompanion data) {
    return Orcamento(
      id: data.id.present ? data.id.value : this.id,
      clienteId: data.clienteId.present ? data.clienteId.value : this.clienteId,
      criadoEm: data.criadoEm.present ? data.criadoEm.value : this.criadoEm,
      validadeDias: data.validadeDias.present
          ? data.validadeDias.value
          : this.validadeDias,
      observacoes: data.observacoes.present
          ? data.observacoes.value
          : this.observacoes,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Orcamento(')
          ..write('id: $id, ')
          ..write('clienteId: $clienteId, ')
          ..write('criadoEm: $criadoEm, ')
          ..write('validadeDias: $validadeDias, ')
          ..write('observacoes: $observacoes')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, clienteId, criadoEm, validadeDias, observacoes);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Orcamento &&
          other.id == this.id &&
          other.clienteId == this.clienteId &&
          other.criadoEm == this.criadoEm &&
          other.validadeDias == this.validadeDias &&
          other.observacoes == this.observacoes);
}

class OrcamentosCompanion extends UpdateCompanion<Orcamento> {
  final Value<int> id;
  final Value<int> clienteId;
  final Value<DateTime> criadoEm;
  final Value<int> validadeDias;
  final Value<String?> observacoes;
  const OrcamentosCompanion({
    this.id = const Value.absent(),
    this.clienteId = const Value.absent(),
    this.criadoEm = const Value.absent(),
    this.validadeDias = const Value.absent(),
    this.observacoes = const Value.absent(),
  });
  OrcamentosCompanion.insert({
    this.id = const Value.absent(),
    required int clienteId,
    this.criadoEm = const Value.absent(),
    this.validadeDias = const Value.absent(),
    this.observacoes = const Value.absent(),
  }) : clienteId = Value(clienteId);
  static Insertable<Orcamento> custom({
    Expression<int>? id,
    Expression<int>? clienteId,
    Expression<DateTime>? criadoEm,
    Expression<int>? validadeDias,
    Expression<String>? observacoes,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (clienteId != null) 'cliente_id': clienteId,
      if (criadoEm != null) 'criado_em': criadoEm,
      if (validadeDias != null) 'validade_dias': validadeDias,
      if (observacoes != null) 'observacoes': observacoes,
    });
  }

  OrcamentosCompanion copyWith({
    Value<int>? id,
    Value<int>? clienteId,
    Value<DateTime>? criadoEm,
    Value<int>? validadeDias,
    Value<String?>? observacoes,
  }) {
    return OrcamentosCompanion(
      id: id ?? this.id,
      clienteId: clienteId ?? this.clienteId,
      criadoEm: criadoEm ?? this.criadoEm,
      validadeDias: validadeDias ?? this.validadeDias,
      observacoes: observacoes ?? this.observacoes,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (clienteId.present) {
      map['cliente_id'] = Variable<int>(clienteId.value);
    }
    if (criadoEm.present) {
      map['criado_em'] = Variable<DateTime>(criadoEm.value);
    }
    if (validadeDias.present) {
      map['validade_dias'] = Variable<int>(validadeDias.value);
    }
    if (observacoes.present) {
      map['observacoes'] = Variable<String>(observacoes.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('OrcamentosCompanion(')
          ..write('id: $id, ')
          ..write('clienteId: $clienteId, ')
          ..write('criadoEm: $criadoEm, ')
          ..write('validadeDias: $validadeDias, ')
          ..write('observacoes: $observacoes')
          ..write(')'))
        .toString();
  }
}

class $OrcamentoItensTable extends OrcamentoItens
    with TableInfo<$OrcamentoItensTable, OrcamentoIten> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $OrcamentoItensTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'PRIMARY KEY AUTOINCREMENT',
    ),
  );
  static const VerificationMeta _orcamentoIdMeta = const VerificationMeta(
    'orcamentoId',
  );
  @override
  late final GeneratedColumn<int> orcamentoId = GeneratedColumn<int>(
    'orcamento_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'REFERENCES orcamentos (id) ON DELETE CASCADE',
    ),
  );
  static const VerificationMeta _receitaIdMeta = const VerificationMeta(
    'receitaId',
  );
  @override
  late final GeneratedColumn<int> receitaId = GeneratedColumn<int>(
    'receita_id',
    aliasedName,
    true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'REFERENCES receitas (id) ON DELETE SET NULL',
    ),
  );
  static const VerificationMeta _descricaoMeta = const VerificationMeta(
    'descricao',
  );
  @override
  late final GeneratedColumn<String> descricao = GeneratedColumn<String>(
    'descricao',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _quantidadeMeta = const VerificationMeta(
    'quantidade',
  );
  @override
  late final GeneratedColumn<double> quantidade = GeneratedColumn<double>(
    'quantidade',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: false,
    defaultValue: const Constant(1),
  );
  static const VerificationMeta _precoUnitarioMeta = const VerificationMeta(
    'precoUnitario',
  );
  @override
  late final GeneratedColumn<double> precoUnitario = GeneratedColumn<double>(
    'preco_unitario',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    orcamentoId,
    receitaId,
    descricao,
    quantidade,
    precoUnitario,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'orcamento_itens';
  @override
  VerificationContext validateIntegrity(
    Insertable<OrcamentoIten> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('orcamento_id')) {
      context.handle(
        _orcamentoIdMeta,
        orcamentoId.isAcceptableOrUnknown(
          data['orcamento_id']!,
          _orcamentoIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_orcamentoIdMeta);
    }
    if (data.containsKey('receita_id')) {
      context.handle(
        _receitaIdMeta,
        receitaId.isAcceptableOrUnknown(data['receita_id']!, _receitaIdMeta),
      );
    }
    if (data.containsKey('descricao')) {
      context.handle(
        _descricaoMeta,
        descricao.isAcceptableOrUnknown(data['descricao']!, _descricaoMeta),
      );
    } else if (isInserting) {
      context.missing(_descricaoMeta);
    }
    if (data.containsKey('quantidade')) {
      context.handle(
        _quantidadeMeta,
        quantidade.isAcceptableOrUnknown(data['quantidade']!, _quantidadeMeta),
      );
    }
    if (data.containsKey('preco_unitario')) {
      context.handle(
        _precoUnitarioMeta,
        precoUnitario.isAcceptableOrUnknown(
          data['preco_unitario']!,
          _precoUnitarioMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_precoUnitarioMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  OrcamentoIten map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return OrcamentoIten(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      orcamentoId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}orcamento_id'],
      )!,
      receitaId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}receita_id'],
      ),
      descricao: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}descricao'],
      )!,
      quantidade: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}quantidade'],
      )!,
      precoUnitario: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}preco_unitario'],
      )!,
    );
  }

  @override
  $OrcamentoItensTable createAlias(String alias) {
    return $OrcamentoItensTable(attachedDatabase, alias);
  }
}

class OrcamentoIten extends DataClass implements Insertable<OrcamentoIten> {
  final int id;
  final int orcamentoId;
  final int? receitaId;
  final String descricao;
  final double quantidade;
  final double precoUnitario;
  const OrcamentoIten({
    required this.id,
    required this.orcamentoId,
    this.receitaId,
    required this.descricao,
    required this.quantidade,
    required this.precoUnitario,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['orcamento_id'] = Variable<int>(orcamentoId);
    if (!nullToAbsent || receitaId != null) {
      map['receita_id'] = Variable<int>(receitaId);
    }
    map['descricao'] = Variable<String>(descricao);
    map['quantidade'] = Variable<double>(quantidade);
    map['preco_unitario'] = Variable<double>(precoUnitario);
    return map;
  }

  OrcamentoItensCompanion toCompanion(bool nullToAbsent) {
    return OrcamentoItensCompanion(
      id: Value(id),
      orcamentoId: Value(orcamentoId),
      receitaId: receitaId == null && nullToAbsent
          ? const Value.absent()
          : Value(receitaId),
      descricao: Value(descricao),
      quantidade: Value(quantidade),
      precoUnitario: Value(precoUnitario),
    );
  }

  factory OrcamentoIten.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return OrcamentoIten(
      id: serializer.fromJson<int>(json['id']),
      orcamentoId: serializer.fromJson<int>(json['orcamentoId']),
      receitaId: serializer.fromJson<int?>(json['receitaId']),
      descricao: serializer.fromJson<String>(json['descricao']),
      quantidade: serializer.fromJson<double>(json['quantidade']),
      precoUnitario: serializer.fromJson<double>(json['precoUnitario']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'orcamentoId': serializer.toJson<int>(orcamentoId),
      'receitaId': serializer.toJson<int?>(receitaId),
      'descricao': serializer.toJson<String>(descricao),
      'quantidade': serializer.toJson<double>(quantidade),
      'precoUnitario': serializer.toJson<double>(precoUnitario),
    };
  }

  OrcamentoIten copyWith({
    int? id,
    int? orcamentoId,
    Value<int?> receitaId = const Value.absent(),
    String? descricao,
    double? quantidade,
    double? precoUnitario,
  }) => OrcamentoIten(
    id: id ?? this.id,
    orcamentoId: orcamentoId ?? this.orcamentoId,
    receitaId: receitaId.present ? receitaId.value : this.receitaId,
    descricao: descricao ?? this.descricao,
    quantidade: quantidade ?? this.quantidade,
    precoUnitario: precoUnitario ?? this.precoUnitario,
  );
  OrcamentoIten copyWithCompanion(OrcamentoItensCompanion data) {
    return OrcamentoIten(
      id: data.id.present ? data.id.value : this.id,
      orcamentoId: data.orcamentoId.present
          ? data.orcamentoId.value
          : this.orcamentoId,
      receitaId: data.receitaId.present ? data.receitaId.value : this.receitaId,
      descricao: data.descricao.present ? data.descricao.value : this.descricao,
      quantidade: data.quantidade.present
          ? data.quantidade.value
          : this.quantidade,
      precoUnitario: data.precoUnitario.present
          ? data.precoUnitario.value
          : this.precoUnitario,
    );
  }

  @override
  String toString() {
    return (StringBuffer('OrcamentoIten(')
          ..write('id: $id, ')
          ..write('orcamentoId: $orcamentoId, ')
          ..write('receitaId: $receitaId, ')
          ..write('descricao: $descricao, ')
          ..write('quantidade: $quantidade, ')
          ..write('precoUnitario: $precoUnitario')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    orcamentoId,
    receitaId,
    descricao,
    quantidade,
    precoUnitario,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is OrcamentoIten &&
          other.id == this.id &&
          other.orcamentoId == this.orcamentoId &&
          other.receitaId == this.receitaId &&
          other.descricao == this.descricao &&
          other.quantidade == this.quantidade &&
          other.precoUnitario == this.precoUnitario);
}

class OrcamentoItensCompanion extends UpdateCompanion<OrcamentoIten> {
  final Value<int> id;
  final Value<int> orcamentoId;
  final Value<int?> receitaId;
  final Value<String> descricao;
  final Value<double> quantidade;
  final Value<double> precoUnitario;
  const OrcamentoItensCompanion({
    this.id = const Value.absent(),
    this.orcamentoId = const Value.absent(),
    this.receitaId = const Value.absent(),
    this.descricao = const Value.absent(),
    this.quantidade = const Value.absent(),
    this.precoUnitario = const Value.absent(),
  });
  OrcamentoItensCompanion.insert({
    this.id = const Value.absent(),
    required int orcamentoId,
    this.receitaId = const Value.absent(),
    required String descricao,
    this.quantidade = const Value.absent(),
    required double precoUnitario,
  }) : orcamentoId = Value(orcamentoId),
       descricao = Value(descricao),
       precoUnitario = Value(precoUnitario);
  static Insertable<OrcamentoIten> custom({
    Expression<int>? id,
    Expression<int>? orcamentoId,
    Expression<int>? receitaId,
    Expression<String>? descricao,
    Expression<double>? quantidade,
    Expression<double>? precoUnitario,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (orcamentoId != null) 'orcamento_id': orcamentoId,
      if (receitaId != null) 'receita_id': receitaId,
      if (descricao != null) 'descricao': descricao,
      if (quantidade != null) 'quantidade': quantidade,
      if (precoUnitario != null) 'preco_unitario': precoUnitario,
    });
  }

  OrcamentoItensCompanion copyWith({
    Value<int>? id,
    Value<int>? orcamentoId,
    Value<int?>? receitaId,
    Value<String>? descricao,
    Value<double>? quantidade,
    Value<double>? precoUnitario,
  }) {
    return OrcamentoItensCompanion(
      id: id ?? this.id,
      orcamentoId: orcamentoId ?? this.orcamentoId,
      receitaId: receitaId ?? this.receitaId,
      descricao: descricao ?? this.descricao,
      quantidade: quantidade ?? this.quantidade,
      precoUnitario: precoUnitario ?? this.precoUnitario,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (orcamentoId.present) {
      map['orcamento_id'] = Variable<int>(orcamentoId.value);
    }
    if (receitaId.present) {
      map['receita_id'] = Variable<int>(receitaId.value);
    }
    if (descricao.present) {
      map['descricao'] = Variable<String>(descricao.value);
    }
    if (quantidade.present) {
      map['quantidade'] = Variable<double>(quantidade.value);
    }
    if (precoUnitario.present) {
      map['preco_unitario'] = Variable<double>(precoUnitario.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('OrcamentoItensCompanion(')
          ..write('id: $id, ')
          ..write('orcamentoId: $orcamentoId, ')
          ..write('receitaId: $receitaId, ')
          ..write('descricao: $descricao, ')
          ..write('quantidade: $quantidade, ')
          ..write('precoUnitario: $precoUnitario')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $IngredientesTable ingredientes = $IngredientesTable(this);
  late final $ReceitasTable receitas = $ReceitasTable(this);
  late final $ReceitaIngredientesTable receitaIngredientes =
      $ReceitaIngredientesTable(this);
  late final $ConfiguracoesPrecificacaoTable configuracoesPrecificacao =
      $ConfiguracoesPrecificacaoTable(this);
  late final $ConfiguracoesGeraisTable configuracoesGerais =
      $ConfiguracoesGeraisTable(this);
  late final $ClientesTable clientes = $ClientesTable(this);
  late final $OrcamentosTable orcamentos = $OrcamentosTable(this);
  late final $OrcamentoItensTable orcamentoItens = $OrcamentoItensTable(this);
  late final IngredientesDao ingredientesDao = IngredientesDao(
    this as AppDatabase,
  );
  late final ReceitasDao receitasDao = ReceitasDao(this as AppDatabase);
  late final PrecificacaoDao precificacaoDao = PrecificacaoDao(
    this as AppDatabase,
  );
  late final ConfiguracoesGeraisDao configuracoesGeraisDao =
      ConfiguracoesGeraisDao(this as AppDatabase);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
    ingredientes,
    receitas,
    receitaIngredientes,
    configuracoesPrecificacao,
    configuracoesGerais,
    clientes,
    orcamentos,
    orcamentoItens,
  ];
  @override
  StreamQueryUpdateRules get streamUpdateRules => const StreamQueryUpdateRules([
    WritePropagation(
      on: TableUpdateQuery.onTableName(
        'receitas',
        limitUpdateKind: UpdateKind.delete,
      ),
      result: [TableUpdate('receita_ingredientes', kind: UpdateKind.delete)],
    ),
    WritePropagation(
      on: TableUpdateQuery.onTableName(
        'ingredientes',
        limitUpdateKind: UpdateKind.delete,
      ),
      result: [TableUpdate('receita_ingredientes', kind: UpdateKind.delete)],
    ),
    WritePropagation(
      on: TableUpdateQuery.onTableName(
        'receitas',
        limitUpdateKind: UpdateKind.delete,
      ),
      result: [
        TableUpdate('configuracoes_precificacao', kind: UpdateKind.delete),
      ],
    ),
    WritePropagation(
      on: TableUpdateQuery.onTableName(
        'orcamentos',
        limitUpdateKind: UpdateKind.delete,
      ),
      result: [TableUpdate('orcamento_itens', kind: UpdateKind.delete)],
    ),
    WritePropagation(
      on: TableUpdateQuery.onTableName(
        'receitas',
        limitUpdateKind: UpdateKind.delete,
      ),
      result: [TableUpdate('orcamento_itens', kind: UpdateKind.update)],
    ),
  ]);
}

typedef $$IngredientesTableCreateCompanionBuilder =
    IngredientesCompanion Function({
      Value<int> id,
      required String nome,
      required UnidadeMedida unidadeMedida,
      required double precoUnidade,
      Value<DateTime> criadoEm,
      Value<DateTime> atualizadoEm,
    });
typedef $$IngredientesTableUpdateCompanionBuilder =
    IngredientesCompanion Function({
      Value<int> id,
      Value<String> nome,
      Value<UnidadeMedida> unidadeMedida,
      Value<double> precoUnidade,
      Value<DateTime> criadoEm,
      Value<DateTime> atualizadoEm,
    });

final class $$IngredientesTableReferences
    extends BaseReferences<_$AppDatabase, $IngredientesTable, Ingrediente> {
  $$IngredientesTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static MultiTypedResultKey<
    $ReceitaIngredientesTable,
    List<ReceitaIngrediente>
  >
  _receitaIngredientesRefsTable(_$AppDatabase db) =>
      MultiTypedResultKey.fromTable(
        db.receitaIngredientes,
        aliasName: $_aliasNameGenerator(
          db.ingredientes.id,
          db.receitaIngredientes.ingredienteId,
        ),
      );

  $$ReceitaIngredientesTableProcessedTableManager get receitaIngredientesRefs {
    final manager = $$ReceitaIngredientesTableTableManager(
      $_db,
      $_db.receitaIngredientes,
    ).filter((f) => f.ingredienteId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(
      _receitaIngredientesRefsTable($_db),
    );
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: cache),
    );
  }
}

class $$IngredientesTableFilterComposer
    extends Composer<_$AppDatabase, $IngredientesTable> {
  $$IngredientesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get nome => $composableBuilder(
    column: $table.nome,
    builder: (column) => ColumnFilters(column),
  );

  ColumnWithTypeConverterFilters<UnidadeMedida, UnidadeMedida, String>
  get unidadeMedida => $composableBuilder(
    column: $table.unidadeMedida,
    builder: (column) => ColumnWithTypeConverterFilters(column),
  );

  ColumnFilters<double> get precoUnidade => $composableBuilder(
    column: $table.precoUnidade,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get criadoEm => $composableBuilder(
    column: $table.criadoEm,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get atualizadoEm => $composableBuilder(
    column: $table.atualizadoEm,
    builder: (column) => ColumnFilters(column),
  );

  Expression<bool> receitaIngredientesRefs(
    Expression<bool> Function($$ReceitaIngredientesTableFilterComposer f) f,
  ) {
    final $$ReceitaIngredientesTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.receitaIngredientes,
      getReferencedColumn: (t) => t.ingredienteId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$ReceitaIngredientesTableFilterComposer(
            $db: $db,
            $table: $db.receitaIngredientes,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }
}

class $$IngredientesTableOrderingComposer
    extends Composer<_$AppDatabase, $IngredientesTable> {
  $$IngredientesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get nome => $composableBuilder(
    column: $table.nome,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get unidadeMedida => $composableBuilder(
    column: $table.unidadeMedida,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get precoUnidade => $composableBuilder(
    column: $table.precoUnidade,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get criadoEm => $composableBuilder(
    column: $table.criadoEm,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get atualizadoEm => $composableBuilder(
    column: $table.atualizadoEm,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$IngredientesTableAnnotationComposer
    extends Composer<_$AppDatabase, $IngredientesTable> {
  $$IngredientesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get nome =>
      $composableBuilder(column: $table.nome, builder: (column) => column);

  GeneratedColumnWithTypeConverter<UnidadeMedida, String> get unidadeMedida =>
      $composableBuilder(
        column: $table.unidadeMedida,
        builder: (column) => column,
      );

  GeneratedColumn<double> get precoUnidade => $composableBuilder(
    column: $table.precoUnidade,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get criadoEm =>
      $composableBuilder(column: $table.criadoEm, builder: (column) => column);

  GeneratedColumn<DateTime> get atualizadoEm => $composableBuilder(
    column: $table.atualizadoEm,
    builder: (column) => column,
  );

  Expression<T> receitaIngredientesRefs<T extends Object>(
    Expression<T> Function($$ReceitaIngredientesTableAnnotationComposer a) f,
  ) {
    final $$ReceitaIngredientesTableAnnotationComposer composer =
        $composerBuilder(
          composer: this,
          getCurrentColumn: (t) => t.id,
          referencedTable: $db.receitaIngredientes,
          getReferencedColumn: (t) => t.ingredienteId,
          builder:
              (
                joinBuilder, {
                $addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer,
              }) => $$ReceitaIngredientesTableAnnotationComposer(
                $db: $db,
                $table: $db.receitaIngredientes,
                $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
                joinBuilder: joinBuilder,
                $removeJoinBuilderFromRootComposer:
                    $removeJoinBuilderFromRootComposer,
              ),
        );
    return f(composer);
  }
}

class $$IngredientesTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $IngredientesTable,
          Ingrediente,
          $$IngredientesTableFilterComposer,
          $$IngredientesTableOrderingComposer,
          $$IngredientesTableAnnotationComposer,
          $$IngredientesTableCreateCompanionBuilder,
          $$IngredientesTableUpdateCompanionBuilder,
          (Ingrediente, $$IngredientesTableReferences),
          Ingrediente,
          PrefetchHooks Function({bool receitaIngredientesRefs})
        > {
  $$IngredientesTableTableManager(_$AppDatabase db, $IngredientesTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$IngredientesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$IngredientesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$IngredientesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<String> nome = const Value.absent(),
                Value<UnidadeMedida> unidadeMedida = const Value.absent(),
                Value<double> precoUnidade = const Value.absent(),
                Value<DateTime> criadoEm = const Value.absent(),
                Value<DateTime> atualizadoEm = const Value.absent(),
              }) => IngredientesCompanion(
                id: id,
                nome: nome,
                unidadeMedida: unidadeMedida,
                precoUnidade: precoUnidade,
                criadoEm: criadoEm,
                atualizadoEm: atualizadoEm,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required String nome,
                required UnidadeMedida unidadeMedida,
                required double precoUnidade,
                Value<DateTime> criadoEm = const Value.absent(),
                Value<DateTime> atualizadoEm = const Value.absent(),
              }) => IngredientesCompanion.insert(
                id: id,
                nome: nome,
                unidadeMedida: unidadeMedida,
                precoUnidade: precoUnidade,
                criadoEm: criadoEm,
                atualizadoEm: atualizadoEm,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable(table),
                  $$IngredientesTableReferences(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: ({receitaIngredientesRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [
                if (receitaIngredientesRefs) db.receitaIngredientes,
              ],
              addJoins: null,
              getPrefetchedDataCallback: (items) async {
                return [
                  if (receitaIngredientesRefs)
                    await $_getPrefetchedData<
                      Ingrediente,
                      $IngredientesTable,
                      ReceitaIngrediente
                    >(
                      currentTable: table,
                      referencedTable: $$IngredientesTableReferences
                          ._receitaIngredientesRefsTable(db),
                      managerFromTypedResult: (p0) =>
                          $$IngredientesTableReferences(
                            db,
                            table,
                            p0,
                          ).receitaIngredientesRefs,
                      referencedItemsForCurrentItem: (item, referencedItems) =>
                          referencedItems.where(
                            (e) => e.ingredienteId == item.id,
                          ),
                      typedResults: items,
                    ),
                ];
              },
            );
          },
        ),
      );
}

typedef $$IngredientesTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $IngredientesTable,
      Ingrediente,
      $$IngredientesTableFilterComposer,
      $$IngredientesTableOrderingComposer,
      $$IngredientesTableAnnotationComposer,
      $$IngredientesTableCreateCompanionBuilder,
      $$IngredientesTableUpdateCompanionBuilder,
      (Ingrediente, $$IngredientesTableReferences),
      Ingrediente,
      PrefetchHooks Function({bool receitaIngredientesRefs})
    >;
typedef $$ReceitasTableCreateCompanionBuilder =
    ReceitasCompanion Function({
      Value<int> id,
      required String nome,
      Value<String?> modoPreparo,
      Value<int> rendimento,
      Value<int?> tempoPreparoMinutos,
      Value<DateTime> criadoEm,
      Value<DateTime> atualizadoEm,
    });
typedef $$ReceitasTableUpdateCompanionBuilder =
    ReceitasCompanion Function({
      Value<int> id,
      Value<String> nome,
      Value<String?> modoPreparo,
      Value<int> rendimento,
      Value<int?> tempoPreparoMinutos,
      Value<DateTime> criadoEm,
      Value<DateTime> atualizadoEm,
    });

final class $$ReceitasTableReferences
    extends BaseReferences<_$AppDatabase, $ReceitasTable, Receita> {
  $$ReceitasTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static MultiTypedResultKey<
    $ReceitaIngredientesTable,
    List<ReceitaIngrediente>
  >
  _receitaIngredientesRefsTable(_$AppDatabase db) =>
      MultiTypedResultKey.fromTable(
        db.receitaIngredientes,
        aliasName: $_aliasNameGenerator(
          db.receitas.id,
          db.receitaIngredientes.receitaId,
        ),
      );

  $$ReceitaIngredientesTableProcessedTableManager get receitaIngredientesRefs {
    final manager = $$ReceitaIngredientesTableTableManager(
      $_db,
      $_db.receitaIngredientes,
    ).filter((f) => f.receitaId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(
      _receitaIngredientesRefsTable($_db),
    );
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: cache),
    );
  }

  static MultiTypedResultKey<
    $ConfiguracoesPrecificacaoTable,
    List<ConfiguracaoPrecificacao>
  >
  _configuracoesPrecificacaoRefsTable(_$AppDatabase db) =>
      MultiTypedResultKey.fromTable(
        db.configuracoesPrecificacao,
        aliasName: $_aliasNameGenerator(
          db.receitas.id,
          db.configuracoesPrecificacao.receitaId,
        ),
      );

  $$ConfiguracoesPrecificacaoTableProcessedTableManager
  get configuracoesPrecificacaoRefs {
    final manager = $$ConfiguracoesPrecificacaoTableTableManager(
      $_db,
      $_db.configuracoesPrecificacao,
    ).filter((f) => f.receitaId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(
      _configuracoesPrecificacaoRefsTable($_db),
    );
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: cache),
    );
  }

  static MultiTypedResultKey<$OrcamentoItensTable, List<OrcamentoIten>>
  _orcamentoItensRefsTable(_$AppDatabase db) => MultiTypedResultKey.fromTable(
    db.orcamentoItens,
    aliasName: $_aliasNameGenerator(
      db.receitas.id,
      db.orcamentoItens.receitaId,
    ),
  );

  $$OrcamentoItensTableProcessedTableManager get orcamentoItensRefs {
    final manager = $$OrcamentoItensTableTableManager(
      $_db,
      $_db.orcamentoItens,
    ).filter((f) => f.receitaId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_orcamentoItensRefsTable($_db));
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: cache),
    );
  }
}

class $$ReceitasTableFilterComposer
    extends Composer<_$AppDatabase, $ReceitasTable> {
  $$ReceitasTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get nome => $composableBuilder(
    column: $table.nome,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get modoPreparo => $composableBuilder(
    column: $table.modoPreparo,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get rendimento => $composableBuilder(
    column: $table.rendimento,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get tempoPreparoMinutos => $composableBuilder(
    column: $table.tempoPreparoMinutos,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get criadoEm => $composableBuilder(
    column: $table.criadoEm,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get atualizadoEm => $composableBuilder(
    column: $table.atualizadoEm,
    builder: (column) => ColumnFilters(column),
  );

  Expression<bool> receitaIngredientesRefs(
    Expression<bool> Function($$ReceitaIngredientesTableFilterComposer f) f,
  ) {
    final $$ReceitaIngredientesTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.receitaIngredientes,
      getReferencedColumn: (t) => t.receitaId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$ReceitaIngredientesTableFilterComposer(
            $db: $db,
            $table: $db.receitaIngredientes,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }

  Expression<bool> configuracoesPrecificacaoRefs(
    Expression<bool> Function($$ConfiguracoesPrecificacaoTableFilterComposer f)
    f,
  ) {
    final $$ConfiguracoesPrecificacaoTableFilterComposer composer =
        $composerBuilder(
          composer: this,
          getCurrentColumn: (t) => t.id,
          referencedTable: $db.configuracoesPrecificacao,
          getReferencedColumn: (t) => t.receitaId,
          builder:
              (
                joinBuilder, {
                $addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer,
              }) => $$ConfiguracoesPrecificacaoTableFilterComposer(
                $db: $db,
                $table: $db.configuracoesPrecificacao,
                $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
                joinBuilder: joinBuilder,
                $removeJoinBuilderFromRootComposer:
                    $removeJoinBuilderFromRootComposer,
              ),
        );
    return f(composer);
  }

  Expression<bool> orcamentoItensRefs(
    Expression<bool> Function($$OrcamentoItensTableFilterComposer f) f,
  ) {
    final $$OrcamentoItensTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.orcamentoItens,
      getReferencedColumn: (t) => t.receitaId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$OrcamentoItensTableFilterComposer(
            $db: $db,
            $table: $db.orcamentoItens,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }
}

class $$ReceitasTableOrderingComposer
    extends Composer<_$AppDatabase, $ReceitasTable> {
  $$ReceitasTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get nome => $composableBuilder(
    column: $table.nome,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get modoPreparo => $composableBuilder(
    column: $table.modoPreparo,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get rendimento => $composableBuilder(
    column: $table.rendimento,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get tempoPreparoMinutos => $composableBuilder(
    column: $table.tempoPreparoMinutos,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get criadoEm => $composableBuilder(
    column: $table.criadoEm,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get atualizadoEm => $composableBuilder(
    column: $table.atualizadoEm,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$ReceitasTableAnnotationComposer
    extends Composer<_$AppDatabase, $ReceitasTable> {
  $$ReceitasTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get nome =>
      $composableBuilder(column: $table.nome, builder: (column) => column);

  GeneratedColumn<String> get modoPreparo => $composableBuilder(
    column: $table.modoPreparo,
    builder: (column) => column,
  );

  GeneratedColumn<int> get rendimento => $composableBuilder(
    column: $table.rendimento,
    builder: (column) => column,
  );

  GeneratedColumn<int> get tempoPreparoMinutos => $composableBuilder(
    column: $table.tempoPreparoMinutos,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get criadoEm =>
      $composableBuilder(column: $table.criadoEm, builder: (column) => column);

  GeneratedColumn<DateTime> get atualizadoEm => $composableBuilder(
    column: $table.atualizadoEm,
    builder: (column) => column,
  );

  Expression<T> receitaIngredientesRefs<T extends Object>(
    Expression<T> Function($$ReceitaIngredientesTableAnnotationComposer a) f,
  ) {
    final $$ReceitaIngredientesTableAnnotationComposer composer =
        $composerBuilder(
          composer: this,
          getCurrentColumn: (t) => t.id,
          referencedTable: $db.receitaIngredientes,
          getReferencedColumn: (t) => t.receitaId,
          builder:
              (
                joinBuilder, {
                $addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer,
              }) => $$ReceitaIngredientesTableAnnotationComposer(
                $db: $db,
                $table: $db.receitaIngredientes,
                $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
                joinBuilder: joinBuilder,
                $removeJoinBuilderFromRootComposer:
                    $removeJoinBuilderFromRootComposer,
              ),
        );
    return f(composer);
  }

  Expression<T> configuracoesPrecificacaoRefs<T extends Object>(
    Expression<T> Function($$ConfiguracoesPrecificacaoTableAnnotationComposer a)
    f,
  ) {
    final $$ConfiguracoesPrecificacaoTableAnnotationComposer composer =
        $composerBuilder(
          composer: this,
          getCurrentColumn: (t) => t.id,
          referencedTable: $db.configuracoesPrecificacao,
          getReferencedColumn: (t) => t.receitaId,
          builder:
              (
                joinBuilder, {
                $addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer,
              }) => $$ConfiguracoesPrecificacaoTableAnnotationComposer(
                $db: $db,
                $table: $db.configuracoesPrecificacao,
                $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
                joinBuilder: joinBuilder,
                $removeJoinBuilderFromRootComposer:
                    $removeJoinBuilderFromRootComposer,
              ),
        );
    return f(composer);
  }

  Expression<T> orcamentoItensRefs<T extends Object>(
    Expression<T> Function($$OrcamentoItensTableAnnotationComposer a) f,
  ) {
    final $$OrcamentoItensTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.orcamentoItens,
      getReferencedColumn: (t) => t.receitaId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$OrcamentoItensTableAnnotationComposer(
            $db: $db,
            $table: $db.orcamentoItens,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }
}

class $$ReceitasTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $ReceitasTable,
          Receita,
          $$ReceitasTableFilterComposer,
          $$ReceitasTableOrderingComposer,
          $$ReceitasTableAnnotationComposer,
          $$ReceitasTableCreateCompanionBuilder,
          $$ReceitasTableUpdateCompanionBuilder,
          (Receita, $$ReceitasTableReferences),
          Receita,
          PrefetchHooks Function({
            bool receitaIngredientesRefs,
            bool configuracoesPrecificacaoRefs,
            bool orcamentoItensRefs,
          })
        > {
  $$ReceitasTableTableManager(_$AppDatabase db, $ReceitasTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ReceitasTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ReceitasTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$ReceitasTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<String> nome = const Value.absent(),
                Value<String?> modoPreparo = const Value.absent(),
                Value<int> rendimento = const Value.absent(),
                Value<int?> tempoPreparoMinutos = const Value.absent(),
                Value<DateTime> criadoEm = const Value.absent(),
                Value<DateTime> atualizadoEm = const Value.absent(),
              }) => ReceitasCompanion(
                id: id,
                nome: nome,
                modoPreparo: modoPreparo,
                rendimento: rendimento,
                tempoPreparoMinutos: tempoPreparoMinutos,
                criadoEm: criadoEm,
                atualizadoEm: atualizadoEm,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required String nome,
                Value<String?> modoPreparo = const Value.absent(),
                Value<int> rendimento = const Value.absent(),
                Value<int?> tempoPreparoMinutos = const Value.absent(),
                Value<DateTime> criadoEm = const Value.absent(),
                Value<DateTime> atualizadoEm = const Value.absent(),
              }) => ReceitasCompanion.insert(
                id: id,
                nome: nome,
                modoPreparo: modoPreparo,
                rendimento: rendimento,
                tempoPreparoMinutos: tempoPreparoMinutos,
                criadoEm: criadoEm,
                atualizadoEm: atualizadoEm,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable(table),
                  $$ReceitasTableReferences(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback:
              ({
                receitaIngredientesRefs = false,
                configuracoesPrecificacaoRefs = false,
                orcamentoItensRefs = false,
              }) {
                return PrefetchHooks(
                  db: db,
                  explicitlyWatchedTables: [
                    if (receitaIngredientesRefs) db.receitaIngredientes,
                    if (configuracoesPrecificacaoRefs)
                      db.configuracoesPrecificacao,
                    if (orcamentoItensRefs) db.orcamentoItens,
                  ],
                  addJoins: null,
                  getPrefetchedDataCallback: (items) async {
                    return [
                      if (receitaIngredientesRefs)
                        await $_getPrefetchedData<
                          Receita,
                          $ReceitasTable,
                          ReceitaIngrediente
                        >(
                          currentTable: table,
                          referencedTable: $$ReceitasTableReferences
                              ._receitaIngredientesRefsTable(db),
                          managerFromTypedResult: (p0) =>
                              $$ReceitasTableReferences(
                                db,
                                table,
                                p0,
                              ).receitaIngredientesRefs,
                          referencedItemsForCurrentItem:
                              (item, referencedItems) => referencedItems.where(
                                (e) => e.receitaId == item.id,
                              ),
                          typedResults: items,
                        ),
                      if (configuracoesPrecificacaoRefs)
                        await $_getPrefetchedData<
                          Receita,
                          $ReceitasTable,
                          ConfiguracaoPrecificacao
                        >(
                          currentTable: table,
                          referencedTable: $$ReceitasTableReferences
                              ._configuracoesPrecificacaoRefsTable(db),
                          managerFromTypedResult: (p0) =>
                              $$ReceitasTableReferences(
                                db,
                                table,
                                p0,
                              ).configuracoesPrecificacaoRefs,
                          referencedItemsForCurrentItem:
                              (item, referencedItems) => referencedItems.where(
                                (e) => e.receitaId == item.id,
                              ),
                          typedResults: items,
                        ),
                      if (orcamentoItensRefs)
                        await $_getPrefetchedData<
                          Receita,
                          $ReceitasTable,
                          OrcamentoIten
                        >(
                          currentTable: table,
                          referencedTable: $$ReceitasTableReferences
                              ._orcamentoItensRefsTable(db),
                          managerFromTypedResult: (p0) =>
                              $$ReceitasTableReferences(
                                db,
                                table,
                                p0,
                              ).orcamentoItensRefs,
                          referencedItemsForCurrentItem:
                              (item, referencedItems) => referencedItems.where(
                                (e) => e.receitaId == item.id,
                              ),
                          typedResults: items,
                        ),
                    ];
                  },
                );
              },
        ),
      );
}

typedef $$ReceitasTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $ReceitasTable,
      Receita,
      $$ReceitasTableFilterComposer,
      $$ReceitasTableOrderingComposer,
      $$ReceitasTableAnnotationComposer,
      $$ReceitasTableCreateCompanionBuilder,
      $$ReceitasTableUpdateCompanionBuilder,
      (Receita, $$ReceitasTableReferences),
      Receita,
      PrefetchHooks Function({
        bool receitaIngredientesRefs,
        bool configuracoesPrecificacaoRefs,
        bool orcamentoItensRefs,
      })
    >;
typedef $$ReceitaIngredientesTableCreateCompanionBuilder =
    ReceitaIngredientesCompanion Function({
      Value<int> id,
      required int receitaId,
      required int ingredienteId,
      required double quantidade,
      required UnidadeMedida unidadeMedida,
    });
typedef $$ReceitaIngredientesTableUpdateCompanionBuilder =
    ReceitaIngredientesCompanion Function({
      Value<int> id,
      Value<int> receitaId,
      Value<int> ingredienteId,
      Value<double> quantidade,
      Value<UnidadeMedida> unidadeMedida,
    });

final class $$ReceitaIngredientesTableReferences
    extends
        BaseReferences<
          _$AppDatabase,
          $ReceitaIngredientesTable,
          ReceitaIngrediente
        > {
  $$ReceitaIngredientesTableReferences(
    super.$_db,
    super.$_table,
    super.$_typedResult,
  );

  static $ReceitasTable _receitaIdTable(_$AppDatabase db) =>
      db.receitas.createAlias(
        $_aliasNameGenerator(db.receitaIngredientes.receitaId, db.receitas.id),
      );

  $$ReceitasTableProcessedTableManager get receitaId {
    final $_column = $_itemColumn<int>('receita_id')!;

    final manager = $$ReceitasTableTableManager(
      $_db,
      $_db.receitas,
    ).filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_receitaIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: [item]),
    );
  }

  static $IngredientesTable _ingredienteIdTable(_$AppDatabase db) =>
      db.ingredientes.createAlias(
        $_aliasNameGenerator(
          db.receitaIngredientes.ingredienteId,
          db.ingredientes.id,
        ),
      );

  $$IngredientesTableProcessedTableManager get ingredienteId {
    final $_column = $_itemColumn<int>('ingrediente_id')!;

    final manager = $$IngredientesTableTableManager(
      $_db,
      $_db.ingredientes,
    ).filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_ingredienteIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: [item]),
    );
  }
}

class $$ReceitaIngredientesTableFilterComposer
    extends Composer<_$AppDatabase, $ReceitaIngredientesTable> {
  $$ReceitaIngredientesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get quantidade => $composableBuilder(
    column: $table.quantidade,
    builder: (column) => ColumnFilters(column),
  );

  ColumnWithTypeConverterFilters<UnidadeMedida, UnidadeMedida, String>
  get unidadeMedida => $composableBuilder(
    column: $table.unidadeMedida,
    builder: (column) => ColumnWithTypeConverterFilters(column),
  );

  $$ReceitasTableFilterComposer get receitaId {
    final $$ReceitasTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.receitaId,
      referencedTable: $db.receitas,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$ReceitasTableFilterComposer(
            $db: $db,
            $table: $db.receitas,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  $$IngredientesTableFilterComposer get ingredienteId {
    final $$IngredientesTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.ingredienteId,
      referencedTable: $db.ingredientes,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$IngredientesTableFilterComposer(
            $db: $db,
            $table: $db.ingredientes,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$ReceitaIngredientesTableOrderingComposer
    extends Composer<_$AppDatabase, $ReceitaIngredientesTable> {
  $$ReceitaIngredientesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get quantidade => $composableBuilder(
    column: $table.quantidade,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get unidadeMedida => $composableBuilder(
    column: $table.unidadeMedida,
    builder: (column) => ColumnOrderings(column),
  );

  $$ReceitasTableOrderingComposer get receitaId {
    final $$ReceitasTableOrderingComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.receitaId,
      referencedTable: $db.receitas,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$ReceitasTableOrderingComposer(
            $db: $db,
            $table: $db.receitas,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  $$IngredientesTableOrderingComposer get ingredienteId {
    final $$IngredientesTableOrderingComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.ingredienteId,
      referencedTable: $db.ingredientes,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$IngredientesTableOrderingComposer(
            $db: $db,
            $table: $db.ingredientes,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$ReceitaIngredientesTableAnnotationComposer
    extends Composer<_$AppDatabase, $ReceitaIngredientesTable> {
  $$ReceitaIngredientesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<double> get quantidade => $composableBuilder(
    column: $table.quantidade,
    builder: (column) => column,
  );

  GeneratedColumnWithTypeConverter<UnidadeMedida, String> get unidadeMedida =>
      $composableBuilder(
        column: $table.unidadeMedida,
        builder: (column) => column,
      );

  $$ReceitasTableAnnotationComposer get receitaId {
    final $$ReceitasTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.receitaId,
      referencedTable: $db.receitas,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$ReceitasTableAnnotationComposer(
            $db: $db,
            $table: $db.receitas,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  $$IngredientesTableAnnotationComposer get ingredienteId {
    final $$IngredientesTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.ingredienteId,
      referencedTable: $db.ingredientes,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$IngredientesTableAnnotationComposer(
            $db: $db,
            $table: $db.ingredientes,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$ReceitaIngredientesTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $ReceitaIngredientesTable,
          ReceitaIngrediente,
          $$ReceitaIngredientesTableFilterComposer,
          $$ReceitaIngredientesTableOrderingComposer,
          $$ReceitaIngredientesTableAnnotationComposer,
          $$ReceitaIngredientesTableCreateCompanionBuilder,
          $$ReceitaIngredientesTableUpdateCompanionBuilder,
          (ReceitaIngrediente, $$ReceitaIngredientesTableReferences),
          ReceitaIngrediente,
          PrefetchHooks Function({bool receitaId, bool ingredienteId})
        > {
  $$ReceitaIngredientesTableTableManager(
    _$AppDatabase db,
    $ReceitaIngredientesTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ReceitaIngredientesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ReceitaIngredientesTableOrderingComposer(
                $db: db,
                $table: table,
              ),
          createComputedFieldComposer: () =>
              $$ReceitaIngredientesTableAnnotationComposer(
                $db: db,
                $table: table,
              ),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<int> receitaId = const Value.absent(),
                Value<int> ingredienteId = const Value.absent(),
                Value<double> quantidade = const Value.absent(),
                Value<UnidadeMedida> unidadeMedida = const Value.absent(),
              }) => ReceitaIngredientesCompanion(
                id: id,
                receitaId: receitaId,
                ingredienteId: ingredienteId,
                quantidade: quantidade,
                unidadeMedida: unidadeMedida,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required int receitaId,
                required int ingredienteId,
                required double quantidade,
                required UnidadeMedida unidadeMedida,
              }) => ReceitaIngredientesCompanion.insert(
                id: id,
                receitaId: receitaId,
                ingredienteId: ingredienteId,
                quantidade: quantidade,
                unidadeMedida: unidadeMedida,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable(table),
                  $$ReceitaIngredientesTableReferences(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: ({receitaId = false, ingredienteId = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [],
              addJoins:
                  <
                    T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic
                    >
                  >(state) {
                    if (receitaId) {
                      state =
                          state.withJoin(
                                currentTable: table,
                                currentColumn: table.receitaId,
                                referencedTable:
                                    $$ReceitaIngredientesTableReferences
                                        ._receitaIdTable(db),
                                referencedColumn:
                                    $$ReceitaIngredientesTableReferences
                                        ._receitaIdTable(db)
                                        .id,
                              )
                              as T;
                    }
                    if (ingredienteId) {
                      state =
                          state.withJoin(
                                currentTable: table,
                                currentColumn: table.ingredienteId,
                                referencedTable:
                                    $$ReceitaIngredientesTableReferences
                                        ._ingredienteIdTable(db),
                                referencedColumn:
                                    $$ReceitaIngredientesTableReferences
                                        ._ingredienteIdTable(db)
                                        .id,
                              )
                              as T;
                    }

                    return state;
                  },
              getPrefetchedDataCallback: (items) async {
                return [];
              },
            );
          },
        ),
      );
}

typedef $$ReceitaIngredientesTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $ReceitaIngredientesTable,
      ReceitaIngrediente,
      $$ReceitaIngredientesTableFilterComposer,
      $$ReceitaIngredientesTableOrderingComposer,
      $$ReceitaIngredientesTableAnnotationComposer,
      $$ReceitaIngredientesTableCreateCompanionBuilder,
      $$ReceitaIngredientesTableUpdateCompanionBuilder,
      (ReceitaIngrediente, $$ReceitaIngredientesTableReferences),
      ReceitaIngrediente,
      PrefetchHooks Function({bool receitaId, bool ingredienteId})
    >;
typedef $$ConfiguracoesPrecificacaoTableCreateCompanionBuilder =
    ConfiguracoesPrecificacaoCompanion Function({
      Value<int> id,
      required int receitaId,
      Value<double> horasTrabalho,
      Value<double> valorHora,
      Value<double> custosFixosPercentual,
      Value<double> margemLucroPercentual,
    });
typedef $$ConfiguracoesPrecificacaoTableUpdateCompanionBuilder =
    ConfiguracoesPrecificacaoCompanion Function({
      Value<int> id,
      Value<int> receitaId,
      Value<double> horasTrabalho,
      Value<double> valorHora,
      Value<double> custosFixosPercentual,
      Value<double> margemLucroPercentual,
    });

final class $$ConfiguracoesPrecificacaoTableReferences
    extends
        BaseReferences<
          _$AppDatabase,
          $ConfiguracoesPrecificacaoTable,
          ConfiguracaoPrecificacao
        > {
  $$ConfiguracoesPrecificacaoTableReferences(
    super.$_db,
    super.$_table,
    super.$_typedResult,
  );

  static $ReceitasTable _receitaIdTable(_$AppDatabase db) =>
      db.receitas.createAlias(
        $_aliasNameGenerator(
          db.configuracoesPrecificacao.receitaId,
          db.receitas.id,
        ),
      );

  $$ReceitasTableProcessedTableManager get receitaId {
    final $_column = $_itemColumn<int>('receita_id')!;

    final manager = $$ReceitasTableTableManager(
      $_db,
      $_db.receitas,
    ).filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_receitaIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: [item]),
    );
  }
}

class $$ConfiguracoesPrecificacaoTableFilterComposer
    extends Composer<_$AppDatabase, $ConfiguracoesPrecificacaoTable> {
  $$ConfiguracoesPrecificacaoTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get horasTrabalho => $composableBuilder(
    column: $table.horasTrabalho,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get valorHora => $composableBuilder(
    column: $table.valorHora,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get custosFixosPercentual => $composableBuilder(
    column: $table.custosFixosPercentual,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get margemLucroPercentual => $composableBuilder(
    column: $table.margemLucroPercentual,
    builder: (column) => ColumnFilters(column),
  );

  $$ReceitasTableFilterComposer get receitaId {
    final $$ReceitasTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.receitaId,
      referencedTable: $db.receitas,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$ReceitasTableFilterComposer(
            $db: $db,
            $table: $db.receitas,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$ConfiguracoesPrecificacaoTableOrderingComposer
    extends Composer<_$AppDatabase, $ConfiguracoesPrecificacaoTable> {
  $$ConfiguracoesPrecificacaoTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get horasTrabalho => $composableBuilder(
    column: $table.horasTrabalho,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get valorHora => $composableBuilder(
    column: $table.valorHora,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get custosFixosPercentual => $composableBuilder(
    column: $table.custosFixosPercentual,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get margemLucroPercentual => $composableBuilder(
    column: $table.margemLucroPercentual,
    builder: (column) => ColumnOrderings(column),
  );

  $$ReceitasTableOrderingComposer get receitaId {
    final $$ReceitasTableOrderingComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.receitaId,
      referencedTable: $db.receitas,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$ReceitasTableOrderingComposer(
            $db: $db,
            $table: $db.receitas,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$ConfiguracoesPrecificacaoTableAnnotationComposer
    extends Composer<_$AppDatabase, $ConfiguracoesPrecificacaoTable> {
  $$ConfiguracoesPrecificacaoTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<double> get horasTrabalho => $composableBuilder(
    column: $table.horasTrabalho,
    builder: (column) => column,
  );

  GeneratedColumn<double> get valorHora =>
      $composableBuilder(column: $table.valorHora, builder: (column) => column);

  GeneratedColumn<double> get custosFixosPercentual => $composableBuilder(
    column: $table.custosFixosPercentual,
    builder: (column) => column,
  );

  GeneratedColumn<double> get margemLucroPercentual => $composableBuilder(
    column: $table.margemLucroPercentual,
    builder: (column) => column,
  );

  $$ReceitasTableAnnotationComposer get receitaId {
    final $$ReceitasTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.receitaId,
      referencedTable: $db.receitas,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$ReceitasTableAnnotationComposer(
            $db: $db,
            $table: $db.receitas,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$ConfiguracoesPrecificacaoTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $ConfiguracoesPrecificacaoTable,
          ConfiguracaoPrecificacao,
          $$ConfiguracoesPrecificacaoTableFilterComposer,
          $$ConfiguracoesPrecificacaoTableOrderingComposer,
          $$ConfiguracoesPrecificacaoTableAnnotationComposer,
          $$ConfiguracoesPrecificacaoTableCreateCompanionBuilder,
          $$ConfiguracoesPrecificacaoTableUpdateCompanionBuilder,
          (
            ConfiguracaoPrecificacao,
            $$ConfiguracoesPrecificacaoTableReferences,
          ),
          ConfiguracaoPrecificacao,
          PrefetchHooks Function({bool receitaId})
        > {
  $$ConfiguracoesPrecificacaoTableTableManager(
    _$AppDatabase db,
    $ConfiguracoesPrecificacaoTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ConfiguracoesPrecificacaoTableFilterComposer(
                $db: db,
                $table: table,
              ),
          createOrderingComposer: () =>
              $$ConfiguracoesPrecificacaoTableOrderingComposer(
                $db: db,
                $table: table,
              ),
          createComputedFieldComposer: () =>
              $$ConfiguracoesPrecificacaoTableAnnotationComposer(
                $db: db,
                $table: table,
              ),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<int> receitaId = const Value.absent(),
                Value<double> horasTrabalho = const Value.absent(),
                Value<double> valorHora = const Value.absent(),
                Value<double> custosFixosPercentual = const Value.absent(),
                Value<double> margemLucroPercentual = const Value.absent(),
              }) => ConfiguracoesPrecificacaoCompanion(
                id: id,
                receitaId: receitaId,
                horasTrabalho: horasTrabalho,
                valorHora: valorHora,
                custosFixosPercentual: custosFixosPercentual,
                margemLucroPercentual: margemLucroPercentual,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required int receitaId,
                Value<double> horasTrabalho = const Value.absent(),
                Value<double> valorHora = const Value.absent(),
                Value<double> custosFixosPercentual = const Value.absent(),
                Value<double> margemLucroPercentual = const Value.absent(),
              }) => ConfiguracoesPrecificacaoCompanion.insert(
                id: id,
                receitaId: receitaId,
                horasTrabalho: horasTrabalho,
                valorHora: valorHora,
                custosFixosPercentual: custosFixosPercentual,
                margemLucroPercentual: margemLucroPercentual,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable(table),
                  $$ConfiguracoesPrecificacaoTableReferences(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: ({receitaId = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [],
              addJoins:
                  <
                    T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic
                    >
                  >(state) {
                    if (receitaId) {
                      state =
                          state.withJoin(
                                currentTable: table,
                                currentColumn: table.receitaId,
                                referencedTable:
                                    $$ConfiguracoesPrecificacaoTableReferences
                                        ._receitaIdTable(db),
                                referencedColumn:
                                    $$ConfiguracoesPrecificacaoTableReferences
                                        ._receitaIdTable(db)
                                        .id,
                              )
                              as T;
                    }

                    return state;
                  },
              getPrefetchedDataCallback: (items) async {
                return [];
              },
            );
          },
        ),
      );
}

typedef $$ConfiguracoesPrecificacaoTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $ConfiguracoesPrecificacaoTable,
      ConfiguracaoPrecificacao,
      $$ConfiguracoesPrecificacaoTableFilterComposer,
      $$ConfiguracoesPrecificacaoTableOrderingComposer,
      $$ConfiguracoesPrecificacaoTableAnnotationComposer,
      $$ConfiguracoesPrecificacaoTableCreateCompanionBuilder,
      $$ConfiguracoesPrecificacaoTableUpdateCompanionBuilder,
      (ConfiguracaoPrecificacao, $$ConfiguracoesPrecificacaoTableReferences),
      ConfiguracaoPrecificacao,
      PrefetchHooks Function({bool receitaId})
    >;
typedef $$ConfiguracoesGeraisTableCreateCompanionBuilder =
    ConfiguracoesGeraisCompanion Function({
      Value<int> id,
      Value<double?> valorHoraPadrao,
    });
typedef $$ConfiguracoesGeraisTableUpdateCompanionBuilder =
    ConfiguracoesGeraisCompanion Function({
      Value<int> id,
      Value<double?> valorHoraPadrao,
    });

class $$ConfiguracoesGeraisTableFilterComposer
    extends Composer<_$AppDatabase, $ConfiguracoesGeraisTable> {
  $$ConfiguracoesGeraisTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get valorHoraPadrao => $composableBuilder(
    column: $table.valorHoraPadrao,
    builder: (column) => ColumnFilters(column),
  );
}

class $$ConfiguracoesGeraisTableOrderingComposer
    extends Composer<_$AppDatabase, $ConfiguracoesGeraisTable> {
  $$ConfiguracoesGeraisTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get valorHoraPadrao => $composableBuilder(
    column: $table.valorHoraPadrao,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$ConfiguracoesGeraisTableAnnotationComposer
    extends Composer<_$AppDatabase, $ConfiguracoesGeraisTable> {
  $$ConfiguracoesGeraisTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<double> get valorHoraPadrao => $composableBuilder(
    column: $table.valorHoraPadrao,
    builder: (column) => column,
  );
}

class $$ConfiguracoesGeraisTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $ConfiguracoesGeraisTable,
          ConfiguracaoGeral,
          $$ConfiguracoesGeraisTableFilterComposer,
          $$ConfiguracoesGeraisTableOrderingComposer,
          $$ConfiguracoesGeraisTableAnnotationComposer,
          $$ConfiguracoesGeraisTableCreateCompanionBuilder,
          $$ConfiguracoesGeraisTableUpdateCompanionBuilder,
          (
            ConfiguracaoGeral,
            BaseReferences<
              _$AppDatabase,
              $ConfiguracoesGeraisTable,
              ConfiguracaoGeral
            >,
          ),
          ConfiguracaoGeral,
          PrefetchHooks Function()
        > {
  $$ConfiguracoesGeraisTableTableManager(
    _$AppDatabase db,
    $ConfiguracoesGeraisTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ConfiguracoesGeraisTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ConfiguracoesGeraisTableOrderingComposer(
                $db: db,
                $table: table,
              ),
          createComputedFieldComposer: () =>
              $$ConfiguracoesGeraisTableAnnotationComposer(
                $db: db,
                $table: table,
              ),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<double?> valorHoraPadrao = const Value.absent(),
              }) => ConfiguracoesGeraisCompanion(
                id: id,
                valorHoraPadrao: valorHoraPadrao,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<double?> valorHoraPadrao = const Value.absent(),
              }) => ConfiguracoesGeraisCompanion.insert(
                id: id,
                valorHoraPadrao: valorHoraPadrao,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$ConfiguracoesGeraisTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $ConfiguracoesGeraisTable,
      ConfiguracaoGeral,
      $$ConfiguracoesGeraisTableFilterComposer,
      $$ConfiguracoesGeraisTableOrderingComposer,
      $$ConfiguracoesGeraisTableAnnotationComposer,
      $$ConfiguracoesGeraisTableCreateCompanionBuilder,
      $$ConfiguracoesGeraisTableUpdateCompanionBuilder,
      (
        ConfiguracaoGeral,
        BaseReferences<
          _$AppDatabase,
          $ConfiguracoesGeraisTable,
          ConfiguracaoGeral
        >,
      ),
      ConfiguracaoGeral,
      PrefetchHooks Function()
    >;
typedef $$ClientesTableCreateCompanionBuilder =
    ClientesCompanion Function({
      Value<int> id,
      required String nome,
      Value<String?> telefone,
      Value<String?> email,
      Value<String?> endereco,
    });
typedef $$ClientesTableUpdateCompanionBuilder =
    ClientesCompanion Function({
      Value<int> id,
      Value<String> nome,
      Value<String?> telefone,
      Value<String?> email,
      Value<String?> endereco,
    });

final class $$ClientesTableReferences
    extends BaseReferences<_$AppDatabase, $ClientesTable, Cliente> {
  $$ClientesTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static MultiTypedResultKey<$OrcamentosTable, List<Orcamento>>
  _orcamentosRefsTable(_$AppDatabase db) => MultiTypedResultKey.fromTable(
    db.orcamentos,
    aliasName: $_aliasNameGenerator(db.clientes.id, db.orcamentos.clienteId),
  );

  $$OrcamentosTableProcessedTableManager get orcamentosRefs {
    final manager = $$OrcamentosTableTableManager(
      $_db,
      $_db.orcamentos,
    ).filter((f) => f.clienteId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_orcamentosRefsTable($_db));
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: cache),
    );
  }
}

class $$ClientesTableFilterComposer
    extends Composer<_$AppDatabase, $ClientesTable> {
  $$ClientesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get nome => $composableBuilder(
    column: $table.nome,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get telefone => $composableBuilder(
    column: $table.telefone,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get email => $composableBuilder(
    column: $table.email,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get endereco => $composableBuilder(
    column: $table.endereco,
    builder: (column) => ColumnFilters(column),
  );

  Expression<bool> orcamentosRefs(
    Expression<bool> Function($$OrcamentosTableFilterComposer f) f,
  ) {
    final $$OrcamentosTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.orcamentos,
      getReferencedColumn: (t) => t.clienteId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$OrcamentosTableFilterComposer(
            $db: $db,
            $table: $db.orcamentos,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }
}

class $$ClientesTableOrderingComposer
    extends Composer<_$AppDatabase, $ClientesTable> {
  $$ClientesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get nome => $composableBuilder(
    column: $table.nome,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get telefone => $composableBuilder(
    column: $table.telefone,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get email => $composableBuilder(
    column: $table.email,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get endereco => $composableBuilder(
    column: $table.endereco,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$ClientesTableAnnotationComposer
    extends Composer<_$AppDatabase, $ClientesTable> {
  $$ClientesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get nome =>
      $composableBuilder(column: $table.nome, builder: (column) => column);

  GeneratedColumn<String> get telefone =>
      $composableBuilder(column: $table.telefone, builder: (column) => column);

  GeneratedColumn<String> get email =>
      $composableBuilder(column: $table.email, builder: (column) => column);

  GeneratedColumn<String> get endereco =>
      $composableBuilder(column: $table.endereco, builder: (column) => column);

  Expression<T> orcamentosRefs<T extends Object>(
    Expression<T> Function($$OrcamentosTableAnnotationComposer a) f,
  ) {
    final $$OrcamentosTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.orcamentos,
      getReferencedColumn: (t) => t.clienteId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$OrcamentosTableAnnotationComposer(
            $db: $db,
            $table: $db.orcamentos,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }
}

class $$ClientesTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $ClientesTable,
          Cliente,
          $$ClientesTableFilterComposer,
          $$ClientesTableOrderingComposer,
          $$ClientesTableAnnotationComposer,
          $$ClientesTableCreateCompanionBuilder,
          $$ClientesTableUpdateCompanionBuilder,
          (Cliente, $$ClientesTableReferences),
          Cliente,
          PrefetchHooks Function({bool orcamentosRefs})
        > {
  $$ClientesTableTableManager(_$AppDatabase db, $ClientesTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ClientesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ClientesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$ClientesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<String> nome = const Value.absent(),
                Value<String?> telefone = const Value.absent(),
                Value<String?> email = const Value.absent(),
                Value<String?> endereco = const Value.absent(),
              }) => ClientesCompanion(
                id: id,
                nome: nome,
                telefone: telefone,
                email: email,
                endereco: endereco,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required String nome,
                Value<String?> telefone = const Value.absent(),
                Value<String?> email = const Value.absent(),
                Value<String?> endereco = const Value.absent(),
              }) => ClientesCompanion.insert(
                id: id,
                nome: nome,
                telefone: telefone,
                email: email,
                endereco: endereco,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable(table),
                  $$ClientesTableReferences(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: ({orcamentosRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [if (orcamentosRefs) db.orcamentos],
              addJoins: null,
              getPrefetchedDataCallback: (items) async {
                return [
                  if (orcamentosRefs)
                    await $_getPrefetchedData<
                      Cliente,
                      $ClientesTable,
                      Orcamento
                    >(
                      currentTable: table,
                      referencedTable: $$ClientesTableReferences
                          ._orcamentosRefsTable(db),
                      managerFromTypedResult: (p0) => $$ClientesTableReferences(
                        db,
                        table,
                        p0,
                      ).orcamentosRefs,
                      referencedItemsForCurrentItem: (item, referencedItems) =>
                          referencedItems.where((e) => e.clienteId == item.id),
                      typedResults: items,
                    ),
                ];
              },
            );
          },
        ),
      );
}

typedef $$ClientesTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $ClientesTable,
      Cliente,
      $$ClientesTableFilterComposer,
      $$ClientesTableOrderingComposer,
      $$ClientesTableAnnotationComposer,
      $$ClientesTableCreateCompanionBuilder,
      $$ClientesTableUpdateCompanionBuilder,
      (Cliente, $$ClientesTableReferences),
      Cliente,
      PrefetchHooks Function({bool orcamentosRefs})
    >;
typedef $$OrcamentosTableCreateCompanionBuilder =
    OrcamentosCompanion Function({
      Value<int> id,
      required int clienteId,
      Value<DateTime> criadoEm,
      Value<int> validadeDias,
      Value<String?> observacoes,
    });
typedef $$OrcamentosTableUpdateCompanionBuilder =
    OrcamentosCompanion Function({
      Value<int> id,
      Value<int> clienteId,
      Value<DateTime> criadoEm,
      Value<int> validadeDias,
      Value<String?> observacoes,
    });

final class $$OrcamentosTableReferences
    extends BaseReferences<_$AppDatabase, $OrcamentosTable, Orcamento> {
  $$OrcamentosTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $ClientesTable _clienteIdTable(_$AppDatabase db) =>
      db.clientes.createAlias(
        $_aliasNameGenerator(db.orcamentos.clienteId, db.clientes.id),
      );

  $$ClientesTableProcessedTableManager get clienteId {
    final $_column = $_itemColumn<int>('cliente_id')!;

    final manager = $$ClientesTableTableManager(
      $_db,
      $_db.clientes,
    ).filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_clienteIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: [item]),
    );
  }

  static MultiTypedResultKey<$OrcamentoItensTable, List<OrcamentoIten>>
  _orcamentoItensRefsTable(_$AppDatabase db) => MultiTypedResultKey.fromTable(
    db.orcamentoItens,
    aliasName: $_aliasNameGenerator(
      db.orcamentos.id,
      db.orcamentoItens.orcamentoId,
    ),
  );

  $$OrcamentoItensTableProcessedTableManager get orcamentoItensRefs {
    final manager = $$OrcamentoItensTableTableManager(
      $_db,
      $_db.orcamentoItens,
    ).filter((f) => f.orcamentoId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_orcamentoItensRefsTable($_db));
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: cache),
    );
  }
}

class $$OrcamentosTableFilterComposer
    extends Composer<_$AppDatabase, $OrcamentosTable> {
  $$OrcamentosTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get criadoEm => $composableBuilder(
    column: $table.criadoEm,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get validadeDias => $composableBuilder(
    column: $table.validadeDias,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get observacoes => $composableBuilder(
    column: $table.observacoes,
    builder: (column) => ColumnFilters(column),
  );

  $$ClientesTableFilterComposer get clienteId {
    final $$ClientesTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.clienteId,
      referencedTable: $db.clientes,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$ClientesTableFilterComposer(
            $db: $db,
            $table: $db.clientes,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  Expression<bool> orcamentoItensRefs(
    Expression<bool> Function($$OrcamentoItensTableFilterComposer f) f,
  ) {
    final $$OrcamentoItensTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.orcamentoItens,
      getReferencedColumn: (t) => t.orcamentoId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$OrcamentoItensTableFilterComposer(
            $db: $db,
            $table: $db.orcamentoItens,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }
}

class $$OrcamentosTableOrderingComposer
    extends Composer<_$AppDatabase, $OrcamentosTable> {
  $$OrcamentosTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get criadoEm => $composableBuilder(
    column: $table.criadoEm,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get validadeDias => $composableBuilder(
    column: $table.validadeDias,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get observacoes => $composableBuilder(
    column: $table.observacoes,
    builder: (column) => ColumnOrderings(column),
  );

  $$ClientesTableOrderingComposer get clienteId {
    final $$ClientesTableOrderingComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.clienteId,
      referencedTable: $db.clientes,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$ClientesTableOrderingComposer(
            $db: $db,
            $table: $db.clientes,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$OrcamentosTableAnnotationComposer
    extends Composer<_$AppDatabase, $OrcamentosTable> {
  $$OrcamentosTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<DateTime> get criadoEm =>
      $composableBuilder(column: $table.criadoEm, builder: (column) => column);

  GeneratedColumn<int> get validadeDias => $composableBuilder(
    column: $table.validadeDias,
    builder: (column) => column,
  );

  GeneratedColumn<String> get observacoes => $composableBuilder(
    column: $table.observacoes,
    builder: (column) => column,
  );

  $$ClientesTableAnnotationComposer get clienteId {
    final $$ClientesTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.clienteId,
      referencedTable: $db.clientes,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$ClientesTableAnnotationComposer(
            $db: $db,
            $table: $db.clientes,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  Expression<T> orcamentoItensRefs<T extends Object>(
    Expression<T> Function($$OrcamentoItensTableAnnotationComposer a) f,
  ) {
    final $$OrcamentoItensTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.orcamentoItens,
      getReferencedColumn: (t) => t.orcamentoId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$OrcamentoItensTableAnnotationComposer(
            $db: $db,
            $table: $db.orcamentoItens,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }
}

class $$OrcamentosTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $OrcamentosTable,
          Orcamento,
          $$OrcamentosTableFilterComposer,
          $$OrcamentosTableOrderingComposer,
          $$OrcamentosTableAnnotationComposer,
          $$OrcamentosTableCreateCompanionBuilder,
          $$OrcamentosTableUpdateCompanionBuilder,
          (Orcamento, $$OrcamentosTableReferences),
          Orcamento,
          PrefetchHooks Function({bool clienteId, bool orcamentoItensRefs})
        > {
  $$OrcamentosTableTableManager(_$AppDatabase db, $OrcamentosTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$OrcamentosTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$OrcamentosTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$OrcamentosTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<int> clienteId = const Value.absent(),
                Value<DateTime> criadoEm = const Value.absent(),
                Value<int> validadeDias = const Value.absent(),
                Value<String?> observacoes = const Value.absent(),
              }) => OrcamentosCompanion(
                id: id,
                clienteId: clienteId,
                criadoEm: criadoEm,
                validadeDias: validadeDias,
                observacoes: observacoes,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required int clienteId,
                Value<DateTime> criadoEm = const Value.absent(),
                Value<int> validadeDias = const Value.absent(),
                Value<String?> observacoes = const Value.absent(),
              }) => OrcamentosCompanion.insert(
                id: id,
                clienteId: clienteId,
                criadoEm: criadoEm,
                validadeDias: validadeDias,
                observacoes: observacoes,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable(table),
                  $$OrcamentosTableReferences(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback:
              ({clienteId = false, orcamentoItensRefs = false}) {
                return PrefetchHooks(
                  db: db,
                  explicitlyWatchedTables: [
                    if (orcamentoItensRefs) db.orcamentoItens,
                  ],
                  addJoins:
                      <
                        T extends TableManagerState<
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic
                        >
                      >(state) {
                        if (clienteId) {
                          state =
                              state.withJoin(
                                    currentTable: table,
                                    currentColumn: table.clienteId,
                                    referencedTable: $$OrcamentosTableReferences
                                        ._clienteIdTable(db),
                                    referencedColumn:
                                        $$OrcamentosTableReferences
                                            ._clienteIdTable(db)
                                            .id,
                                  )
                                  as T;
                        }

                        return state;
                      },
                  getPrefetchedDataCallback: (items) async {
                    return [
                      if (orcamentoItensRefs)
                        await $_getPrefetchedData<
                          Orcamento,
                          $OrcamentosTable,
                          OrcamentoIten
                        >(
                          currentTable: table,
                          referencedTable: $$OrcamentosTableReferences
                              ._orcamentoItensRefsTable(db),
                          managerFromTypedResult: (p0) =>
                              $$OrcamentosTableReferences(
                                db,
                                table,
                                p0,
                              ).orcamentoItensRefs,
                          referencedItemsForCurrentItem:
                              (item, referencedItems) => referencedItems.where(
                                (e) => e.orcamentoId == item.id,
                              ),
                          typedResults: items,
                        ),
                    ];
                  },
                );
              },
        ),
      );
}

typedef $$OrcamentosTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $OrcamentosTable,
      Orcamento,
      $$OrcamentosTableFilterComposer,
      $$OrcamentosTableOrderingComposer,
      $$OrcamentosTableAnnotationComposer,
      $$OrcamentosTableCreateCompanionBuilder,
      $$OrcamentosTableUpdateCompanionBuilder,
      (Orcamento, $$OrcamentosTableReferences),
      Orcamento,
      PrefetchHooks Function({bool clienteId, bool orcamentoItensRefs})
    >;
typedef $$OrcamentoItensTableCreateCompanionBuilder =
    OrcamentoItensCompanion Function({
      Value<int> id,
      required int orcamentoId,
      Value<int?> receitaId,
      required String descricao,
      Value<double> quantidade,
      required double precoUnitario,
    });
typedef $$OrcamentoItensTableUpdateCompanionBuilder =
    OrcamentoItensCompanion Function({
      Value<int> id,
      Value<int> orcamentoId,
      Value<int?> receitaId,
      Value<String> descricao,
      Value<double> quantidade,
      Value<double> precoUnitario,
    });

final class $$OrcamentoItensTableReferences
    extends BaseReferences<_$AppDatabase, $OrcamentoItensTable, OrcamentoIten> {
  $$OrcamentoItensTableReferences(
    super.$_db,
    super.$_table,
    super.$_typedResult,
  );

  static $OrcamentosTable _orcamentoIdTable(_$AppDatabase db) =>
      db.orcamentos.createAlias(
        $_aliasNameGenerator(db.orcamentoItens.orcamentoId, db.orcamentos.id),
      );

  $$OrcamentosTableProcessedTableManager get orcamentoId {
    final $_column = $_itemColumn<int>('orcamento_id')!;

    final manager = $$OrcamentosTableTableManager(
      $_db,
      $_db.orcamentos,
    ).filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_orcamentoIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: [item]),
    );
  }

  static $ReceitasTable _receitaIdTable(_$AppDatabase db) =>
      db.receitas.createAlias(
        $_aliasNameGenerator(db.orcamentoItens.receitaId, db.receitas.id),
      );

  $$ReceitasTableProcessedTableManager? get receitaId {
    final $_column = $_itemColumn<int>('receita_id');
    if ($_column == null) return null;
    final manager = $$ReceitasTableTableManager(
      $_db,
      $_db.receitas,
    ).filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_receitaIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: [item]),
    );
  }
}

class $$OrcamentoItensTableFilterComposer
    extends Composer<_$AppDatabase, $OrcamentoItensTable> {
  $$OrcamentoItensTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get descricao => $composableBuilder(
    column: $table.descricao,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get quantidade => $composableBuilder(
    column: $table.quantidade,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get precoUnitario => $composableBuilder(
    column: $table.precoUnitario,
    builder: (column) => ColumnFilters(column),
  );

  $$OrcamentosTableFilterComposer get orcamentoId {
    final $$OrcamentosTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.orcamentoId,
      referencedTable: $db.orcamentos,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$OrcamentosTableFilterComposer(
            $db: $db,
            $table: $db.orcamentos,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  $$ReceitasTableFilterComposer get receitaId {
    final $$ReceitasTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.receitaId,
      referencedTable: $db.receitas,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$ReceitasTableFilterComposer(
            $db: $db,
            $table: $db.receitas,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$OrcamentoItensTableOrderingComposer
    extends Composer<_$AppDatabase, $OrcamentoItensTable> {
  $$OrcamentoItensTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get descricao => $composableBuilder(
    column: $table.descricao,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get quantidade => $composableBuilder(
    column: $table.quantidade,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get precoUnitario => $composableBuilder(
    column: $table.precoUnitario,
    builder: (column) => ColumnOrderings(column),
  );

  $$OrcamentosTableOrderingComposer get orcamentoId {
    final $$OrcamentosTableOrderingComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.orcamentoId,
      referencedTable: $db.orcamentos,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$OrcamentosTableOrderingComposer(
            $db: $db,
            $table: $db.orcamentos,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  $$ReceitasTableOrderingComposer get receitaId {
    final $$ReceitasTableOrderingComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.receitaId,
      referencedTable: $db.receitas,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$ReceitasTableOrderingComposer(
            $db: $db,
            $table: $db.receitas,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$OrcamentoItensTableAnnotationComposer
    extends Composer<_$AppDatabase, $OrcamentoItensTable> {
  $$OrcamentoItensTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get descricao =>
      $composableBuilder(column: $table.descricao, builder: (column) => column);

  GeneratedColumn<double> get quantidade => $composableBuilder(
    column: $table.quantidade,
    builder: (column) => column,
  );

  GeneratedColumn<double> get precoUnitario => $composableBuilder(
    column: $table.precoUnitario,
    builder: (column) => column,
  );

  $$OrcamentosTableAnnotationComposer get orcamentoId {
    final $$OrcamentosTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.orcamentoId,
      referencedTable: $db.orcamentos,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$OrcamentosTableAnnotationComposer(
            $db: $db,
            $table: $db.orcamentos,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  $$ReceitasTableAnnotationComposer get receitaId {
    final $$ReceitasTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.receitaId,
      referencedTable: $db.receitas,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$ReceitasTableAnnotationComposer(
            $db: $db,
            $table: $db.receitas,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$OrcamentoItensTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $OrcamentoItensTable,
          OrcamentoIten,
          $$OrcamentoItensTableFilterComposer,
          $$OrcamentoItensTableOrderingComposer,
          $$OrcamentoItensTableAnnotationComposer,
          $$OrcamentoItensTableCreateCompanionBuilder,
          $$OrcamentoItensTableUpdateCompanionBuilder,
          (OrcamentoIten, $$OrcamentoItensTableReferences),
          OrcamentoIten,
          PrefetchHooks Function({bool orcamentoId, bool receitaId})
        > {
  $$OrcamentoItensTableTableManager(
    _$AppDatabase db,
    $OrcamentoItensTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$OrcamentoItensTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$OrcamentoItensTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$OrcamentoItensTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<int> orcamentoId = const Value.absent(),
                Value<int?> receitaId = const Value.absent(),
                Value<String> descricao = const Value.absent(),
                Value<double> quantidade = const Value.absent(),
                Value<double> precoUnitario = const Value.absent(),
              }) => OrcamentoItensCompanion(
                id: id,
                orcamentoId: orcamentoId,
                receitaId: receitaId,
                descricao: descricao,
                quantidade: quantidade,
                precoUnitario: precoUnitario,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required int orcamentoId,
                Value<int?> receitaId = const Value.absent(),
                required String descricao,
                Value<double> quantidade = const Value.absent(),
                required double precoUnitario,
              }) => OrcamentoItensCompanion.insert(
                id: id,
                orcamentoId: orcamentoId,
                receitaId: receitaId,
                descricao: descricao,
                quantidade: quantidade,
                precoUnitario: precoUnitario,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable(table),
                  $$OrcamentoItensTableReferences(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: ({orcamentoId = false, receitaId = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [],
              addJoins:
                  <
                    T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic
                    >
                  >(state) {
                    if (orcamentoId) {
                      state =
                          state.withJoin(
                                currentTable: table,
                                currentColumn: table.orcamentoId,
                                referencedTable: $$OrcamentoItensTableReferences
                                    ._orcamentoIdTable(db),
                                referencedColumn:
                                    $$OrcamentoItensTableReferences
                                        ._orcamentoIdTable(db)
                                        .id,
                              )
                              as T;
                    }
                    if (receitaId) {
                      state =
                          state.withJoin(
                                currentTable: table,
                                currentColumn: table.receitaId,
                                referencedTable: $$OrcamentoItensTableReferences
                                    ._receitaIdTable(db),
                                referencedColumn:
                                    $$OrcamentoItensTableReferences
                                        ._receitaIdTable(db)
                                        .id,
                              )
                              as T;
                    }

                    return state;
                  },
              getPrefetchedDataCallback: (items) async {
                return [];
              },
            );
          },
        ),
      );
}

typedef $$OrcamentoItensTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $OrcamentoItensTable,
      OrcamentoIten,
      $$OrcamentoItensTableFilterComposer,
      $$OrcamentoItensTableOrderingComposer,
      $$OrcamentoItensTableAnnotationComposer,
      $$OrcamentoItensTableCreateCompanionBuilder,
      $$OrcamentoItensTableUpdateCompanionBuilder,
      (OrcamentoIten, $$OrcamentoItensTableReferences),
      OrcamentoIten,
      PrefetchHooks Function({bool orcamentoId, bool receitaId})
    >;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$IngredientesTableTableManager get ingredientes =>
      $$IngredientesTableTableManager(_db, _db.ingredientes);
  $$ReceitasTableTableManager get receitas =>
      $$ReceitasTableTableManager(_db, _db.receitas);
  $$ReceitaIngredientesTableTableManager get receitaIngredientes =>
      $$ReceitaIngredientesTableTableManager(_db, _db.receitaIngredientes);
  $$ConfiguracoesPrecificacaoTableTableManager get configuracoesPrecificacao =>
      $$ConfiguracoesPrecificacaoTableTableManager(
        _db,
        _db.configuracoesPrecificacao,
      );
  $$ConfiguracoesGeraisTableTableManager get configuracoesGerais =>
      $$ConfiguracoesGeraisTableTableManager(_db, _db.configuracoesGerais);
  $$ClientesTableTableManager get clientes =>
      $$ClientesTableTableManager(_db, _db.clientes);
  $$OrcamentosTableTableManager get orcamentos =>
      $$OrcamentosTableTableManager(_db, _db.orcamentos);
  $$OrcamentoItensTableTableManager get orcamentoItens =>
      $$OrcamentoItensTableTableManager(_db, _db.orcamentoItens);
}
