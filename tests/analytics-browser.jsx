// Local manual integration fixture; not an application route or a production build entry.
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import SurveyAnalytics from '../src/pages/admin/SurveyAnalytics.jsx'
import { QUESTIONS } from '../src/data/questions.js'
import { buildAnswerDetails } from '../src/lib/scoring.js'
import '../src/styles/index.css'

if (!import.meta.env.DEV) throw new Error('Fixture disponível apenas em desenvolvimento')
const params = new URLSearchParams(window.location.search)
const rows = Array.from({ length: params.has('empty') ? 0 : 64 }, (_, i) => {
  const total = i % 27
  let remaining = total
  const answers = Object.fromEntries(QUESTIONS.map(q => [q.id, q.correctAnswer && remaining-- > 0 ? q.correctAnswer : Object.keys(q.options).find(option => option !== q.correctAnswer)]))
  return { id: `test-${i}`, survey_id: i < 40 ? 'test-a' : 'test-b', questionnaire_version: params.has('legacy') ? null : 'knowledge-v2', scoring_model: 'binary-knowledge-26-v1', score_max: 26, total_score: total,
    created_at: new Date(Date.UTC(2026, 7, 1 + i, 12)).toISOString(), respondent_department: ['Operações', 'Comercial', 'Tecnologia', null][i % 4], respondent_role: ['Gestor', 'Analista'][i % 2], usage_frequency: ['A', 'B', 'C', 'D'][i % 4],
    answer_details: buildAnswerDetails(answers), tools_used: i % 2 ? ['ChatGPT', 'Claude.ai'] : [],
  }
})
const surveys = [{ id: 'test-a', company_name: 'Empresa A — TESTE SINTÉTICO', token: 'test-initial', application_phase: params.has('no-schema') ? undefined : 'initial', baseline_survey_id: null }, { id: 'test-b', company_name: 'Empresa B — TESTE SINTÉTICO', token: 'test-other', application_phase: 'initial', baseline_survey_id: null }]
if (params.has('rounds')) {
  surveys.push({ id: 'test-final', company_name: 'Empresa A — TESTE SINTÉTICO', token: 'test-final', application_phase: 'final', baseline_survey_id: 'test-a' })
  rows.push(...rows.filter(row => row.survey_id === 'test-a').slice(0, 32).map((row, index) => ({ ...row, id: `final-${index}`, survey_id: 'test-final', created_at: '2026-12-01T12:00:00Z', total_score: 26, answer_details: buildAnswerDetails(Object.fromEntries(QUESTIONS.map(q => [q.id, q.correctAnswer || 'A']))) })))
}
const client = {
  async rpc(name, args) {
    if (name !== 'create_final_survey' || args.initial_survey_id !== 'test-a' || params.has('create-error')) return { error: new Error('TESTE: criação negada') }
    const existing = surveys.find(item => item.baseline_survey_id === args.initial_survey_id)
    if (existing) return { data: existing.id }
    surveys.push({ id: 'test-final', company_name: 'Empresa A — TESTE SINTÉTICO', token: 'test-final', application_phase: 'final', baseline_survey_id: 'test-a' })
    return { data: 'test-final' }
  },
  from(table) {
    let data = table === 'surveys' ? surveys : rows
    let from = 0, to = Infinity, single = false
    const query = {
      select() { return query }, order() { return query }, abortSignal() { return query },
      eq(key, value) { data = data.filter(row => row[key] === value); return query },
      not(key, operator, value) { data = data.filter(row => row[key] !== value); return query },
      range(start, end) { from = start; to = end; return query },
      single() { single = true; return query },
      then(resolve, reject) { return Promise.resolve({ data: single ? data[0] : data.slice(from, to + 1), count: data.length, error: params.has('error') ? new Error('Teste de falha') : null }).then(resolve, reject) },
    }
    return query
  },
}

createRoot(document.getElementById('root')).render(<MemoryRouter initialEntries={[`/admin/surveys/${params.has('from-final') ? 'test-final' : 'test-a'}/analytics`]}><Routes><Route path="/admin/surveys/:id/analytics" element={<SurveyAnalytics onSignOut={() => {}} client={client} />} /></Routes></MemoryRouter>)
