import { QUESTIONS } from '../data/questions.js'

export const CORRECT_ANSWERS = Object.fromEntries(
  QUESTIONS.filter(question => question.correctAnswer).map(question => [question.id, question.correctAnswer]),
)

export const DIMENSIONS = QUESTIONS.reduce((dimensions, question) => {
  if (!question.correctAnswer) return dimensions
  dimensions[question.dimension] = [...(dimensions[question.dimension] ?? []), question.id]
  return dimensions
}, {})

export const DIMENSION_LABELS = {
  fundamentos_ia: 'Fundamentos de IA',
  ia_generativa: 'IA Generativa',
  uso_pratico: 'Uso Prático',
  dados_decisao: 'Dados & Decisão',
  estrategia: 'Estratégia',
  riscos_etica: 'Riscos & Ética',
  agentes_ia: 'Agentes de IA',
  situacoes_executivas: 'Situações Executivas',
  aplicacao_tecnica: 'Aplicação Técnica Básica',
}

export const DIMENSION_MAX = Object.fromEntries(
  Object.entries(DIMENSIONS).map(([dimension, questionIds]) => [dimension, questionIds.length]),
)

export const MAX_SCORE = Object.keys(CORRECT_ANSWERS).length
export const MAX_OBJECTIVE_SCORE = MAX_SCORE

// Mantido exclusivamente para renderizar classificações históricas já gravadas.
export const LEVELS = [
  { key: 'inicial', label: 'Nível Inicial', min: 0, max: 7 },
  { key: 'basico', label: 'Nível Básico', min: 8, max: 14 },
  { key: 'intermediario', label: 'Nível Intermediário', min: 15, max: 21 },
  { key: 'avancado', label: 'Nível Avançado', min: 22, max: 26 },
  { key: 'estrategico', label: 'Nível Estratégico', min: 27, max: 29 },
]

export function scoreQuestion(questionId, answer) {
  return CORRECT_ANSWERS[questionId] === answer ? 1 : 0
}

export function calculateTotalScore(answers) {
  return Object.entries(CORRECT_ANSWERS).reduce(
    (sum, [questionId]) => sum + scoreQuestion(Number(questionId), answers[questionId]),
    0,
  )
}

export const calculateObjectiveScore = calculateTotalScore

export function calculateDimensionScores(answers) {
  return Object.entries(DIMENSIONS).reduce((scores, [dimension, questionIds]) => {
    scores[dimension] = questionIds.reduce(
      (sum, questionId) => sum + scoreQuestion(questionId, answers[questionId]),
      0,
    )
    return scores
  }, {})
}

export function buildAnswerDetails(answers) {
  return QUESTIONS.map(question => ({
    question_number: question.id,
    dimension: question.dimension,
    selected_option: answers[question.id] ?? null,
    score: question.correctAnswer ? scoreQuestion(question.id, answers[question.id]) : 0,
  }))
}

export function determineLevel() {
  return {
    key: 'nao_classificado',
    label: 'Conhecimento demonstrado',
    description: 'Resultado descritivo das respostas deste questionário. As faixas de nível serão definidas após a calibração com dados do público-alvo.',
    recommendation: 'Use os resultados por tema para priorizar os assuntos com menor número de acertos.',
  }
}
