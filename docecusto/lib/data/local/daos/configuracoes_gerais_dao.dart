import 'package:drift/drift.dart';

import '../database.dart';
import '../tables.dart';

part 'configuracoes_gerais_dao.g.dart';

/// Perfil do negócio usado no cabeçalho dos orçamentos em PDF. [logoNomeArquivo]
/// guarda só o nome do arquivo (não o caminho completo): no iOS o diretório
/// do app pode mudar de UUID entre atualizações, então o caminho é sempre
/// remontado na hora de ler o arquivo.
class PerfilEmpresa {
  const PerfilEmpresa({
    this.nome,
    this.telefone,
    this.endereco,
    this.redesSociais,
    this.logoNomeArquivo,
  });

  final String? nome;
  final String? telefone;
  final String? endereco;
  final String? redesSociais;
  final String? logoNomeArquivo;
}

@DriftAccessor(tables: [ConfiguracoesGerais])
class ConfiguracoesGeraisDao extends DatabaseAccessor<AppDatabase>
    with _$ConfiguracoesGeraisDaoMixin {
  ConfiguracoesGeraisDao(super.db);

  static const _idSingleton = 1;

  /// Valor/hora padrão já definido pela usuária, ou null se ainda não foi
  /// configurado (a tela de Precificação pede para defini-lo nesse caso).
  Future<double?> buscarValorHoraPadrao() async {
    final linha = await (select(
      configuracoesGerais,
    )..where((t) => t.id.equals(_idSingleton))).getSingleOrNull();
    return linha?.valorHoraPadrao;
  }

  Future<void> definirValorHoraPadrao(double valor) {
    return into(configuracoesGerais).insertOnConflictUpdate(
      ConfiguracoesGeraisCompanion.insert(
        id: const Value(_idSingleton),
        valorHoraPadrao: Value(valor),
      ),
    );
  }

  /// Perfil completo do negócio (nome, telefone, endereço, redes sociais e
  /// logo), usado no cabeçalho dos orçamentos em PDF.
  Future<PerfilEmpresa> buscarPerfilEmpresa() async {
    final linha = await (select(
      configuracoesGerais,
    )..where((t) => t.id.equals(_idSingleton))).getSingleOrNull();
    if (linha == null) return const PerfilEmpresa();
    return PerfilEmpresa(
      nome: linha.nomeNegocio,
      telefone: linha.telefoneNegocio,
      endereco: linha.enderecoNegocio,
      redesSociais: linha.redesSociaisNegocio,
      logoNomeArquivo: linha.logoNomeArquivo,
    );
  }

  Future<void> salvarPerfilEmpresa(PerfilEmpresa perfil) {
    return into(configuracoesGerais).insertOnConflictUpdate(
      ConfiguracoesGeraisCompanion.insert(
        id: const Value(_idSingleton),
        nomeNegocio: Value(perfil.nome),
        telefoneNegocio: Value(perfil.telefone),
        enderecoNegocio: Value(perfil.endereco),
        redesSociaisNegocio: Value(perfil.redesSociais),
        logoNomeArquivo: Value(perfil.logoNomeArquivo),
      ),
    );
  }
}
