import assert from 'node:assert/strict'
import test from 'node:test'
import { QUESTIONS } from '../src/data/questions.js'
import { buildAnswerDetails } from '../src/lib/scoring.js'
import { EMPTY_FILTERS, MISSING, reportingDate, filterAssessments, summarize, distribution, questionMetrics, themeMetrics, groupMetrics, profileMetrics, csvContent } from '../src/lib/analytics.js'
import { compareRounds, createFinalRound, loadRoundPair } from '../src/lib/assessmentRounds.js'
import { loadAnalyticsAssessments, loadSurveyChoices } from '../src/lib/analyticsSource.js'

function assessment(score, extra = {}) {
  let remaining = score
  const answers = Object.fromEntries(QUESTIONS.map(q => [q.id, q.correctAnswer && remaining-- > 0 ? q.correctAnswer : Object.keys(q.options).find(option => option !== q.correctAnswer)]))
  return { id: `id-${score}`, survey_id: 's1', created_at: '2026-09-04T12:00:00Z', questionnaire_version: 'knowledge-v2', scoring_model: 'binary-knowledge-26-v1', score_max: 26, total_score: score, respondent_department: 'Operações', respondent_role: 'Gestor', usage_frequency: 'A', answer_details: buildAnswerDetails(answers), ...extra }
}

test('Brasília date boundaries describe collection dates, not learning progression', () => {
  assert.equal(reportingDate('2026-09-04T02:59:59Z'), '2026-09-03')
  assert.equal(reportingDate('2026-09-04T03:00:00Z'), '2026-09-04')
  assert.equal(reportingDate('invalid'), '')
})

test('combined filters preserve inclusive date boundaries and exclude incompatible versions', () => {
  const base = assessment(13)
  const rows = [base, assessment(1, { created_at: '2026-09-05T02:59:59Z' }), assessment(2, { created_at: '2026-09-05T03:00:00Z' }), assessment(3, { respondent_department: 'RH' }), assessment(4, { respondent_role: 'Analista' }), assessment(5, { usage_frequency: 'D' }), assessment(6, { questionnaire_version: null })]
  const filters = { ...EMPTY_FILTERS, start: '2026-09-04', end: '2026-09-04', department: 'Operações', role: 'Gestor', usage: 'A' }
  assert.deepEqual(filterAssessments(rows, filters).map(r => r.total_score), [13, 1])
  assert.equal(filterAssessments(rows, { ...filters, start: '2026-09-06' }).length, 0)
  assert.equal(filterAssessments(rows, { ...EMPTY_FILTERS, version: 'legacy-unversioned' }).length, 1)
})

test('empty groups produce no mean; invalid or legacy scores never enter summaries or bins', () => {
  const rows = [assessment(0), assessment(13), assessment(26), assessment(30), assessment(10, { scoring_model: 'other' }), assessment(15, { questionnaire_version: null })]
  const stats = summarize(rows)
  assert.equal(stats.n, 3)
  assert.equal(stats.mean, 13)
  assert.equal(stats.median, 13)
  assert.equal(stats.deviation, Math.sqrt(338 / 3))
  assert.equal(summarize([]).mean, null)
  assert.equal(summarize([assessment(0), assessment(26)]).median, 13)
  assert.equal(distribution(rows).reduce((sum, bin) => sum + bin.value, 0), stats.n)
})

test('internal benchmark retains date and version, removes demographic filtering, and weights people', () => {
  const rows = [assessment(0), assessment(26, { respondent_department: 'RH' }), assessment(26, { respondent_department: 'RH' }), assessment(26, { created_at: '2025-01-01' })]
  const filters = { ...EMPTY_FILTERS, start: '2026-01-01', department: 'Operações' }
  assert.equal(summarize(filterAssessments(rows, filters)).mean, 0)
  const baseline = summarize(filterAssessments(rows, { ...filters, department: '' }))
  assert.equal(baseline.mean, 52 / 3)
  assert.equal(baseline.n, 3)
})

