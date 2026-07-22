import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/local/daos/configuracoes_gerais_dao.dart';
import '../../precificacao/application/precificacao_providers.dart';

/// Perfil do negócio, atualizado em tempo real conforme a usuária edita seus
/// dados na aba Empresa — assim a tela inicial reflete a mudança na hora.
final perfilEmpresaProvider = StreamProvider.autoDispose<PerfilEmpresa>((ref) {
  final dao = ref.watch(configuracoesGeraisDaoProvider);
  return dao.observarPerfilEmpresa();
});
