import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/utils/logo_negocio_storage.dart';
import '../../../data/local/daos/configuracoes_gerais_dao.dart';
import '../application/inicio_providers.dart';

/// Tela inicial de boas-vindas, exibida ao abrir o app: mostra a logo e a
/// descrição do negócio cadastradas na aba Empresa.
class InicioScreen extends ConsumerWidget {
  const InicioScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final perfilAsync = ref.watch(perfilEmpresaProvider);

    return Scaffold(
      body: SafeArea(
        child: perfilAsync.when(
          data: (perfil) => _Conteudo(perfil: perfil),
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (erro, _) =>
              Center(child: Text('Não foi possível carregar: $erro')),
        ),
      ),
    );
  }
}

class _Conteudo extends StatelessWidget {
  const _Conteudo({required this.perfil});

  final PerfilEmpresa perfil;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final nome = perfil.nome?.trim();
    final descricao = perfil.descricao?.trim();

    return ListView(
      padding: const EdgeInsets.fromLTRB(24, 48, 24, 32),
      children: [
        Center(
          child: FutureBuilder<File?>(
            future: resolverLogoNegocio(perfil.logoNomeArquivo),
            builder: (context, snapshot) {
              final logo = snapshot.data;
              return CircleAvatar(
                radius: 64,
                backgroundColor: colorScheme.primaryContainer,
                backgroundImage: logo != null ? FileImage(logo) : null,
                child: logo == null
                    ? Icon(
                        Icons.storefront_outlined,
                        size: 56,
                        color: colorScheme.onPrimaryContainer,
                      )
                    : null,
              );
            },
          ),
        ),
        const SizedBox(height: 24),
        Text(
          (nome == null || nome.isEmpty) ? 'Bem-vindo(a) ao DoceCusto!' : nome,
          textAlign: TextAlign.center,
          style: Theme.of(
            context,
          ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        if (descricao != null && descricao.isNotEmpty)
          Text(
            descricao,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyLarge,
          )
        else
          Text(
            'Cadastre o nome, a logo e uma descrição do seu negócio na aba '
            '"Empresa" para personalizar esta tela.',
            textAlign: TextAlign.center,
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: colorScheme.outline),
          ),
      ],
    );
  }
}