test('missing, duplicate and corrupt objective answers do not become wrong answers', () => {
  const complete = assessment(26)
  const missing = assessment(26, { answer_details: [] })
  let metrics = questionMetrics([complete, missing])
  assert.equal(metrics.length, 26)
  assert.ok(metrics.every(q => q.n === 1 && q.value === 100 && q.missing === 1))
  const duplicate = { ...complete, answer_details: [...complete.answer_details, complete.answer_details[1]] }
  assert.equal(questionMetrics([duplicate])[0].n, 0)
  const corrupt = { ...complete, answer_details: complete.answer_details.map(a => ({ ...a, score: 7 })) }
  assert.ok(questionMetrics([corrupt]).every(q => q.value === null))
  metrics = questionMetrics([assessment(0)])
  assert.ok(metrics.every(q => q.value === 0 && q.n === 1))
  assert.ok(themeMetrics([complete, missing]).every(theme => theme.value === 100))
  assert.equal(themeMetrics([complete]).reduce((sum, theme) => sum + theme.n, 0), 26)
})

test('segments reconcile counts and report missing departments as their own group', () => {
  const rows = [assessment(26), assessment(0, { respondent_department: null }), assessment(13)]
  const groups = groupMetrics(rows, 'respondent_department')
  assert.equal(groups.reduce((sum, group) => sum + group.n, 0), 3)
  assert.equal(groups.find(group => group.name === MISSING).mean, 0)
  assert.equal(filterAssessments(rows, { ...EMPTY_FILTERS, department: MISSING }).length, 1)
})

test('tool selections deduplicate within respondent, preserve omission and never change knowledge', () => {
  const rows = [assessment(13, { tools_used: ['ChatGPT', 'ChatGPT', 'Claude.ai'] }), assessment(13, { tools_used: ['Não utilizo nenhuma'], usage_frequency: 'D' }), assessment(13, { tools_used: [], usage_frequency: null })]
  const profile = profileMetrics(rows)
  assert.equal(profile.usage.reduce((sum, row) => sum + row.value, 0), 3)
  assert.equal(profile.tools.find(row => row.name === 'ChatGPT').value, 1)
  assert.equal(profile.tools.find(row => row.name === MISSING).value, 1)
  assert.equal(profile.tools.find(row => row.name === 'Não utilizo nenhuma').value, 1)
  assert.equal(summarize(rows).mean, 13)
})

test('before/after compares discrete rounds with the same profile, not calendar windows', () => {
  const before = [assessment(10, { created_at: '2026-01-01' }), assessment(26, { respondent_department: 'RH' })]
  const after = [assessment(20, { created_at: '2026-08-01' }), assessment(26, { questionnaire_version: null }), assessment(0, { respondent_department: 'RH' })]
  const result = compareRounds(before, after, { ...EMPTY_FILTERS, department: 'Operações', start: '2030-01-01', end: '2030-01-02' })
  assert.equal(result.before.n, 1)
  assert.equal(result.after.n, 1)
  assert.equal(result.delta, 10)
  assert.equal(result.comparable, true)
  assert.equal(result.themes.reduce((sum, theme) => sum + theme.beforeN, 0), 26)
  assert.equal(result.themes.reduce((sum, theme) => sum + theme.afterN, 0), 26)
})

test('missing final round, zero scores, unequal samples and legacy remain honest', () => {
  assert.equal(compareRounds([assessment(10)], [], EMPTY_FILTERS).delta, null)
  assert.equal(compareRounds([], [assessment(10)], EMPTY_FILTERS).comparable, false)
  assert.equal(compareRounds([assessment(0)], [assessment(0)], EMPTY_FILTERS).delta, 0)
  const changed = compareRounds([assessment(20), assessment(10)], [assessment(0)], EMPTY_FILTERS)
  assert.equal(changed.delta, -15)
  assert.equal(changed.before.n, 2)
  assert.equal(changed.after.n, 1)
  assert.equal(compareRounds([assessment(10)], [assessment(20)], { ...EMPTY_FILTERS, version: 'legacy-unversioned' }).delta, null)
})

test('CSV protects formula-like content and quotes delimiters and line breaks', () => {
  const csv = csvContent(['Cargo'], [['=1+1'], [' @SUM(1)'], ['Diretor; "IA"\nExecutivo']])
  assert.ok(csv.startsWith('\uFEFF'))
  assert.ok(csv.includes('"\'=1+1"'))
  assert.ok(csv.includes('"\' @SUM(1)"'))
  assert.ok(csv.includes('"Diretor; ""IA""\nExecutivo"'))
})

function mockClient(pages) {
  const ranges = [], filters = []
  let index = 0
  const query = {
    select: () => query, order: () => query,
    eq: (...args) => { filters.push(args); return query },
    not: (...args) => { filters.push(args); return query },
    range: (from, to) => { ranges.push([from, to]); return query },
    abortSignal: async () => pages[index++],
  }
  return { from: () => query, ranges, filters }
}

