# EBX Raio-X: protótipos navegáveis

Demonstração local do Raio-X, o produto que liga as metas do negócio ao trabalho do RH. Cada canal é uma aplicação separada e todas compartilham o mesmo estado: o que uma persona faz aparece nas outras na hora.

O objetivo é tornar a ideia palpável para aferir a viabilidade. Não é o produto: veja [o que é real e o que é simulado](#o-que-é-real-e-o-que-é-simulado).

## Rodar

Precisa só de Node 18 ou mais recente. Não há dependências para instalar.

```bash
node server.mjs
```

Abra `http://localhost:4173`. O terminal também mostra o endereço para abrir no celular, na mesma rede. Para usar outra porta: `PORT=8080 node server.mjs`.

O estado fica em `data/state.json` (fora do Git). O botão "Zerar a demo" no painel recomeça tudo.

## Na internet (Render)

A demo também fica em <https://ebx-raiox.onrender.com>, um serviço web do Render (`npm install`, `node server.mjs`) que publica de novo a cada commit em `main`. O plano é o gratuito: o serviço dorme depois de 15 minutos sem acesso (a primeira abertura leva perto de um minuto) e o estado volta ao zero quando ele reinicia. O endereço é público e a entrada é uma credencial única e simples, então use só dados fictícios.

## Aplicações e canais

| Persona | Canal | Aplicação | Endereço |
| --- | --- | --- | --- |
| Todos | Painel da demo e relógio simulado | `apps/hub` | `/` |
| Todos | E-mail simulado, com caixa de entrada por persona | `apps/email` | `/email/?de=ceo` |
| Todos | Tela de entrada da demo | `apps/login` | `/login/` |
| CEO | Entrevista de metas por link, sem login | `apps/entrevista` | `/entrevista/` |
| CEO | Relatório mensal com uma decisão | `apps/relatorio` | `/relatorio/` |
| Líder de RH | Portal web: dados, raio-X, plano e time | `apps/portal` | `/portal/` |
| BP de RH | Check-in semanal por link | `apps/checkin` | `/checkin/` |
| Gestor de área | Três perguntas por link | `apps/gestor` | `/gestor/` |
| BP e gestor | WhatsApp ou Teams simulado (versão 1) | `apps/mensagens` | `/mensagens/?de=bp` |
| Consultora EBX | Console de revisão e mapa EBX | `apps/console` | `/console/` |

No piloto, CEO, BP e gestor recebem um e-mail curto com um link. A aplicação `mensagens` mostra o mesmo fluxo dentro de uma conversa, que é o canal previsto para a versão 1.

## Roteiro de demonstração

O passo a passo, com o que falar em cada tela, está em [docs/roteiro-demo.md](docs/roteiro-demo.md). Em resumo:

1. CEO abre o e-mail e responde a entrevista.
2. Líder de RH envia a base de pessoas pelo portal; gestor responde as perguntas; BP encaminha uma transcrição.
3. Consultora EBX revisa e libera o diagnóstico no console.
4. Líder de RH aprova o plano; BP faz o check-in da semana.
5. No painel, feche o mês; o CEO recebe o relatório e decide.

Para pular a coleta, use "Preencher as fases 1 e 2 com o exemplo" no painel.

## O que é real e o que é simulado

Funciona de verdade:

- Leitura de CSV (`area;admissao;desligamento;horas_extras`) e cálculo de turnover, hora extra e tempo de casa por área.
- Diagnóstico a partir do mapa meta, alavanca, indicador e ação, com evidências e grau de confiança.
- Classificação das iniciativas do RH em fazer, parar, delegar e manter.
- Estado único entre as aplicações, com atualização ao vivo entre abas e aparelhos.

Está simulado:

- **Inteligência.** O motor usa regras e palavras-chave (`shared/motor.js`). No produto, um modelo de linguagem lê arquivos e transcrições e usa o mesmo mapa.
- **Envio de mensagens.** Nenhum e-mail, WhatsApp ou Teams é enviado. As mensagens aparecem nas aplicações `email` e `mensagens`.
- **Agendador.** O check-in semanal e o relatório mensal são disparados pelos botões do painel.
- **Acesso.** Há uma tela de entrada (`/login/`) com uma credencial fixa, igual para todos, conferida no servidor. Não há usuários, perfis nem separação por empresa; os links "sem login" do CEO, do BP e do gestor abrem depois dessa entrada.
- **Mapa EBX.** O conteúdo de `shared/metodologia.js` é provisório.

## Estrutura

```
server.mjs            servidor local: arquivos, estado, entrada e aviso às telas abertas
apps/<nome>/          uma aplicação por canal (index.html + app.js)
shared/metodologia.js mapa EBX: é aqui que a metodologia real entra
shared/motor.js       diagnóstico e classificação das iniciativas
shared/dados.js       base de exemplo, leitura de CSV e indicadores
shared/fluxo.js       quem recebe qual mensagem, e quando
shared/store.js       estado compartilhado e sincronização
shared/ui.js          peças de interface comuns
shared/tema.js        tema claro ou escuro, guardado no navegador
shared/ebx.css        identidade visual do ERP EBX
exemplos/             CSV e transcrição para testar os envios
scripts/              teste de fluxo (npm test)
docs/                 contexto do produto, decisões, backlog e roteiro de demo
```

## Testar

```bash
npm test
```

Percorre o ciclo inteiro por todas as aplicações com um navegador simulado e falha se alguma tela quebrar.

## Contexto para evoluir

- [docs/contexto-produto.md](docs/contexto-produto.md): o problema, a ideia, personas, canais e o parecer de viabilidade.
- [docs/decisoes.md](docs/decisoes.md): o que já foi decidido e por quê.
- [docs/backlog.md](docs/backlog.md): próximas evoluções e dívidas conhecidas.
- [CLAUDE.md](CLAUDE.md): convenções do código, lidas automaticamente pelo Claude Code.
