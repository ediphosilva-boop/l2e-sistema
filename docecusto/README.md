# DoceCusto

App Flutter para confeiteiras calcularem o preço de venda dos seus doces,
com todos os dados guardados no próprio celular (sem login, sem servidor).

## Arquitetura

- **Estado:** [Riverpod](https://riverpod.dev) (`flutter_riverpod`)
- **Dados locais:** [Drift](https://drift.simonbinder.eu) (SQLite)
- **PDF:** pacote [`pdf`](https://pub.dev/packages/pdf) + [`printing`](https://pub.dev/packages/printing)
- **UI:** Material 3, tema rosa/creme, tipografia ampliada para telas pequenas

## Modelagem de dados (Drift)

Tabelas definidas em `lib/data/local/tables.dart`:

| Tabela | Descrição |
|---|---|
| `Ingredientes` | nome, unidade de medida e preço por unidade |
| `Receitas` | nome, modo de preparo, rendimento |
| `ReceitaIngredientes` | ingredientes e quantidades usados em cada receita |
| `ConfiguracoesPrecificacao` | horas de trabalho, valor/hora, % custos fixos, % margem por receita |
| `Clientes` | dados do cliente para orçamentos |
| `Orcamentos` / `OrcamentoItens` | orçamentos gerados e seus itens |

## Status das funcionalidades

- [x] Modelagem de dados completa
- [x] CRUD de ingredientes (tela `lib/features/ingredientes`)
- [ ] CRUD de receitas com cálculo de custo proporcional
- [ ] Tela de precificação (custo + hora + custos fixos + margem)
- [ ] Geração de orçamento em PDF

## Rodando o projeto

```bash
flutter pub get
dart run build_runner build --delete-conflicting-outputs # gera código do Drift
flutter run
```

## Testes e análise estática

```bash
flutter analyze
flutter test
```
