# Contexto do produto

Registro do raciocínio por trás do Raio-X, para quem for evoluir este repositório. Atualizado em 15 de novembro de 2026.

## De onde veio

A EBX é reconhecida por atuar com RH estratégico. As fundadoras, Kelly Barra e Larissa Mendes, vinham desenhando um produto de tecnologia centrado em um servidor MCP que conecta dados de RH a um assistente de IA.

Em reunião de 13 de novembro de 2026, elas abandonaram esse formato. O motivo: um chat sobre dados pressupõe que o RH sabe o que perguntar, e ele não sabe. O MCP deixou de ser o centro e passou a ser um dos meios de coleta.

Cadimo Duarte atua como consultor de tecnologia: afere a viabilidade e testa como o produto funcionaria.

## O problema

O RH trabalha muito e não consegue mostrar o que move o resultado do negócio. Exemplos trazidos pelas fundadoras:

- Semanas dedicadas a um roadshow de cultura cuja única métrica é o número de cidades visitadas.
- Turnover e absenteísmo apresentados todo mês, sem dizer o que custam na margem.
- Times grandes de RH que não tracionam resultado e não sabem se têm as pessoas certas nos lugares certos.

Quem assina o cheque é o CEO, não o RH. O produto precisa ser indispensável, não "legal de ter".

## A ideia

O sistema pergunta, cruza os dados e propõe. Três movimentos:

1. **Coleta em escada.** Entrevista com o CEO, arquivos enviados pelo RH e, depois, conectores. Gera valor sem integração.
2. **Motor EBX.** A metodologia da consultoria vira um mapa: meta do negócio, alavanca de pessoas, indicador e ação.
3. **Entrega.** Plano de prioridades (fazer, parar, delegar), alerta semanal e relatório mensal ao CEO.

A referência das fundadoras é o Strava: acompanha, avisa e mostra se o esforço está indo para o lugar certo. A diferença é que o RH não tem um sensor automático, então a coleta precisa ser a mais orgânica possível.

## Ciclo em cinco fases

| Fase | Quem | O que acontece |
| --- | --- | --- |
| 1. Metas | CEO | Entrevista de metas por link |
| 2. Dados | Líder de RH, gestor, BP | Base de pessoas, pesquisa, iniciativas, perguntas ao gestor, transcrições |
| 3. Raio-X | Motor e consultora EBX | Causas com evidência, revisadas antes de chegar ao cliente |
| 4. Plano e rotina | Líder de RH e BP | Aprovação do plano e check-in semanal |
| 5. Resultado | CEO | Relatório mensal e uma decisão |

## Personas e canais

| Persona | Piloto | Versão 1 | Depois |
| --- | --- | --- | --- |
| CEO | Link de entrevista; relatório por e-mail | Igual | Igual |
| Líder de RH | Portal web | Igual | Conectores de folha e ponto |
| BP de RH | E-mail com link para o check-in | WhatsApp ou Teams | Leitura de agenda |
| Gestor de área | E-mail com link para três perguntas | WhatsApp ou Teams | Igual |
| Consultora EBX | Console de revisão | Igual | Igual |
| Entrada sem pessoa | Encaminhar transcrições e planilhas a um e-mail do Raio-X | Igual | Assistente de reunião |

O piloto usa só canais que não dependem de aprovação de terceiros. WhatsApp exige conta Business e modelos aprovados; Teams exige aprovação do TI do cliente.

## Sistemas do piloto

1. Aplicação web única: portal, formulários por link e console.
2. Banco de dados separado por cliente.
3. Motor de IA: um modelo de linguagem que lê arquivos e transcrições e usa o mapa EBX.
4. E-mail: envio de links e relatórios, e recebimento do que for encaminhado.
5. Agendador: check-in semanal e relatório mensal.

## Oferta em discussão

Três degraus: diagnóstico inicial gratuito (entrevista e uploads), plano com rotina viva (assinatura) e plano integrado (assinatura e implantação, com conectores). Preços não definidos.

## Parecer de viabilidade

Viável como piloto assistido, sem integração com os sistemas do cliente. O maior risco não é a tecnologia: é o diagnóstico automático chegar perto do que as fundadoras diriam em uma consultoria, e o RH e o CEO usarem o que recebem.

Três testes propostos, em ordem:

1. **Comparação às cegas (2 semanas).** Três casos já atendidos; o sistema gera o diagnóstico com os mesmos dados. Segue se as fundadoras assinariam 2 de 3 com ajustes pequenos.
2. **Protótipo com clientes (2 semanas, em paralelo).** Três sessões de 30 minutos. Segue se 2 de 3 pedem para usar com dados próprios.
3. **Piloto assistido (4 a 6 semanas).** Duas empresas. Segue se o check-in é respondido em 3 de cada 4 semanas, o RH muda ao menos uma prioridade e o CEO responde ao relatório.

Os limiares são proposta do consultor e ainda não foram validados com as fundadoras.

## O que depende das fundadoras

- O mapa real para três metas (crescer receita, melhorar margem, abrir unidade).
- Três casos passados, com dados e diagnóstico.
- A lista de dados mínimos que qualquer empresa consegue entregar.
- As perguntas da entrevista do CEO.
- Três pessoas para ver o protótipo e duas empresas para o piloto.
- Horas semanais disponíveis para revisão.

## Riscos

- O CEO não responde à entrevista.
- O RH abandona o check-in.
- A revisão humana não escala.
- Dados de pessoas e transcrições (LGPD).
- Promessa de impacto sem prova de causa.
- O discurso de "time de RH mais enxuto" ameaça o próprio usuário.

## Materiais relacionados

Ficam fora deste repositório, como artefatos do Claude na conta do Cadimo: quadro com conceito, jornada e oferta (também importado no Miro); página de personas e canais; protótipo de página única; apresentação para investidores; parecer de viabilidade em documento e em apresentação. O repositório `erp-ebx` é a origem da identidade visual e do padrão de metodologia em arquivo.