test('pagination reads every page even when server cap is smaller than requested', async () => {
  const client = mockClient([{ data: [{ id: '1' }, { id: '2' }], count: 3 }, { data: [{ id: '3' }], count: 3 }])
  const rows = await loadAnalyticsAssessments(client, 's1', new AbortController().signal)
  assert.equal(rows.length, 3)
  assert.deepEqual(client.ranges, [[0, 499], [2, 501]])
  assert.deepEqual(client.filters[0], ['survey_id', 's1'])
})

test('empty sources succeed; truncated, duplicate and failed pages never produce partial dashboards', async () => {
  const signal = new AbortController().signal
  assert.deepEqual(await loadAnalyticsAssessments(mockClient([{ data: [], count: 0 }]), 's1', signal), [])
  await assert.rejects(() => loadAnalyticsAssessments(mockClient([{ data: [], count: 1 }]), 's1', signal), /incompleta/)
  await assert.rejects(() => loadAnalyticsAssessments(mockClient([{ data: [{ id: '1' }], count: 2 }, { data: [{ id: '1' }], count: 2 }]), 's1', signal), /mudaram/)
  await assert.rejects(() => loadAnalyticsAssessments(mockClient([{ data: [{ id: '1' }], count: 2 }, { data: [], count: 3 }]), 's1', signal), /mudaram/)
  await assert.rejects(() => loadAnalyticsAssessments(mockClient([{ error: new Error('access denied') }]), 's1', signal), /access denied/)
})

test('all-survey reference excludes unlinked assessments; survey choice list is paginated', async () => {
  const client = mockClient([{ data: [], count: 0 }])
  await loadAnalyticsAssessments(client, null, new AbortController().signal)
  assert.deepEqual(client.filters[0], ['survey_id', 'is', null])
  const choices = mockClient([{ data: [{ id: 'a' }], count: 2 }, { data: [{ id: 'b' }], count: 2 }])
  assert.equal((await loadSurveyChoices(choices, new AbortController().signal)).length, 2)
  const beforeMigration = mockClient([{ error: { code: '42703' } }, { data: [{ id: 'a', company_name: 'A' }], count: 1 }])
  assert.equal((await loadSurveyChoices(beforeMigration, new AbortController().signal))[0].id, 'a')
})

function roundClient(surveys, error = null) {
  return { from: () => {
    let rows = surveys, single = false
    const query = { select: () => query, eq: (key, value) => { rows = rows.filter(row => row[key] === value); return query },
      abortSignal: () => query, single: () => { single = true; return query },
      then: resolve => Promise.resolve({ data: single ? rows[0] : rows, error }).then(resolve),
    }
    return query
  } }
}

test('round linkage works from either application, with no guessed calendar pairing', async () => {
  const initial = { id: 'a', application_phase: 'initial', baseline_survey_id: null }
  const final = { id: 'b', application_phase: 'final', baseline_survey_id: 'a' }
  const signal = new AbortController().signal
  assert.deepEqual(await loadRoundPair(roundClient([initial, final]), 'a', signal), { initial, final })
  assert.deepEqual(await loadRoundPair(roundClient([initial, final]), 'b', signal), { initial, final })
  assert.equal((await loadRoundPair(roundClient([initial]), 'a', signal)).final, null)
  const orphan = { ...final, baseline_survey_id: null }
  assert.deepEqual(await loadRoundPair(roundClient([orphan]), 'b', signal), { initial: null, final: orphan })
  await assert.rejects(() => loadRoundPair(roundClient([{ id: 'a' }]), 'a', signal), /ROUND_SCHEMA_MISSING/)
  await assert.rejects(() => loadRoundPair(roundClient([initial, final, { ...final, id: 'c' }]), 'a', signal), /inválido/)
  await assert.rejects(() => loadRoundPair(roundClient([], new Error('denied')), 'a', signal), /denied/)
})

test('creating a final round invokes the scoped RPC, checks its result and propagates failures', async () => {
  const calls = []
  const client = { rpc: async (...args) => { calls.push(args); return { data: 'new-final-id', error: null } } }
  assert.equal(await createFinalRound(client, 'initial-id'), 'new-final-id')
  assert.deepEqual(calls, [['create_final_survey', { initial_survey_id: 'initial-id' }]])
  await assert.rejects(() => createFinalRound({ rpc: async () => ({ data: null, error: null }) }, 'a'), /confirmar/)
  await assert.rejects(() => createFinalRound({ rpc: async () => ({ error: new Error('not authorized') }) }, 'a'), /not authorized/)
})
