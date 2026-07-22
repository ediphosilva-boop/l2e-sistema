import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/utils/logo_negocio_storage.dart';
import '../../../data/local/daos/configuracoes_gerais_dao.dart';
import '../../precificacao/application/precificacao_providers.dart';

/// Tela de cadastro do perfil do negócio: nome, logo, telefone, endereço e
/// redes sociais, usados no cabeçalho dos orçamentos em PDF.
class EmpresaScreen extends ConsumerStatefulWidget {
  const EmpresaScreen({super.key});

  @override
  ConsumerState<EmpresaScreen> createState() => _EmpresaScreenState();
}

class _EmpresaScreenState extends ConsumerState<EmpresaScreen> {
  final _nomeController = TextEditingController();
  final _telefoneController = TextEditingController();
  final _enderecoController = TextEditingController();
  final _redesSociaisController = TextEditingController();

  bool _carregando = true;
  bool _salvando = false;

  String? _logoNomeArquivoSalvo;
  File? _logoArquivoAtual;
  File? _novaImagemEscolhida;
  bool _removerLogo = false;

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  @override
  void dispose() {
    _nomeController.dispose();
    _telefoneController.dispose();
    _enderecoController.dispose();
    _redesSociaisController.dispose();
    super.dispose();
  }

  Future<void> _carregar() async {
    final perfil = await ref
        .read(configuracoesGeraisDaoProvider)
        .buscarPerfilEmpresa();
    final logo = await resolverLogoNegocio(perfil.logoNomeArquivo);
    if (!mounted) return;
    setState(() {
      _nomeController.text = perfil.nome ?? '';
      _telefoneController.text = perfil.telefone ?? '';
      _enderecoController.text = perfil.endereco ?? '';
      _redesSociaisController.text = perfil.redesSociais ?? '';
      _logoNomeArquivoSalvo = perfil.logoNomeArquivo;
      _logoArquivoAtual = logo;
      _carregando = false;
    });
  }

  File? get _logoParaExibir {
    if (_novaImagemEscolhida != null) return _novaImagemEscolhida;
    if (_removerLogo) return null;
    return _logoArquivoAtual;
  }

  Future<void> _escolherImagem(ImageSource origem) async {
    final picker = ImagePicker();
    final arquivo = await picker.pickImage(
      source: origem,
      maxWidth: 1024,
      imageQuality: 85,
    );
    if (arquivo == null || !mounted) return;
    setState(() {
      _novaImagemEscolhida = File(arquivo.path);
      _removerLogo = false;
    });
  }

  Future<void> _abrirSeletorDeLogo() async {
    final temLogo = _logoParaExibir != null;
    final opcao = await showModalBottomSheet<_OpcaoLogo>(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: const Text('Escolher da galeria'),
              onTap: () => Navigator.of(context).pop(_OpcaoLogo.galeria),
            ),
            ListTile(
              leading: const Icon(Icons.photo_camera_outlined),
              title: const Text('Tirar foto'),
              onTap: () => Navigator.of(context).pop(_OpcaoLogo.camera),
            ),
            if (temLogo)
              ListTile(
                leading: Icon(
                  Icons.delete_outline,
                  color: Theme.of(context).colorScheme.error,
                ),
                title: const Text('Remover foto'),
                onTap: () => Navigator.of(context).pop(_OpcaoLogo.remover),
              ),
          ],
        ),
      ),
    );

    switch (opcao) {
      case _OpcaoLogo.galeria:
        await _escolherImagem(ImageSource.gallery);
      case _OpcaoLogo.camera:
        await _escolherImagem(ImageSource.camera);
      case _OpcaoLogo.remover:
        setState(() {
          _novaImagemEscolhida = null;
          _removerLogo = true;
        });
      case null:
        break;
    }
  }

  String? _semTexto(String texto) => texto.trim().isEmpty ? null : texto.trim();

  Future<void> _salvar() async {
    setState(() => _salvando = true);
    try {
      var nomeArquivoFinal = _logoNomeArquivoSalvo;
      if (_novaImagemEscolhida != null) {
        nomeArquivoFinal = await salvarLogoNegocio(_novaImagemEscolhida!);
      } else if (_removerLogo) {
        await removerLogoNegocio(_logoNomeArquivoSalvo);
        nomeArquivoFinal = null;
      }

      await ref
          .read(configuracoesGeraisDaoProvider)
          .salvarPerfilEmpresa(
            PerfilEmpresa(
              nome: _semTexto(_nomeController.text),
              telefone: _semTexto(_telefoneController.text),
              endereco: _semTexto(_enderecoController.text),
              redesSociais: _semTexto(_redesSociaisController.text),
              logoNomeArquivo: nomeArquivoFinal,
            ),
          );

      if (!mounted) return;
      setState(() {
        _logoNomeArquivoSalvo = nomeArquivoFinal;
        _logoArquivoAtual = _novaImagemEscolhida ?? _logoArquivoAtual;
        _novaImagemEscolhida = null;
        _removerLogo = false;
      });
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Dados do negócio salvos.')));
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Não foi possível salvar: $e')));
      }
    } finally {
      if (mounted) setState(() => _salvando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Seu negócio')),
      body: _carregando
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
              children: [
                Text(
                  'Esses dados aparecem no cabeçalho dos orçamentos em PDF '
                  'que você compartilha com clientes.',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 20),
                Center(
                  child: GestureDetector(
                    onTap: _abrirSeletorDeLogo,
                    child: Stack(
                      alignment: Alignment.bottomRight,
                      children: [
                        CircleAvatar(
                          radius: 56,
                          backgroundColor: colorScheme.primaryContainer,
                          backgroundImage: _logoParaExibir != null
                              ? FileImage(_logoParaExibir!)
                              : null,
                          child: _logoParaExibir == null
                              ? Icon(
                                  Icons.storefront_outlined,
                                  size: 40,
                                  color: colorScheme.onPrimaryContainer,
                                )
                              : null,
                        ),
                        CircleAvatar(
                          radius: 18,
                          backgroundColor: colorScheme.primary,
                          child: const Icon(
                            Icons.edit,
                            size: 18,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Center(
                  child: Text(
                    'Toque para escolher a logo',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ),
                const SizedBox(height: 24),
                TextFormField(
                  controller: _nomeController,
                  textCapitalization: TextCapitalization.words,
                  decoration: const InputDecoration(
                    labelText: 'Nome do negócio',
                    hintText: 'Ex: Doces da Ana',
                  ),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _telefoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Telefone',
                    hintText: 'Opcional',
                  ),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _enderecoController,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'Endereço',
                    hintText: 'Opcional',
                    alignLabelWithHint: true,
                  ),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _redesSociaisController,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'Redes sociais',
                    hintText: 'Ex: @docesdaana · (11) 99999-9999',
                    alignLabelWithHint: true,
                  ),
                ),
                const SizedBox(height: 28),
                ElevatedButton(
                  onPressed: _salvando ? null : _salvar,
                  child: _salvando
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Salvar'),
                ),
              ],
            ),
    );
  }
}

enum _OpcaoLogo { galeria, camera, remover }
