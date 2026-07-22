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
| `Ingredientes` | nome, unidade de medida, quantidade e preço da embalagem comprada (preço por unidade é derivado) |
| `Receitas` | nome, modo de preparo, rendimento |
| `ReceitaIngredientes` | ingredientes e quantidades usados em cada receita |
| `ConfiguracoesPrecificacao` | horas de trabalho, valor/hora, % custos fixos, % margem salvos por receita |
| `ConfiguracoesGerais` | valor/hora padrão e perfil do negócio (nome, logo, telefone, endereço, redes sociais, descrição — linha única), reaproveitados em toda receita/orçamento e na tela inicial |
| `Clientes` | dados do cliente para orçamentos |
| `Orcamentos` / `OrcamentoItens` | orçamentos gerados e seus itens |

## Status das funcionalidades

- [x] Modelagem de dados completa
- [x] CRUD de ingredientes, com preço por embalagem (ex: óleo 900 ml por R$ 8,00) e preço por unidade calculado automaticamente (tela `lib/features/ingredientes`)
- [x] CRUD de receitas com cálculo de custo proporcional, incluindo unidades culinárias (xícara, colher de sopa, colher de chá) além de g/kg/ml/litro/unidade (tela `lib/features/receitas`)
- [x] Busca com autocomplete nos seletores de ingrediente (em receitas) e de receita (em orçamentos), facilitando encontrar itens em listas grandes
- [x] Tela de precificação: custo + hora + custos fixos + margem via slider **ou campo de porcentagem digitável**, com preço sugerido em tempo real (tela `lib/features/precificacao`)
- [x] Geração de orçamento em PDF, com histórico e compartilhamento (tela `lib/features/orcamentos`)
- [x] Perfil do negócio: nome, logo, telefone, endereço, redes sociais e descrição, exibidos no cabeçalho do PDF do orçamento (tela `lib/features/empresa`)
- [x] Tela inicial de boas-vindas com a logo e a descrição do negócio, primeira aba do app (tela `lib/features/inicio`)
- [x] Teclado é fechado automaticamente ao tocar fora de um campo de texto, em qualquer tela do app

A marca d'água da versão grátis ("Feito com DoceCusto") impressa no rodapé
dos PDFs fica isolada na constante `marcaDaguaVersaoGratis` em
`lib/features/orcamentos/application/orcamento_pdf_service.dart`, para
facilitar condicioná-la numa futura versão paga.

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
