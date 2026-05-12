/**
 * questions.js — 43 questões do Assessment de Maturidade Executiva em IA
 * Parte 1 (Q1-Q35): questões objetivas de conhecimento aplicado
 * Parte 2 (Q36-Q43): questões de maturidade, frequência e percepção
 */

export const QUESTIONS = [
  // ── 1. Fundamentos de IA (Q1-Q4) ─────────────────────────
  {
    id: 1,
    dimension: 'fundamentos_ia',
    text: 'Uma empresa possui diferentes níveis de maturidade digital entre áreas e dados parcialmente organizados. Qual abordagem tende a gerar maior valor sustentável com IA?',
    options: {
      A: 'Priorizar casos de uso com governança e evolução progressiva de dados e processos.',
      B: 'Concentrar IA apenas em áreas com maior maturidade técnica.',
      C: 'Criar aplicações isoladas para gerar ganhos rápidos de eficiência.',
      D: 'Expandir rapidamente iniciativas de IA para acelerar aprendizado organizacional.',
    },
  },
  {
    id: 2,
    dimension: 'fundamentos_ia',
    text: 'Qual cenário melhor representa a evolução de automações tradicionais para soluções baseadas em IA?',
    options: {
      A: 'Substituição integral de automações existentes por IA.',
      B: 'Sistemas orientados a dados que ajustam comportamento conforme contexto e padrões.',
      C: 'Combinação de automação tradicional com modelos baseados em dados.',
      D: 'Uso de IA apenas em tarefas onde regras fixas não funcionam bem.',
    },
  },
  {
    id: 3,
    dimension: 'fundamentos_ia',
    text: 'Qual abordagem representa adoção mais sustentável de IA?',
    options: {
      A: 'Iniciar múltiplos projetos simultaneamente para acelerar maturidade.',
      B: 'Permitir que cada área implemente IA conforme necessidade local.',
      C: 'Evoluir iniciativas priorizadas com alinhamento estratégico e governança.',
      D: 'Centralizar toda iniciativa em TI para manter padronização.',
    },
  },
  {
    id: 4,
    dimension: 'fundamentos_ia',
    text: 'Qual cenário representa uso mais maduro de IA em ambiente corporativo?',
    options: {
      A: 'Uso de IA para automação de tarefas operacionais específicas.',
      B: 'Uso integrado a processos, dados e tomada de decisão organizacional.',
      C: 'Uso de IA em alguns processos críticos com integração parcial.',
      D: 'Uso de IA principalmente para produtividade individual.',
    },
  },

  // ── 2. IA Generativa (Q5-Q8) ──────────────────────────────
  {
    id: 5,
    dimension: 'ia_generativa',
    text: 'Qual papel representa melhor o uso corporativo maduro de IA generativa?',
    options: {
      A: 'Ferramenta de produtividade para atividades administrativas.',
      B: 'Uso em fluxos específicos com revisão humana estruturada.',
      C: 'Integração em processos operacionais e analíticos com governança definida.',
      D: 'Apoio à criação rápida de conteúdo e documentação.',
    },
  },
  {
    id: 6,
    dimension: 'ia_generativa',
    text: 'Qual cenário indica maior maturidade no uso de IA generativa?',
    options: {
      A: 'Uso integrado a fluxos organizacionais com rastreabilidade e controle.',
      B: 'Uso livre sem padronização entre equipes.',
      C: 'Uso recorrente em tarefas específicas e comunicação.',
      D: 'Uso em processos definidos com validação humana.',
    },
  },
  {
    id: 7,
    dimension: 'ia_generativa',
    text: 'Como modelos de linguagem funcionam principalmente?',
    options: {
      A: 'Recuperam respostas prontas de bases de conhecimento pré-definidas.',
      B: 'Aplicam regras linguísticas programadas manualmente para cada pergunta.',
      C: 'Predizem respostas com base em contexto e padrões aprendidos durante o treinamento.',
      D: 'Localizam respostas exatas em bancos de dados internos.',
    },
  },
  {
    id: 8,
    dimension: 'ia_generativa',
    text: 'Uma organização quer usar IA generativa em processos internos. Qual abordagem tende a reduzir risco sem limitar valor?',
    options: {
      A: 'Integrar IA em fluxos com validação, monitoramento e critérios definidos.',
      B: 'Permitir uso apenas em tarefas não críticas.',
      C: 'Restringir IA apenas a áreas criativas.',
      D: 'Liberar uso amplo para acelerar adoção organizacional.',
    },
  },

  // ── 3. Uso Prático (Q9-Q12) ───────────────────────────────
  {
    id: 9,
    dimension: 'uso_pratico',
    text: 'Qual cenário representa uso mais maduro de IA no trabalho?',
    options: {
      A: 'Uso eventual para tarefas específicas.',
      B: 'Uso estruturado integrado a fluxos operacionais e analíticos.',
      C: 'Uso em algumas áreas com integração parcial aos processos.',
      D: 'Uso individual frequente para produtividade pessoal.',
    },
  },
  {
    id: 10,
    dimension: 'uso_pratico',
    text: 'Qual abordagem tende a gerar melhores resultados ao interagir com IA?',
    options: {
      A: 'Fazer múltiplas perguntas até obter uma resposta útil.',
      B: 'Estruturar objetivo, contexto, restrições e formato esperado.',
      C: 'Fazer perguntas rápidas para ganhar velocidade.',
      D: 'Fornecer contexto parcial conforme necessidade.',
    },
  },
  {
    id: 11,
    dimension: 'uso_pratico',
    text: 'Qual cenário indica maior maturidade organizacional no uso de IA?',
    options: {
      A: 'Uso diferente entre áreas sem coordenação.',
      B: 'Uso informal sem padrões definidos.',
      C: 'Uso padronizado com métricas, governança e melhoria contínua.',
      D: 'Uso com diretrizes gerais e alinhamento parcial.',
    },
  },
  {
    id: 12,
    dimension: 'uso_pratico',
    text: 'Uma equipe recebe respostas inconsistentes da IA. Qual ação tende a melhorar a qualidade dos resultados?',
    options: {
      A: 'Refinar contexto, critérios e restrições da solicitação.',
      B: 'Utilizar prompts padronizados em todas as situações.',
      C: 'Repetir a mesma solicitação até obter resposta adequada.',
      D: 'Reduzir a complexidade das perguntas.',
    },
  },

  // ── 4. Dados e Decisão (Q13-Q16) ─────────────────────────
  {
    id: 13,
    dimension: 'dados_decisao',
    text: 'Qual fator mais impacta qualidade e confiabilidade de análises em IA?',
    options: {
      A: 'Velocidade de processamento do modelo.',
      B: 'Quantidade total de dados disponíveis.',
      C: 'Qualidade, consistência e governança dos dados.',
      D: 'Sofisticação técnica da ferramenta utilizada.',
    },
  },
  {
    id: 14,
    dimension: 'dados_decisao',
    text: 'Como IA deve ser utilizada na tomada de decisão?',
    options: {
      A: 'Como suporte estruturado com validação humana e governança.',
      B: 'Como apoio informal para acelerar análises.',
      C: 'Automatizando decisões sempre que possível.',
      D: 'Como suporte em decisões operacionais específicas.',
    },
  },
  {
    id: 15,
    dimension: 'dados_decisao',
    text: 'Qual abordagem tende a gerar análises mais confiáveis com IA?',
    options: {
      A: 'Uso de dados estruturados com critérios claros e validação contínua.',
      B: 'Definição parcial de critérios conforme necessidade.',
      C: 'Uso de dados disponíveis independentemente de padronização.',
      D: 'Exploração ampla sem critérios estruturados.',
    },
  },
  {
    id: 16,
    dimension: 'dados_decisao',
    text: 'Uma organização deseja aumentar confiabilidade das respostas de IA. Qual ação tende a gerar maior impacto?',
    options: {
      A: 'Aumentar volume de dados utilizados.',
      B: 'Melhorar qualidade, estrutura e governança dos dados.',
      C: 'Reduzir variáveis para simplificar análises.',
      D: 'Adotar modelos maiores e mais avançados.',
    },
  },

  // ── 5. Estratégia (Q17-Q20) ───────────────────────────────
  {
    id: 17,
    dimension: 'estrategia',
    text: 'Qual fator é mais importante para escalar IA de forma sustentável?',
    options: {
      A: 'Priorizar projetos com retorno operacional imediato.',
      B: 'Integrar governança, dados e objetivos do negócio.',
      C: 'Coordenar parcialmente iniciativas estratégicas.',
      D: 'Expandir rapidamente iniciativas entre áreas.',
    },
  },
  {
    id: 18,
    dimension: 'estrategia',
    text: 'Qual visão representa maior maturidade estratégica em IA?',
    options: {
      A: 'Ferramenta para aumento de produtividade.',
      B: 'Capacidade estratégica de geração de vantagem competitiva.',
      C: 'Ferramenta para automação operacional.',
      D: 'Capacidade de otimização de processos.',
    },
  },
  {
    id: 19,
    dimension: 'estrategia',
    text: 'Qual nível de alinhamento entre IA e negócio tende a gerar melhores resultados?',
    options: {
      A: 'Alinhamento operacional com metas específicas.',
      B: 'Iniciativas independentes por área.',
      C: 'Integração direta com estratégia organizacional.',
      D: 'Alinhamento informal entre algumas equipes.',
    },
  },
  {
    id: 20,
    dimension: 'estrategia',
    text: 'Como organizações maduras identificam oportunidades de IA?',
    options: {
      A: 'De forma contínua alinhada à estratégia e geração de valor.',
      B: 'Com base em iniciativas isoladas das áreas.',
      C: 'Conforme surgem demandas operacionais.',
      D: 'A partir de projetos específicos de transformação.',
    },
  },

  // ── 6. Riscos, Ética e Governança (Q21-Q24) ──────────────
  {
    id: 21,
    dimension: 'riscos_etica',
    text: 'Qual abordagem representa maior maturidade em governança de IA?',
    options: {
      A: 'Delegar responsabilidade para cada área.',
      B: 'Implementar políticas, monitoramento e governança estruturada.',
      C: 'Aplicar diretrizes gerais sem monitoramento contínuo.',
      D: 'Resolver riscos conforme surgem na operação.',
    },
  },
  {
    id: 22,
    dimension: 'riscos_etica',
    text: 'O que caracteriza uma "alucinação" em IA?',
    options: {
      A: 'Uso de informações desatualizadas na resposta.',
      B: 'Geração de informações plausíveis, mas incorretas.',
      C: 'Resposta simplificada para facilitar interpretação.',
      D: 'Resposta incompleta por limitação de contexto.',
    },
  },
  {
    id: 23,
    dimension: 'riscos_etica',
    text: 'Como dados sensíveis devem ser utilizados em IA?',
    options: {
      A: 'Com governança formal, anonimização e controle de acesso.',
      B: 'Seguindo boas práticas definidas informalmente.',
      C: 'Com restrições internas parcialmente estruturadas.',
      D: 'Conforme necessidade operacional de cada equipe.',
    },
  },
  {
    id: 24,
    dimension: 'riscos_etica',
    text: 'Qual cenário representa uso mais seguro de IA em decisões críticas?',
    options: {
      A: 'Uso de IA apenas como consulta informal.',
      B: 'Uso de IA em análises preliminares sem rastreabilidade.',
      C: 'Uso de IA com validação humana e critérios definidos de supervisão.',
      D: 'Decisões totalmente automatizadas pela IA.',
    },
  },

  // ── 7. Agentes de IA (Q25-Q27) ────────────────────────────
  {
    id: 25,
    dimension: 'agentes_ia',
    text: 'O que melhor caracteriza agentes de IA?',
    options: {
      A: 'Sistemas de automação de tarefas repetitivas.',
      B: 'Sistemas que executam fluxos com regras adaptativas.',
      C: 'Sistemas de resposta automatizada a comandos.',
      D: 'Sistemas que atuam com objetivos, contexto e ferramentas externas.',
    },
  },
  {
    id: 26,
    dimension: 'agentes_ia',
    text: 'Qual cenário representa melhor uso de agentes de IA?',
    options: {
      A: 'Execução de ações orientadas a objetivos definidos.',
      B: 'Resposta automatizada a solicitações simples.',
      C: 'Automação de fluxos com baixa autonomia decisória.',
      D: 'Execução automática de tarefas operacionais fixas.',
    },
  },
  {
    id: 27,
    dimension: 'agentes_ia',
    text: 'Qual prática representa maior maturidade no uso de agentes?',
    options: {
      A: 'Supervisão apenas em atividades críticas.',
      B: 'Uso com permissões, logs e monitoramento contínuo.',
      C: 'Uso experimental sem controle formal.',
      D: 'Autonomia total para maximizar eficiência.',
    },
  },

  // ── 8. Situações Executivas (Q28-Q31) ─────────────────────
  {
    id: 28,
    dimension: 'situacoes_executivas',
    text: 'Uma IA começa a gerar inconsistências em relatórios críticos. Qual abordagem tende a ser mais adequada?',
    options: {
      A: 'Revisar dados, modelo e mecanismos de validação antes de continuar.',
      B: 'Substituir imediatamente a ferramenta utilizada.',
      C: 'Reduzir dependência da IA sem revisar processo.',
      D: 'Manter operação enquanto ajustes graduais são feitos.',
    },
  },
  {
    id: 29,
    dimension: 'situacoes_executivas',
    text: 'Como casos de uso de IA devem ser priorizados?',
    options: {
      A: 'Pela urgência operacional das áreas.',
      B: 'Pelo impacto estratégico e disponibilidade de dados.',
      C: 'Pela facilidade de implementação técnica.',
      D: 'Pelo potencial de automação de tarefas.',
    },
  },
  {
    id: 30,
    dimension: 'situacoes_executivas',
    text: 'Qual abordagem tende a gerar escala sustentável de IA?',
    options: {
      A: 'Crescimento gradual sem governança formal.',
      B: 'Projetos isolados em áreas diferentes.',
      C: 'Expansão estruturada com estratégia e governança.',
      D: 'Expansão rápida sem padronização.',
    },
  },
  {
    id: 31,
    dimension: 'situacoes_executivas',
    text: 'Como IA deve ser utilizada em decisões financeiras relevantes?',
    options: {
      A: 'Apenas em análises exploratórias preliminares.',
      B: 'Como substituição parcial da análise humana.',
      C: 'Como suporte estruturado à decisão humana.',
      D: 'Como mecanismo principal de decisão automatizada.',
    },
  },

  // ── 9. Aplicação Técnica Básica (Q32-Q35) ─────────────────
  {
    id: 32,
    dimension: 'aplicacao_tecnica',
    text: 'Uma resposta de IA ficou genérica e pouco útil. Qual ação tende a melhorar o resultado?',
    options: {
      A: 'Refinar contexto e critérios do prompt.',
      B: 'Simplificar ainda mais a solicitação.',
      C: 'Trocar de ferramenta de IA.',
      D: 'Repetir a mesma pergunta de outra forma.',
    },
  },
  {
    id: 33,
    dimension: 'aplicacao_tecnica',
    text: 'Qual limitação é comum em modelos de linguagem?',
    options: {
      A: 'Dificuldade em lidar com linguagem natural.',
      B: 'Dependência exclusiva de internet em tempo real.',
      C: 'Possibilidade de gerar respostas inconsistentes ou incorretas.',
      D: 'Incapacidade de produzir respostas longas.',
    },
  },
  {
    id: 34,
    dimension: 'aplicacao_tecnica',
    text: 'Qual abordagem tende a ser mais eficiente ao trabalhar com IA?',
    options: {
      A: 'Utilizar prompts fixos para qualquer contexto.',
      B: 'Refinar solicitações progressivamente com base nas respostas obtidas.',
      C: 'Fazer perguntas genéricas para ganhar velocidade.',
      D: 'Buscar o prompt perfeito logo na primeira tentativa.',
    },
  },
  {
    id: 35,
    dimension: 'aplicacao_tecnica',
    text: 'Qual prática representa uso mais seguro de IA com dados corporativos?',
    options: {
      A: 'Utilizar IA apenas com dados públicos.',
      B: 'Compartilhar dados completos para obter respostas mais precisas.',
      C: 'Aplicar anonimização e seguir diretrizes internas de uso de dados.',
      D: 'Remover totalmente contexto corporativo das análises.',
    },
  },

  // ── 10. Maturidade, Frequência e Percepção (Q36-Q43) ──────
  {
    id: 36,
    dimension: 'maturidade_percepcao',
    text: 'Com que frequência você utiliza ferramentas de IA no trabalho?',
    options: {
      A: 'Nunca utilizo.',
      B: 'Utilizo raramente, em testes ou curiosidade.',
      C: 'Utilizo semanalmente em tarefas específicas.',
      D: 'Utilizo diariamente em atividades relevantes da minha rotina.',
    },
  },
  {
    id: 37,
    dimension: 'maturidade_percepcao',
    text: 'Como você avalia sua capacidade de estruturar boas solicitações para IA?',
    options: {
      A: 'Ainda não sei estruturar solicitações com clareza.',
      B: 'Consigo fazer perguntas simples.',
      C: 'Consigo informar objetivo, contexto, formato e restrições.',
      D: 'Consigo estruturar solicitações avançadas, revisar respostas e iterar até obter resultado útil.',
    },
  },
  {
    id: 38,
    dimension: 'maturidade_percepcao',
    text: 'Como você identifica oportunidades de IA na empresa?',
    options: {
      A: 'Ainda não consigo identificar oportunidades claras.',
      B: 'Identifico usos simples e individuais.',
      C: 'Identifico oportunidades em processos da minha área.',
      D: 'Priorizo oportunidades considerando impacto, dados, viabilidade, risco e retorno.',
    },
  },
  {
    id: 39,
    dimension: 'maturidade_percepcao',
    text: 'Qual é o estágio atual da empresa em relação à IA?',
    options: {
      A: 'Não há discussão estruturada.',
      B: 'Existem testes isolados ou iniciativas informais.',
      C: 'Existem iniciativas em algumas áreas.',
      D: 'Existe estratégia, governança, responsáveis, indicadores e projetos priorizados.',
    },
  },
  {
    id: 40,
    dimension: 'maturidade_percepcao',
    text: 'Como você avalia a cultura da empresa para adoção de IA?',
    options: {
      A: 'Há resistência ou desconhecimento generalizado.',
      B: 'Há curiosidade, mas pouca clareza sobre aplicação.',
      C: 'Há abertura para testes, capacitação e experimentação.',
      D: 'Há apoio executivo, comunicação clara e incentivo à adoção responsável.',
    },
  },
  {
    id: 41,
    dimension: 'maturidade_percepcao',
    text: 'Qual é sua familiaridade com conceitos como RAG, agentes, automação, governança e segurança em IA?',
    options: {
      A: 'Não conheço esses conceitos.',
      B: 'Já ouvi falar, mas não sei explicar.',
      C: 'Consigo explicar de forma geral.',
      D: 'Consigo relacionar esses conceitos a aplicações práticas na empresa.',
    },
  },
  {
    id: 42,
    dimension: 'maturidade_percepcao',
    text: 'Como você decide se uma iniciativa de IA vale a pena?',
    options: {
      A: 'Pela novidade da ferramenta.',
      B: 'Pela tendência de mercado ou recomendação de terceiros.',
      C: 'Pelo potencial de ganho de produtividade, redução de custo ou melhoria operacional.',
      D: 'Pela combinação entre problema, impacto, dados, viabilidade, risco, governança e retorno esperado.',
    },
  },
  {
    id: 43,
    dimension: 'maturidade_percepcao',
    text: 'Como você avalia sua capacidade de liderar ou patrocinar uma iniciativa de IA?',
    options: {
      A: 'Ainda não me sinto preparado.',
      B: 'Consigo apoiar discussões iniciais.',
      C: 'Consigo participar da definição de casos de uso e critérios de sucesso.',
      D: 'Consigo orientar prioridades, riscos, governança, indicadores e adoção organizacional.',
    },
  },
]

export const TOTAL_QUESTIONS = QUESTIONS.length
