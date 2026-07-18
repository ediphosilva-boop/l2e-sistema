import 'package:drift/native.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:docecusto/app.dart';
import 'package:docecusto/data/local/database.dart';
import 'package:docecusto/features/ingredientes/application/ingredientes_providers.dart';

void main() {
  testWidgets('App inicia na tela de Ingredientes', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          appDatabaseProvider.overrideWithValue(
            AppDatabase.paraTestes(NativeDatabase.memory()),
          ),
        ],
        child: const DoceCustoApp(),
      ),
    );
    await tester.pump();

    expect(find.text('Ingredientes'), findsWidgets);
    expect(find.text('Nenhum ingrediente cadastrado'), findsOneWidget);

    // Descarta a árvore de widgets (e o ProviderScope) ainda dentro do
    // corpo do teste, para que o timer de cancelamento do stream do Drift
    // seja disparado antes do binding verificar timers pendentes.
    await tester.pumpWidget(const SizedBox.shrink());
    await tester.pump(const Duration(milliseconds: 1));
  });
}
