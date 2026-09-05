import { QUESTIONS, USAGE_OPTIONS } from '../data/questions.js'
import { DIMENSION_LABELS } from './scoring.js'
import { assessmentVersion, isKnowledgeAssessment, KNOWLEDGE_VERSION } from './assessmentVersions.js'

export const EMPTY_FILTERS = { version: KNOWLEDGE_VERSION, start: '', end: '', department: '', role: '', usage: '' }
export const MISSING = 'Não informado'
const objectiveQuestions = QUESTIONS.filter(q => q.correctAnswer)

export function displayNumber(value, digits = 1) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString('pt-BR', { maximumFractionDigits: digits }) : '—'
}

// Survey reporting calendar: Brasília (UTC−03:00), independent of browser timezone.
export function reportingDate(value) {
  if (!value) return ''
  const time = new Date(value).getTime()
  return Number.isFinite(time) ? new Date(time - 3 * 3600000).toISOString().slice(0, 10) : ''
}

export function filterAssessments(rows, filters) {
  return rows.filter(row => {
    if (assessmentVersion(row) !== filters.version) return false
    const date = reportingDate(row.created_at)
    if ((filters.start || filters.end) && !date) return false
    if (filters.start && date < filters.start) return false
    if (filters.end && date > filters.end) return false
    if (filters.department && (row.respondent_department || MISSING) !== filters.department) return false
    if (filters.role && (row.respondent_role || MISSING) !== filters.role) return false
    return !filters.usage || (row.usage_frequency || MISSING) === filters.usage
  })
}

export function summarize(rows) {
  const scores = rows.filter(isKnowledgeAssessment).map(row => row.total_score).sort((a, b) => a - b)
  const n = scores.length
  if (!n) return { n: 0, mean: null, median: null, deviation: null, min: null, max: null }
  const mean = scores.reduce((a, b) => a + b, 0) / n
  return {
    n, mean,
    median: n % 2 ? scores[(n - 1) / 2] : (scores[n / 2 - 1] + scores[n / 2]) / 2,
    deviation: Math.sqrt(scores.reduce((sum, score) => sum + (score - mean) ** 2, 0) / n),
    min: scores[0], max: scores[n - 1],
  }
}

// A malformed/missing response is not an incorrect answer and has no denominator.
export function validAnswer(row, question) {
  if (!isKnowledgeAssessment(row) || !Array.isArray(row.answer_details)) return null
  const matches = row.answer_details.filter(answer => answer?.question_number === question.id)
  if (matches.length !== 1) return null
  const answer = matches[0]
  if (answer.dimension !== question.dimension || !Object.hasOwn(question.options, answer.selected_option)) return null
  const expected = answer.selected_option === question.correctAnswer ? 1 : 0
  return answer.score === expected ? answer : null
}

export function questionMetrics(rows) {
  const valid = rows.filter(isKnowledgeAssessment)
  return objectiveQuestions.map(question => {
    const answers = valid.map(row => validAnswer(row, question)).filter(Boolean)
    const correct = answers.reduce((sum, answer) => sum + answer.score, 0)
    return { name: `Q${question.id}`, question: question.text, theme: DIMENSION_LABELS[question.dimension],
      dimension: question.dimension, n: answers.length, correct,
      value: answers.length ? correct / answers.length * 100 : null,
      missing: valid.length - answers.length }
  })
}

export function themeMetrics(rows) {
  const items = questionMetrics(rows)
  return Object.entries(DIMENSION_LABELS).map(([dimension, name]) => {
    const questions = items.filter(q => q.dimension === dimension)
    const n = questions.reduce((sum, q) => sum + q.n, 0)
    const correct = questions.reduce((sum, q) => sum + q.correct, 0)
    return { name, n, value: n ? correct / n * 100 : null,
      missing: questions.reduce((sum, q) => sum + q.missing, 0) }
  })
}

export function distribution(rows) {
  const bins = [
    { name: '0–5', min: 0, max: 5, value: 0 }, { name: '6–10', min: 6, max: 10, value: 0 },
    { name: '11–15', min: 11, max: 15, value: 0 }, { name: '16–20', min: 16, max: 20, value: 0 },
    { name: '21–26', min: 21, max: 26, value: 0 },
  ]
  rows.filter(isKnowledgeAssessment).forEach(row => {
    bins.find(bin => row.total_score >= bin.min && row.total_score <= bin.max).value++
  })
  return bins
}

export function groupMetrics(rows, field) {
  const groups = new Map()
  rows.filter(isKnowledgeAssessment).forEach(row => {
    const name = row[field] || MISSING
    if (!groups.has(name)) groups.set(name, [])
    groups.get(name).push(row)
  })
  return [...groups].map(([name, list]) => ({ name, ...summarize(list) }))
    .sort((a, b) => b.mean - a.mean || a.name.localeCompare(b.name, 'pt-BR'))
}

export function profileMetrics(rows) {
  const usage = Object.entries(USAGE_OPTIONS).map(([key, name]) => ({ name, value: rows.filter(row => row.usage_frequency === key).length }))
  usage.push({ name: MISSING, value: rows.filter(row => !Object.hasOwn(USAGE_OPTIONS, row.usage_frequency)).length })
  const counts = new Map()
  rows.forEach(row => {
    const tools = Array.isArray(row.tools_used) && row.tools_used.length ? [...new Set(row.tools_used)] : [MISSING]
    tools.forEach(tool => counts.set(tool, (counts.get(tool) || 0) + 1))
  })
  return { usage, tools: [...counts].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value) }
}

export function csvContent(headers, rows) {
  const cell = value => {
    const text = String(value ?? '')
    const safe = /^\s*[=+@-]/.test(text) ? `'${text}` : text
    return `"${safe.replaceAll('"', '""')}"`
  }
  return '\uFEFF' + [headers, ...rows].map(row => row.map(cell).join(';')).join('\r\n')
}
