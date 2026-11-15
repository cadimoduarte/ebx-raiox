# Registro de decisões

Uma linha por decisão, da mais recente para a mais antiga. Ao mudar uma decisão, acrescente uma linha nova em vez de editar a antiga.

| Data | Decisão | Motivo |
| --- | --- | --- |
| 2026-11-15 | A demo inteira fica atrás de uma tela de entrada com credencial fixa, conferida no servidor; o código guarda só o resumo (scrypt) e `LOGIN_HASH` troca a credencial | Pedido do Cadimo, para o endereço público não ficar aberto; não é o controle de acesso do produto |
| 2026-11-15 | A demo fica publicada no Render, plano gratuito, a partir de `main`, sem disco persistente | Mostrar a demo por link, sem instalar nada; o estado pode zerar a cada reinício porque os dados são fictícios |
| 2026-11-15 | O contexto do projeto fica no repositório: `CLAUDE.md` para instruções e `docs/` para produto, decisões e backlog | Sessões futuras começam sem a conversa original |
| 2026-11-15 | Há um teste de fluxo (`npm test`) com navegador simulado, sem dependências | Verificar o ciclo inteiro depois de cada mudança |
| 2026-11-15 | Um canal por aplicação, em `apps/`, com estado único em um servidor Node sem dependências | Demonstrar localmente, em várias abas e aparelhos, sem instalação |
| 2026-11-15 | Sincronização por SSE e gravação do estado inteiro, última escrita vence | Simplicidade; é uma demo com uma pessoa por vez em cada tela |
| 2026-11-15 | As mensagens entre personas nascem do estado (`shared/fluxo.js`), com ids fixos | Evita duplicar mensagens e mantém o fluxo em um arquivo só |
| 2026-11-15 | O piloto usa e-mail com link; WhatsApp e Teams ficam para a versão 1 | Não dependem de aprovação da Meta nem do TI do cliente |
| 2026-11-15 | O agendador é simulado por botões no painel (avançar semana, fechar mês) | Mostrar a rotina sem esperar o tempo passar |
| 2026-11-14 | A identidade visual segue o ERP EBX (`erp-ebx/src/colors.css`) | Pedido do Cadimo; os valores `--ebx-*` são provisórios no próprio ERP |
| 2026-11-14 | A metodologia fica em um arquivo de dados separado da lógica | Mesmo padrão do agente HRBP do ERP; a EBX troca o conteúdo sem mexer no código |
| 2026-11-14 | O motor usa regras e palavras-chave, sem modelo de linguagem | Protótipo; o modelo entra quando houver mapa real para comparar |
| 2026-11-14 | Todo diagnóstico passa pela revisão da EBX antes de chegar ao cliente | Qualidade no piloto; cada ajuste deve virar regra no mapa |
| 2026-11-14 | O relatório fala em linha de base e contribuição provável, nunca em causa | Atribuição causal não é demonstrável com esses dados |
| 2026-11-13 | O produto deixa de ser um chat sobre dados via MCP e passa a ser um diagnóstico contínuo e proativo | Decisão das fundadoras: o RH não sabe o que perguntar |
