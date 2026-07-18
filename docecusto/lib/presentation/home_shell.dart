import 'package:flutter/material.dart';

import '../common/widgets/em_breve_screen.dart';
import '../features/ingredientes/presentation/ingredientes_screen.dart';
import '../features/receitas/presentation/receitas_screen.dart';

/// Casca de navegação principal do app, com as quatro áreas do DoceCusto.
/// Por enquanto só "Ingredientes" está implementada; as demais mostram um
/// aviso de "em breve" até serem construídas nas próximas etapas.
class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _indiceSelecionado = 0;

  static const _telas = [
    IngredientesScreen(),
    ReceitasScreen(),
    EmBreveScreen(
      titulo: 'Precificação',
      icone: Icons.calculate_outlined,
      descricao:
          'Em breve: some o custo dos ingredientes, horas de trabalho, '
          'custos fixos e margem de lucro para chegar ao preço de venda ideal.',
    ),
    EmBreveScreen(
      titulo: 'Orçamentos',
      icone: Icons.picture_as_pdf_outlined,
      descricao:
          'Em breve: gere orçamentos em PDF com os dados do cliente e os '
          'itens escolhidos, prontos para enviar.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _indiceSelecionado, children: _telas),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _indiceSelecionado,
        onDestinationSelected: (indice) =>
            setState(() => _indiceSelecionado = indice),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.egg_outlined),
            selectedIcon: Icon(Icons.egg),
            label: 'Ingredientes',
          ),
          NavigationDestination(
            icon: Icon(Icons.menu_book_outlined),
            selectedIcon: Icon(Icons.menu_book),
            label: 'Receitas',
          ),
          NavigationDestination(
            icon: Icon(Icons.calculate_outlined),
            selectedIcon: Icon(Icons.calculate),
            label: 'Preço',
          ),
          NavigationDestination(
            icon: Icon(Icons.picture_as_pdf_outlined),
            selectedIcon: Icon(Icons.picture_as_pdf),
            label: 'Orçamentos',
          ),
        ],
      ),
    );
  }
}
