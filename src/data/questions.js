/**
 * questions.js — 25 questões estáticas do diagnóstico Nível IA
 * Carregadas no frontend sem fetch de rede (instantâneo)
 */

export const QUESTIONS = [
  // ── DIMENSÃO 1: Conhecimento Geral (1-3) ─────────────────
  {
    id: 1,
    dimension: 'conhecimento_geral',
    text: 'Como você definiria Inteligência Artificial?',
    options: {
      A: 'Um sistema que substitui completamente o trabalho humano.',
      B: 'Uma tecnologia capaz de executar tarefas que normalmente exigiriam algum tipo de inteligência humana.',
      C: 'Um software usado apenas para criar imagens e textos.',
      D: 'Uma ferramenta exclusiva para empresas de tecnologia.',
    },
  },
  {
    id: 2,
    dimension: 'conhecimento_geral',
    text: 'Qual alternativa melhor representa uma aplicação prática de IA nas empresas?',
    options: {
      A: 'Enviar e-mails manualmente para clientes.',
      B: 'Criar relatórios impressos sem análise de dados.',
      C: 'Analisar grandes volumes de dados para apoiar decisões.',
      D: 'Armazenar arquivos em pastas locais.',
    },
  },
  {
    id: 3,
    dimension: 'conhecimento_geral',
    text: 'Na sua visão, a IA atualmente é mais útil para:',
    options: {
      A: 'Apenas substituir pessoas.',
      B: 'Apoiar decisões, automatizar tarefas e ampliar produtividade.',
      C: 'Criar conteúdos sem necessidade de revisão.',
      D: 'Resolver qualquer problema sem dados ou contexto.',
    },
  },

  // ── DIMENSÃO 2: IA Generativa (4-6) ──────────────────────
  {
    id: 4,
    dimension: 'ia_generativa',
    text: 'O que é IA Generativa?',
    options: {
      A: 'Uma IA usada apenas para cálculos financeiros.',
      B: 'Uma IA capaz de criar novos conteúdos, como textos, imagens, códigos, áudios e vídeos.',
      C: 'Um sistema que apenas armazena documentos.',
      D: 'Uma ferramenta usada somente por programadores.',
    },
  },
  {
    id: 5,
    dimension: 'ia_generativa',
    text: 'Qual das opções abaixo é um exemplo de IA Generativa?',
    options: {
      A: 'ChatGPT, Claude ou Gemini.',
      B: 'Planilha de Excel sem automação.',
      C: 'Sistema de ponto eletrônico tradicional.',
      D: 'Impressora corporativa.',
    },
  },
  {
    id: 6,
    dimension: 'ia_generativa',
    text: 'Um modelo de linguagem, como o ChatGPT, funciona principalmente com base em:',
    options: {
      A: 'Busca simples em sites da internet.',
      B: 'Previsão e geração de linguagem a partir de padrões aprendidos em grandes volumes de dados.',
      C: 'Cópia exata de textos armazenados.',
      D: 'Regras fixas escritas manualmente para cada pergunta.',
    },
  },

  // ── DIMENSÃO 3: Uso Prático (7-9) ────────────────────────
  {
    id: 7,
    dimension: 'uso_pratico',
    text: 'Com que frequência você utiliza ferramentas de IA no trabalho?',
    options: {
      A: 'Nunca utilizei.',
      B: 'Raramente.',
      C: 'Algumas vezes por semana.',
      D: 'Todos os dias.',
    },
  },
  {
    id: 8,
    dimension: 'uso_pratico',
    text: 'Para quais atividades você já utilizou IA?',
    options: {
      A: 'Nunca utilizei.',
      B: 'Apenas curiosidade ou testes simples.',
      C: 'Criação de textos, resumos, ideias ou análises.',
      D: 'Apoio recorrente em decisões, produtividade, planejamento ou gestão.',
    },
  },
  {
    id: 9,
    dimension: 'uso_pratico',
    text: 'Em uma rotina executiva, qual uso da IA tende a gerar mais valor?',
    options: {
      A: 'Substituir completamente o julgamento humano.',
      B: 'Automatizar tarefas repetitivas, acelerar análises e apoiar decisões.',
      C: 'Criar respostas sem validação.',
      D: 'Usar IA apenas para apresentações visuais.',
    },
  },

  // ── DIMENSÃO 4: Estratégia (10-12) ───────────────────────
  {
    id: 10,
    dimension: 'estrategia',
    text: 'Como você avalia o impacto da IA na competitividade da sua empresa?',
    options: {
      A: 'Nenhum impacto relevante.',
      B: 'Impacto pequeno e limitado a algumas áreas.',
      C: 'Impacto importante em produtividade, inovação e eficiência.',
      D: 'Impacto crítico para o futuro do negócio.',
    },
  },
  {
    id: 11,
    dimension: 'estrategia',
    text: 'Na sua opinião, a IA deve ser tratada pela empresa como:',
    options: {
      A: 'Uma tendência passageira.',
      B: 'Uma ferramenta pontual para algumas tarefas.',
      C: 'Um recurso estratégico para melhorar processos, produtos e decisões.',
      D: 'Um tema exclusivo da área de tecnologia.',
    },
  },
  {
    id: 12,
    dimension: 'estrategia',
    text: 'Qual área da empresa você acredita que pode se beneficiar mais da IA?',
    options: {
      A: 'Nenhuma área.',
      B: 'Apenas tecnologia.',
      C: 'Marketing, vendas, atendimento, RH, financeiro, operações e gestão.',
      D: 'Apenas comunicação interna.',
    },
  },

  // ── DIMENSÃO 5: Dados e Decisão (13-15) ──────────────────
  {
    id: 13,
    dimension: 'dados_decisao',
    text: 'Qual é a relação entre dados e Inteligência Artificial?',
    options: {
      A: 'IA não depende de dados.',
      B: 'Dados são fundamentais para treinar, alimentar ou orientar sistemas de IA.',
      C: 'Dados só servem para relatórios financeiros.',
      D: 'IA funciona melhor quando não recebe contexto.',
    },
  },
  {
    id: 14,
    dimension: 'dados_decisao',
    text: 'Para obter melhores respostas de uma ferramenta de IA, é importante:',
    options: {
      A: 'Fazer perguntas vagas.',
      B: 'Fornecer contexto, objetivo, restrições e critérios claros.',
      C: 'Pedir respostas genéricas.',
      D: 'Evitar explicar o problema.',
    },
  },
  {
    id: 15,
    dimension: 'dados_decisao',
    text: 'Quando uma IA apresenta uma resposta, o executivo deve:',
    options: {
      A: 'Aceitar automaticamente.',
      B: 'Validar criticamente, considerando contexto, dados e riscos.',
      C: 'Usar sem revisar.',
      D: 'Compartilhar diretamente com clientes.',
    },
  },

  // ── DIMENSÃO 6: Riscos e Ética (16-18) ───────────────────
  {
    id: 16,
    dimension: 'riscos_etica',
    text: 'Qual é um risco importante no uso de IA Generativa?',
    options: {
      A: 'Ela nunca erra.',
      B: 'Ela pode gerar informações incorretas, imprecisas ou inventadas.',
      C: 'Ela não depende de orientação humana.',
      D: 'Ela elimina qualquer necessidade de governança.',
    },
  },
  {
    id: 17,
    dimension: 'riscos_etica',
    text: 'O que são "alucinações" em IA?',
    options: {
      A: 'Quando a IA melhora uma resposta automaticamente.',
      B: 'Quando a IA gera uma resposta falsa ou imprecisa com aparência de verdade.',
      C: 'Quando a IA acessa dados confidenciais corretamente.',
      D: 'Quando a IA cria imagens realistas.',
    },
  },
  {
    id: 18,
    dimension: 'riscos_etica',
    text: 'Ao usar IA com dados da empresa, o cuidado mais importante é:',
    options: {
      A: 'Inserir qualquer informação sem restrição.',
      B: 'Evitar compartilhar dados sensíveis, confidenciais ou estratégicos em ferramentas não autorizadas.',
      C: 'Usar apenas informações financeiras.',
      D: 'Não informar ninguém sobre o uso.',
    },
  },

  // ── DIMENSÃO 7: Agentes de IA (19-21) ────────────────────
  {
    id: 19,
    dimension: 'agentes_ia',
    text: 'O que melhor define um agente de IA?',
    options: {
      A: 'Um chatbot que apenas responde perguntas simples.',
      B: 'Um sistema capaz de executar tarefas com algum grau de autonomia, usando ferramentas, dados e instruções.',
      C: 'Um robô físico industrial.',
      D: 'Um software de planilha.',
    },
  },
  {
    id: 20,
    dimension: 'agentes_ia',
    text: 'Qual exemplo representa melhor um agente de IA em uma empresa?',
    options: {
      A: 'Um assistente que consulta dados, gera relatório e envia resumo para o gestor.',
      B: 'Uma calculadora comum.',
      C: 'Um arquivo PDF salvo no computador.',
      D: 'Um e-mail escrito manualmente.',
    },
  },
  {
    id: 21,
    dimension: 'agentes_ia',
    text: 'Qual o principal cuidado ao implementar agentes de IA?',
    options: {
      A: 'Dar autonomia total sem controle.',
      B: 'Definir limites, validações, permissões, auditoria e supervisão humana.',
      C: 'Evitar qualquer tipo de monitoramento.',
      D: 'Não documentar processos.',
    },
  },

  // ── DIMENSÃO 8: Maturidade Executiva (22-25) ─────────────
  {
    id: 22,
    dimension: 'maturidade_executiva',
    text: 'Como você avalia seu conhecimento atual sobre IA?',
    options: {
      A: 'Muito baixo.',
      B: 'Básico.',
      C: 'Intermediário.',
      D: 'Avançado.',
    },
  },
  {
    id: 23,
    dimension: 'maturidade_executiva',
    text: 'Como você avalia sua capacidade de identificar oportunidades de IA no negócio?',
    options: {
      A: 'Ainda não consigo identificar.',
      B: 'Consigo perceber algumas possibilidades simples.',
      C: 'Consigo identificar oportunidades em processos e áreas específicas.',
      D: 'Consigo pensar IA de forma estratégica e integrada ao negócio.',
    },
  },
  {
    id: 24,
    dimension: 'maturidade_executiva',
    text: 'Sua empresa já discute IA de forma estruturada?',
    options: {
      A: 'Não.',
      B: 'Apenas de forma pontual ou informal.',
      C: 'Sim, em algumas áreas ou projetos.',
      D: 'Sim, com estratégia, governança e iniciativas em andamento.',
    },
  },
  {
    id: 25,
    dimension: 'maturidade_executiva',
    text: 'Qual frase melhor representa sua visão sobre IA?',
    options: {
      A: 'Ainda não vejo aplicação prática para o meu trabalho.',
      B: 'Vejo potencial, mas ainda não sei como aplicar.',
      C: 'Já uso ou consigo imaginar aplicações úteis.',
      D: 'Considero IA essencial para a evolução da empresa.',
    },
  },
]

export const TOTAL_QUESTIONS = QUESTIONS.length
