/**
 * scoring.js — Motor de pontuação do questionário Nível IA
 * A=0, B=1, C=2, D=3 | Max = 75 pts
 */

export const SCORE_MAP = { A: 0, B: 1, C: 2, D: 3 }

export const DIMENSIONS = {
  conhecimento_geral:    [1, 2, 3],
  ia_generativa:         [4, 5, 6],
  uso_pratico:           [7, 8, 9],
  estrategia:            [10, 11, 12],
  dados_decisao:         [13, 14, 15],
  riscos_etica:          [16, 17, 18],
  agentes_ia:            [19, 20, 21],
  maturidade_executiva:  [22, 23, 24, 25],
}

export const DIMENSION_LABELS = {
  conhecimento_geral:    'Conhecimento Geral',
  ia_generativa:         'IA Generativa',
  uso_pratico:           'Uso Prático',
  estrategia:            'Estratégia',
  dados_decisao:         'Dados e Decisão',
  riscos_etica:          'Riscos e Ética',
  agentes_ia:            'Agentes de IA',
  maturidade_executiva:  'Maturidade Executiva',
}

export const LEVELS = [
  {
    key: 'inicial',
    label: 'Nível Inicial',
    min: 0,
    max: 18,
    description: 'O executivo possui pouca familiaridade com IA. Pode ter ouvido falar sobre o tema, mas ainda não compreende bem conceitos, aplicações, riscos ou oportunidades.',
    recommendation: 'Treinamento introdutório sobre fundamentos de IA, IA Generativa, exemplos práticos e impactos no negócio.',
  },
  {
    key: 'basico',
    label: 'Nível Básico',
    min: 19,
    max: 37,
    description: 'O executivo entende alguns conceitos gerais e já percebe aplicações possíveis, mas ainda precisa desenvolver visão prática, estratégica e crítica sobre o uso da IA.',
    recommendation: 'Capacitação com foco em uso prático, produtividade executiva, prompts, análise de casos e oportunidades por área.',
  },
  {
    key: 'intermediario',
    label: 'Nível Intermediário',
    min: 38,
    max: 56,
    description: 'O executivo já compreende aplicações relevantes de IA, riscos básicos e oportunidades de uso em processos corporativos.',
    recommendation: 'Workshop avançado com foco em estratégia, automação, agentes de IA, governança e priorização de casos de uso.',
  },
  {
    key: 'avancado',
    label: 'Nível Avançado',
    min: 57,
    max: 75,
    description: 'O executivo demonstra boa compreensão técnica e estratégica sobre IA, conseguindo relacionar a tecnologia com competitividade, eficiência e inovação.',
    recommendation: 'Trabalhar roadmap executivo de IA, governança, indicadores, projetos-piloto, transformação organizacional e adoção em escala.',
  },
]

/** Calcula pontuação total a partir do mapa de respostas { [questionNumber]: 'A'|'B'|'C'|'D' } */
export function calculateTotalScore(answers) {
  return Object.values(answers).reduce((sum, opt) => sum + (SCORE_MAP[opt] ?? 0), 0)
}

/** Calcula pontuação por dimensão */
export function calculateDimensionScores(answers) {
  return Object.entries(DIMENSIONS).reduce((acc, [dim, questions]) => {
    acc[dim] = questions.reduce((s, q) => s + (SCORE_MAP[answers[q]] ?? 0), 0)
    return acc
  }, {})
}

/** Determina o nível baseado na pontuação total */
export function determineLevel(totalScore) {
  return LEVELS.find(l => totalScore >= l.min && totalScore <= l.max) ?? LEVELS[0]
}
