import { QUESTIONNAIRE_VERSION, SCORING_MODEL } from '../data/questions.js'

export const KNOWLEDGE_VERSION = QUESTIONNAIRE_VERSION
export const KNOWLEDGE_SCORING_MODEL = SCORING_MODEL
export const KNOWLEDGE_MAX = 26

export function assessmentVersion(assessment) {
  return assessment?.questionnaire_version || 'legacy-unversioned'
}

export function versionLabel(version) {
  if (version === KNOWLEDGE_VERSION) return 'Conhecimento v2'
  if (version === 'legacy-unversioned') return 'Legado — versão não informada'
  return version
}

export function isKnowledgeAssessment(assessment) {
  return assessmentVersion(assessment) === KNOWLEDGE_VERSION
    && assessment.scoring_model === KNOWLEDGE_SCORING_MODEL
    && assessment.score_max === KNOWLEDGE_MAX
    && Number.isInteger(assessment.total_score)
    && assessment.total_score >= 0 && assessment.total_score <= KNOWLEDGE_MAX
}

export function averageKnowledgeScore(assessments) {
  const valid = assessments.filter(isKnowledgeAssessment)
  return valid.length
    ? valid.reduce((sum, assessment) => sum + assessment.total_score, 0) / valid.length
    : null
}

export function scoreLabel(assessment) {
  const maximum = assessment.score_max
  return `${assessment.total_score ?? '—'}${Number.isFinite(maximum) && maximum > 0 ? `/${maximum}` : ' (máximo não informado)'}`
}

export function answerDimensionScores(assessment) {
  if (!Array.isArray(assessment.answer_details)) return {}
  return assessment.answer_details.reduce((scores, answer) => {
    if (answer.dimension && answer.dimension !== 'perfil_uso' && Number.isFinite(answer.score)) {
      scores[answer.dimension] = (scores[answer.dimension] ?? 0) + answer.score
    }
    return scores
  }, {})
}
