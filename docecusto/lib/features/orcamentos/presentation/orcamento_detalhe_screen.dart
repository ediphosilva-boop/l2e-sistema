import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:printing/printing.dart';

import '../../../core/utils/formatters.dart';
import '../../../core/utils/logo_negocio_storage.dart';
import '../../../data/local/daos/orcamentos_dao.dart';
import '../../precificacao/application/precificacao_providers.dart';
import '../application/orcamento_pdf_service.dart';
import '../application/orcamentos_providers.dart';

final _formatoData = DateFormat('dd/MM/yyyy');

/// Tela de detalhe de um orçamento salvo: dados do cliente, itens, total,
/// validade, observações e o botão para (re)compartilhar o PDF.
class OrcamentoDetalheScreen extends ConsumerStatefulWidget {
  const OrcamentoDetalheScreen({super.key, required this.orcamentoId});

  final int orcamentoId;

  @override
  ConsumerState<OrcamentoDetalheScreen> createState() =>
      _OrcamentoDetalheScreenState();
}

class _OrcamentoDetalheScreenState
    extends ConsumerState<OrcamentoDetalheScreen> {
  OrcamentoDetalhe? _detalhe;
  bool _compartilhando = false;

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  Future<void> _carregar() async {
    final detalhe = await ref
        .read(orcamentosDaoProvider)
        .buscarDetalhe(widget.orcamentoId);
    if (!mounted) return;
    setState(() => _detalhe = detalhe);
  }

  Future<void> _compartilhar() async {
    final detalhe = _detalhe;
    if (detalhe == null) return;

    setState(() => _compartilhando = true);
    try {
      final perfil = await ref
          .read(configuracoesGeraisDaoProvider)
          .buscarPerfilEmpresa();
      final logoArquivo = await resolverLogoNegocio(perfil.logoNomeArquivo);
      final logoBytes = await logoArquivo?.readAsBytes();

      final bytes = await gerarPdfOrcamento(
        detalhe: detalhe,
        perfil: perfil,
        logoBytes: logoBytes,
      );
      await Printing.sharePdf(
        bytes: bytes,
        filename: 'orcamento_${detalhe.orcamento.id}.pdf',
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Não foi possível gerar o PDF: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _compartilhando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final detalhe = _detalhe;
    final colorScheme = Theme.of(context).colorScheme;
    final formaPagamento = detalhe?.orcamento.formaPagamento?.trim();
    final descontoCondicionado =
        detalhe != null &&
        detalhe.desconto > 0 &&
        formaPagamento != null &&
        formaPagamento.isNotEmpty;
    final percentualDesconto = detalhe != null && detalhe.subtotal > 0
        ? (detalhe.desconto / detalhe.subtotal * 100).round()
        : 0;

    return Scaffold(
      appBar: AppBar(title: const Text('Orçamento')),
      body: detalhe == null
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
              children: [
                Text(
                  detalhe.cliente.nome,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                if (detalhe.cliente.telefone != null &&
                    detalhe.cliente.telefone!.trim().isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(formatarTelefone(detalhe.cliente.telefone)),
                  ),
                const SizedBox(height: 4),
                Text(
                  'Criado em ${_formatoData.format(detalhe.orcamento.criadoEm)} · '
                  'válido até ${_formatoData.format(detalhe.orcamento.criadoEm.add(Duration(days: detalhe.orcamento.validadeDias)))}',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 24),
                Text('Itens', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                ...detalhe.itens.map(
                  (item) => Card(
                    child: ListTile(
                      title: Text(item.descricao),
                      subtitle: Text(
                        '${formatarQuantidade(item.quantidade)} × ${formatarMoeda(item.precoUnitario)}',
                      ),
                      trailing: Text(
                        formatarMoeda(item.subtotal),
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      if (descontoCondicionado) ...[
                        _linhaTotal(
                          context,
                          'Valor total',
                          formatarMoeda(detalhe.subtotal),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                'No $formaPagamento ($percentualDesconto% de desconto)',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                            ),
                            Text(
                              formatarMoeda(detalhe.total),
                              style: Theme.of(context).textTheme.titleLarge
                                  ?.copyWith(fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ] else ...[
                        if (detalhe.desconto > 0) ...[
                          _linhaTotal(
                            context,
                            'Subtotal',
                            formatarMoeda(detalhe.subtotal),
                          ),
                          _linhaTotal(
                            context,
                            'Desconto',
                            '- ${formatarMoeda(detalhe.desconto)}',
                          ),
                          const SizedBox(height: 4),
                        ],
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Total',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            Text(
                              formatarMoeda(detalhe.total),
                              style: Theme.of(context).textTheme.titleLarge
                                  ?.copyWith(fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                if (!descontoCondicionado &&
                    formaPagamento != null &&
                    formaPagamento.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  Text(
                    'Forma de pagamento',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(formaPagamento),
                ],
                if (detalhe.orcamento.observacoes != null &&
                    detalhe.orcamento.observacoes!.trim().isNotEmpty) ...[
                  const SizedBox(height: 24),
                  Text(
                    'Observações',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(detalhe.orcamento.observacoes!),
                ],
              ],
            ),
      bottomNavigationBar: detalhe == null
          ? null
          : SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: ElevatedButton.icon(
                  onPressed: _compartilhando ? null : _compartilhar,
                  icon: _compartilhando
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.share_outlined),
                  label: const Text('Compartilhar PDF'),
                ),
              ),
            ),
    );
  }

  Widget _linhaTotal(BuildContext context, String rotulo, String valor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(rotulo, style: Theme.of(context).textTheme.bodyMedium),
          Text(valor, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }
}
