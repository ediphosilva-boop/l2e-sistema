import 'dart:typed_data';

import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

import '../../../core/utils/formatters.dart';
import '../../../data/local/daos/orcamentos_dao.dart';
import '../../../data/local/database.dart';

/// Marca d'água da versão grátis do DoceCusto, exibida no rodapé de todo
/// PDF gerado. Isolada nesta constante para facilitar condicioná-la (ou
/// removê-la) numa futura versão paga do app.
const String marcaDaguaVersaoGratis = 'Feito com DoceCusto';

final _corRosa = PdfColor.fromHex('#D8698A');
final _corCreme = PdfColor.fromHex('#FFF7EE');
final _formatoData = DateFormat('dd/MM/yyyy');

/// Gera o PDF de um orçamento: cabeçalho com o nome do negócio, dados do
/// cliente, tabela de itens, total destacado, validade, observações e a
/// marca d'água no rodapé.
Future<Uint8List> gerarPdfOrcamento({
  required OrcamentoDetalhe detalhe,
  required String? nomeNegocio,
}) async {
  final documento = pw.Document();
  final orcamento = detalhe.orcamento;
  final validade = orcamento.criadoEm.add(
    Duration(days: orcamento.validadeDias),
  );

  documento.addPage(
    pw.Page(
      pageFormat: PdfPageFormat.a4,
      margin: const pw.EdgeInsets.all(32),
      build: (context) {
        return pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.stretch,
          children: [
            _cabecalho(nomeNegocio, orcamento.id, orcamento.criadoEm),
            pw.SizedBox(height: 20),
            _dadosCliente(detalhe.cliente),
            pw.SizedBox(height: 20),
            _tabelaItens(detalhe.itens),
            pw.SizedBox(height: 12),
            _totalDestacado(detalhe.total),
            pw.SizedBox(height: 20),
            _informacoesFinais(validade, orcamento.observacoes),
            pw.SizedBox(height: 32),
            _rodape(),
          ],
        );
      },
    ),
  );

  return documento.save();
}

pw.Widget _cabecalho(String? nomeNegocio, int orcamentoId, DateTime criadoEm) {
  final titulo = (nomeNegocio == null || nomeNegocio.trim().isEmpty)
      ? 'Orçamento'
      : nomeNegocio.trim();
  return pw.Column(
    crossAxisAlignment: pw.CrossAxisAlignment.start,
    children: [
      pw.Text(
        titulo,
        style: pw.TextStyle(
          fontSize: 22,
          fontWeight: pw.FontWeight.bold,
          color: _corRosa,
        ),
      ),
      pw.SizedBox(height: 4),
      pw.Text(
        'Orçamento #$orcamentoId  ·  ${_formatoData.format(criadoEm)}',
        style: const pw.TextStyle(fontSize: 11, color: PdfColors.grey700),
      ),
      pw.SizedBox(height: 8),
      pw.Divider(color: _corRosa, thickness: 1.5),
    ],
  );
}

pw.Widget _dadosCliente(Cliente cliente) {
  final telefone = cliente.telefone?.trim();
  return pw.Column(
    crossAxisAlignment: pw.CrossAxisAlignment.start,
    children: [
      pw.Text(
        'Cliente',
        style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 12),
      ),
      pw.SizedBox(height: 4),
      pw.Text(cliente.nome, style: const pw.TextStyle(fontSize: 12)),
      if (telefone != null && telefone.isNotEmpty)
        pw.Text(telefone, style: const pw.TextStyle(fontSize: 12)),
    ],
  );
}

pw.Widget _tabelaItens(List<ItemOrcamentoRascunho> itens) {
  return pw.Table(
    border: const pw.TableBorder(
      horizontalInside: pw.BorderSide(color: PdfColors.grey300),
      bottom: pw.BorderSide(color: PdfColors.grey400),
    ),
    columnWidths: const {
      0: pw.FlexColumnWidth(4),
      1: pw.FlexColumnWidth(1.3),
      2: pw.FlexColumnWidth(2),
      3: pw.FlexColumnWidth(2),
    },
    children: [
      pw.TableRow(
        decoration: const pw.BoxDecoration(color: PdfColors.grey200),
        children: [
          _celulaCabecalho('Item'),
          _celulaCabecalho('Qtd.'),
          _celulaCabecalho('Valor unit.'),
          _celulaCabecalho('Subtotal'),
        ],
      ),
      for (final item in itens)
        pw.TableRow(
          children: [
            _celula(item.descricao),
            _celula(
              formatarQuantidade(item.quantidade),
              alinhamento: pw.TextAlign.center,
            ),
            _celula(
              formatarMoeda(item.precoUnitario),
              alinhamento: pw.TextAlign.right,
            ),
            _celula(
              formatarMoeda(item.subtotal),
              alinhamento: pw.TextAlign.right,
            ),
          ],
        ),
    ],
  );
}

pw.Widget _celulaCabecalho(String texto) => pw.Padding(
  padding: const pw.EdgeInsets.symmetric(vertical: 8, horizontal: 6),
  child: pw.Text(
    texto,
    style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 11),
  ),
);

pw.Widget _celula(
  String texto, {
  pw.TextAlign alinhamento = pw.TextAlign.left,
}) => pw.Padding(
  padding: const pw.EdgeInsets.symmetric(vertical: 8, horizontal: 6),
  child: pw.Text(
    texto,
    style: const pw.TextStyle(fontSize: 11),
    textAlign: alinhamento,
  ),
);

pw.Widget _totalDestacado(double total) {
  return pw.Container(
    alignment: pw.Alignment.centerRight,
    padding: const pw.EdgeInsets.symmetric(vertical: 10, horizontal: 12),
    decoration: pw.BoxDecoration(
      color: _corCreme,
      borderRadius: const pw.BorderRadius.all(pw.Radius.circular(6)),
    ),
    child: pw.Row(
      mainAxisSize: pw.MainAxisSize.min,
      children: [
        pw.Text(
          'Total: ',
          style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold),
        ),
        pw.Text(
          formatarMoeda(total),
          style: pw.TextStyle(
            fontSize: 16,
            fontWeight: pw.FontWeight.bold,
            color: _corRosa,
          ),
        ),
      ],
    ),
  );
}

pw.Widget _informacoesFinais(DateTime validade, String? observacoes) {
  final texto = observacoes?.trim();
  return pw.Column(
    crossAxisAlignment: pw.CrossAxisAlignment.start,
    children: [
      pw.Text(
        'Validade da proposta: ${_formatoData.format(validade)}',
        style: const pw.TextStyle(fontSize: 11),
      ),
      if (texto != null && texto.isNotEmpty) ...[
        pw.SizedBox(height: 10),
        pw.Text(
          'Observações',
          style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 11),
        ),
        pw.SizedBox(height: 2),
        pw.Text(texto, style: const pw.TextStyle(fontSize: 11)),
      ],
    ],
  );
}

pw.Widget _rodape() {
  return pw.Column(
    crossAxisAlignment: pw.CrossAxisAlignment.center,
    children: [
      pw.Divider(color: PdfColors.grey300),
      pw.Text(
        marcaDaguaVersaoGratis,
        style: pw.TextStyle(
          fontSize: 9,
          color: PdfColors.grey500,
          fontStyle: pw.FontStyle.italic,
        ),
      ),
    ],
  );
}
