import 'package:flutter/material.dart';

import '../features/empresa/presentation/empresa_screen.dart';
import '../features/ingredientes/presentation/ingredientes_screen.dart';
import '../features/orcamentos/presentation/orcamentos_screen.dart';
import '../features/precificacao/presentation/precificacao_screen.dart';
import '../features/receitas/presentation/receitas_screen.dart';

/// Casca de navegação principal do app, com as cinco áreas do DoceCusto.
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
    PrecificacaoScreen(),
    OrcamentosScreen(),
    EmpresaScreen(),
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
          NavigationDestination(
            icon: Icon(Icons.storefront_outlined),
            selectedIcon: Icon(Icons.storefront),
            label: 'Empresa',
          ),
        ],
      ),
    );
  }
}
