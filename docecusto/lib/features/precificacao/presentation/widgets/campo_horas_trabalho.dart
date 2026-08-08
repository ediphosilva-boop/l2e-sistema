import 'package:flutter/material.dart';

/// Campo de horas de trabalho dividido em "horas" e "minutos" inteiros, mais
/// intuitivo de preencher do que exigir a conversão manual pra decimal (ex:
/// 1h30 vira 1,5 sozinho, sem a usuária precisar calcular isso de cabeça).
class CampoHorasTrabalho extends StatelessWidget {
  const CampoHorasTrabalho({
    super.key,
    required this.horasController,
    required this.minutosController,
    required this.onChanged,
  });

  final TextEditingController horasController;
  final TextEditingController minutosController;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: TextFormField(
            controller: horasController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Horas de trabalho',
              suffixText: 'h',
            ),
            onChanged: onChanged,
            validator: (valor) {
              final numero = int.tryParse((valor ?? '').trim());
              if (numero == null || numero < 0) {
                return 'Informe um número válido';
              }
              return null;
            },
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: TextFormField(
            controller: minutosController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Minutos',
              suffixText: 'min',
            ),
            onChanged: onChanged,
            validator: (valor) {
              final numero = int.tryParse((valor ?? '').trim());
              if (numero == null || numero < 0 || numero > 59) {
                return 'De 0 a 59';
              }
              return null;
            },
          ),
        ),
      ],
    );
  }
}
