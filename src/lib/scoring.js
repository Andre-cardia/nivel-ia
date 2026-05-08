// scoring.js — Motor de pontuação do questionário Nível IA
// Modelo híbrido: objetivas = 0/1pt (gabarito), escalares = 0-3pts (A/B/C/D)
// Max = 39 pts (18 objetivas × 1 + 7 escalares × 3)

const SCORE_MAP = { A: 0, B: 1, C: 2, D: 3 }

// Gabarito das 18 questões objetivas (resposta correta = 1pt, incorreta = 0)
export const CORRECT_ANSWERS = {
  1: 'B', 2: 'C', 3: 'B', 4: 'B', 5: 'A', 6: 'B',
  9: 'B', 11: 'C', 12: 'C', 13: 'B', 14: 'B', 15: 'B',
  16: 'B', 17: 'B', 18: 'B', 19: 'B', 20: 'A', 21: 'B',
}

// IDs das 7 questões com escala progressiva (frequência / autopercepção)
export const SCALE_QUESTIONS = new Set([7, 8, 10, 22, 23, 24, 25])

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

// Pontuação máxima real por dimensão no modelo híbrido
export const DIMENSION_MAX = {
  conhecimento_geral:    3,   // Q1,2,3 objetivas
  ia_generativa:         3,   // Q4,5,6 objetivas
  uso_pratico:           7,   // Q7=3, Q8=3, Q9=1
  estrategia:            5,   // Q10=3, Q11=1, Q12=1
  dados_decisao:         3,   // Q13,14,15 objetivas
  riscos_etica:          3,   // Q16,17,18 objetivas
  agentes_ia:            3,   // Q19,20,21 objetivas
  maturidade_executiva:  12,  // Q22,23,24,25 escalares × 3
}

export const MAX_SCORE = 39

export const LEVELS = [
  {
    key: 'inicial',
    label: 'Nível Inicial',
    min: 0,
    max: 9,
    description: 'O executivo tem pouco contato com IA, ainda confunde conceitos básicos e precisa de letramento introdutório.',
    recommendation: 'Treinamento introdutório sobre fundamentos de IA, IA Generativa, exemplos práticos e impactos no negócio.',
  },
  {
    key: 'basico',
    label: 'Nível Básico',
    min: 10,
    max: 19,
    description: 'O executivo entende algumas ideias gerais, mas ainda possui lacunas importantes sobre IA Generativa, dados, riscos e aplicação prática.',
    recommendation: 'Capacitação com foco em uso prático, produtividade executiva, prompts, análise de casos e oportunidades por área.',
  },
  {
    key: 'intermediario',
    label: 'Nível Intermediário',
    min: 20,
    max: 29,
    description: 'O executivo já compreende bem os fundamentos, consegue identificar usos relevantes e tem alguma visão de aplicação no negócio.',
    recommendation: 'Workshop avançado com foco em estratégia, automação, agentes de IA, governança e priorização de casos de uso.',
  },
  {
    key: 'avancado',
    label: 'Nível Avançado',
    min: 30,
    max: 39,
    description: 'O executivo demonstra boa maturidade conceitual, prática e estratégica sobre IA, com capacidade de discutir oportunidades, riscos e implantação.',
    recommendation: 'Trabalhar roadmap executivo de IA, governança, indicadores, projetos-piloto, transformação organizacional e adoção em escala.',
  },
]

/** Pontuação de uma questão individual pelo modelo híbrido */
function scoreQuestion(questionId, answer) {
  if (answer == null) return 0
  if (SCALE_QUESTIONS.has(questionId)) return SCORE_MAP[answer] ?? 0
  return CORRECT_ANSWERS[questionId] === answer ? 1 : 0
}

/** Calcula pontuação total a partir do mapa de respostas { [questionId]: 'A'|'B'|'C'|'D' } */
export function calculateTotalScore(answers) {
  return Object.entries(answers).reduce((sum, [id, opt]) => sum + scoreQuestion(Number(id), opt), 0)
}

/** Calcula pontuação por dimensão */
export function calculateDimensionScores(answers) {
  return Object.entries(DIMENSIONS).reduce((acc, [dim, questions]) => {
    acc[dim] = questions.reduce((s, q) => s + scoreQuestion(q, answers[q]), 0)
    return acc
  }, {})
}

/** Determina o nível baseado na pontuação total */
export function determineLevel(totalScore) {
  return LEVELS.find(l => totalScore >= l.min && totalScore <= l.max) ?? LEVELS[0]
}
