# EBX Raio-X: protótipos navegáveis

Demonstração local de um produto de RH: agentes que ligam as metas do negócio ao trabalho do RH e dizem o que fazer, parar e delegar. Este repositório é um protótipo para aferir viabilidade, não o produto.

Antes de mudar algo relevante, leia `docs/contexto-produto.md` (o porquê), `docs/decisoes.md` (o que já foi decidido) e `docs/backlog.md` (o que vem a seguir).

## Comandos

- Rodar: `node server.mjs` (Node 18+, porta 4173; `PORT=8080` muda a porta).
- Testar: `npm test`. Percorre o ciclo inteiro por todas as aplicações com um navegador simulado. Rode depois de qualquer mudança em `shared/` ou `apps/`.
- Não há build, lint nem dependências. Não adicione dependências sem pedir.

## Como o código está organizado

- `server.mjs`: serve arquivos, guarda o estado único em `data/state.json` e avisa as telas por SSE (`/api/events`).
- `apps/<nome>/`: uma aplicação por canal, com `index.html` e `app.js`. O servidor mapeia `/<nome>/` para a pasta; `/` abre `apps/hub`.
- `shared/`: tudo o que as aplicações compartilham, exposto no objeto global `RX`.
  - `metodologia.js`: o mapa EBX (meta, alavanca, indicador, ação). Conteúdo provisório.
  - `motor.js`: diagnóstico e classificação das iniciativas. Só lê o mapa.
  - `dados.js`: base de exemplo, leitura de CSV e indicadores.
  - `fluxo.js`: quais mensagens cada persona recebe, a partir do estado. Ids fixos, sem duplicar.
  - `store.js`: `RX.store.iniciar(desenhar)`, `mudar(fn)`, `redesenhar()`, `zerar()`.
  - `ui.js`: peças de interface (`RX.ui`).
  - `tema.js`: tema claro ou escuro (`RX.tema`). Carrega no `<head>`; a escolha fica no `localStorage`, fora do estado.
  - `ebx.css`: identidade visual.

## Convenções

- Tudo em português do Brasil: interface, comentários, nomes de variáveis e mensagens de commit.
- JavaScript de navegador sem módulos nem transpilação: scripts clássicos, IIFE, `var` e `function`. O servidor usa ES modules.
- Toda mudança de estado passa por `RX.store.mudar(function (S) { ... })`. Nunca grave o estado direto.
- Texto vindo do usuário entra no HTML sempre por `RX.ui.esc`.
- Cliques usam `data-act` e `RX.ui.acoes({ ... })`. Estado local de tela fica em variáveis do IIFE.
- Um canal novo é uma pasta nova em `apps/`, com o mesmo `index.html` das outras e uma linha no painel (`apps/hub/app.js`) e no README.
- Uma mensagem nova entre personas entra em `shared/fluxo.js`, com id fixo.
- Cores e componentes vêm de `shared/ebx.css`, que segue `src/colors.css` do repositório `erp-ebx`. Os valores `--ebx-*` são provisórios lá também.

## Forma do estado

```
meta    { tipo: receita|margem|expansao, alvo, prazo, ameaca, medida }   CEO
dados   { fonte, linhas, ativos, areas: { <área>: { ativos, turn, hxp, senior } } }   líder de RH
lider   { <área>: nota 0 a 10 }        inic  [texto]        transc  texto
gestor  { area, trava, meses, obs }
rev     { st: pendente|em ajuste|aprovado, nota }            consultora EBX
plano   { ok, st: { <ação>: Não iniciada|Em andamento|Concluída } }
sem     [{ n, hp, ho }]   semana, mes: relógio simulado      dec: decisão do CEO
msgs    [{ id, para, assunto, corpo, link, rotulo, ts }]     lidas { <id>: true }
```

## Cuidados

- A metodologia é da EBX. Não invente regras de negócio no motor: mude o mapa em `shared/metodologia.js` e mantenha `provisoria: true` até a EBX validar.
- Não prometa causalidade em textos de relatório. O combinado é falar em linha de base e contribuição provável.
- Dados de pessoas são sensíveis (LGPD). Use só dados fictícios neste repositório; `data/` fica fora do Git.
- O que é real e o que é simulado está no README. Ao tornar algo real, atualize essa seção e `docs/decisoes.md`.
