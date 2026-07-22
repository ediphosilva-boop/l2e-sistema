import 'dart:io';

import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

const _nomeArquivoLogo = 'logo_negocio.png';

/// Copia [imagemOriginal] para o armazenamento local do app com um nome
/// fixo, substituindo a logo anterior se houver. Retorna só o nome do
/// arquivo (não o caminho completo), para guardar no banco — no iOS o
/// diretório do app pode mudar de UUID entre atualizações.
Future<String> salvarLogoNegocio(File imagemOriginal) async {
  final pastaDocumentos = await getApplicationDocumentsDirectory();
  final destino = File(p.join(pastaDocumentos.path, _nomeArquivoLogo));
  await imagemOriginal.copy(destino.path);
  return _nomeArquivoLogo;
}

/// Resolve o caminho completo e atual do arquivo de logo salvo, ou null se
/// [nomeArquivo] for nulo ou o arquivo não existir mais.
Future<File?> resolverLogoNegocio(String? nomeArquivo) async {
  if (nomeArquivo == null) return null;
  final pastaDocumentos = await getApplicationDocumentsDirectory();
  final arquivo = File(p.join(pastaDocumentos.path, nomeArquivo));
  return arquivo.existsSync() ? arquivo : null;
}

Future<void> removerLogoNegocio(String? nomeArquivo) async {
  final arquivo = await resolverLogoNegocio(nomeArquivo);
  if (arquivo != null && arquivo.existsSync()) {
    await arquivo.delete();
  }
}
