import 'package:flutter/material.dart';

import 'presentation/home_shell.dart';
import 'theme/app_theme.dart';

class DoceCustoApp extends StatelessWidget {
  const DoceCustoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DoceCusto',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.claro(),
      home: const HomeShell(),
    );
  }
}
