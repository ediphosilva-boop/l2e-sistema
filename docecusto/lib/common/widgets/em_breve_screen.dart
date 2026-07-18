import 'package:flutter/material.dart';

/// Placeholder para telas cuja funcionalidade ainda será implementada.
class EmBreveScreen extends StatelessWidget {
  const EmBreveScreen({
    super.key,
    required this.titulo,
    required this.icone,
    required this.descricao,
  });

  final String titulo;
  final IconData icone;
  final String descricao;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(titulo)),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icone,
                size: 64,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: 16),
              Text(
                titulo,
                style: Theme.of(context).textTheme.titleLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                descricao,
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
