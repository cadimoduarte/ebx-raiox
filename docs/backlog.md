# Backlog de evolução

Ordenado pelo que mais reduz incerteza. Ao concluir um item, mova-o para "Feito" com a data.

## Próximos

1. **Mapa real da EBX.** Substituir o conteúdo de `shared/metodologia.js` pelo mapa das fundadoras para três metas. Depende delas.
2. **Modelo de linguagem no diagnóstico.** Gerar causas e evidências com um modelo que recebe o mapa como contexto, mantendo o motor de regras como comparação. A chave de API fica em variável de ambiente no servidor, nunca no navegador.
3. **Leitura de transcrições por modelo de linguagem.** Trocar a busca por palavras-chave em `RX.motor.sinais` e `compromissos`.
4. **Comparação às cegas.** Tela no console para colocar lado a lado o diagnóstico do sistema e o das fundadoras em três casos (teste 1 do parecer).
5. **Mais de uma empresa.** Hoje o estado é único. Separar por cliente para rodar o piloto com duas empresas.
6. **Vários BPs e gestores.** O estado guarda um gestor e um BP. Virar listas, com o resumo por pessoa na aba Time.

## Depois

- Envio real de e-mail e recebimento de anexos.
- Agendador real no lugar do relógio do painel.
- Login por empresa e papéis por persona.
- Banco de dados no lugar de `data/state.json`.
- WhatsApp ou Teams de verdade.
- Leitura de agenda (Google e Microsoft).
- Conectores de folha e ponto via MCP, a partir do servidor `mcp-ebx`.
- Medição: segunda leitura dos indicadores para comparar com a linha de base.

## Dívidas conhecidas do protótipo

- As telas não foram conferidas em navegador quando foram criadas; só o fluxo foi testado por script.
- Gravação do estado inteiro a cada mudança: duas pessoas salvando ao mesmo tempo podem se sobrescrever.
- A extração de compromissos usa uma expressão regular com lookbehind, que navegadores antigos não aceitam.
- O nome do cliente no console ("Chocalhos Brasil") está fixo no código.

## Feito

- 2026-11-15: nove aplicações por canal, servidor local, fluxo de mensagens, exemplos, roteiro de demo e teste de fluxo.
