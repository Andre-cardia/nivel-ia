import assert from 'node:assert/strict'
import test from 'node:test'
import { historicalRows, recordedCounts, recordedQuestions, recordedScoreGroups } from '../src/lib/legacyAnalytics.js'
import { loadHistoricalAnswers } from '../src/lib/analyticsSource.js'
import { EMPTY_FILTERS, filterAssessments, summarize } from '../src/lib/analytics.js'

const legacy = (id, score, extra = {}) => ({ id, total_score: score, questionnaire_version: null, score_max: null, scoring_model: null, answer_details: [], ...extra })

test('historical distributions preserve zeros and old scores above 26 without assigning a denominator', () => {
  const rows = [legacy('a', 0), legacy('b', 29), legacy('c', 29), legacy('d', null), legacy('e', -1), legacy('f', '12')]
  const [group] = recordedScoreGroups(rows)
  assert.equal(group.maximum, null)
  assert.equal(group.n, 6)
  assert.equal(group.missing, 3)
  assert.deepEqual(group.rows.map(row => [row.score, row.value]), [[0, 1], [29, 2]])
  assert.equal(summarize(rows).n, 0)
  assert.ok(!Object.hasOwn(group, 'mean'))
})

test('known historical model, version and maximum remain separate; v2 never enters historical charts', () => {
  const rows = [legacy('a', 29), legacy('b', 29, { score_max: 29 }), legacy('c', 40, { score_max: 39 }), legacy('d', 10, { score_max: 39, scoring_model: 'other' }), legacy('e', 26, { questionnaire_version: 'knowledge-v2' }), legacy('f', 20, { questionnaire_version: 'v1' })]
  assert.equal(historicalRows(rows).length, 5)
  assert.equal(recordedScoreGroups(rows).length, 5)
  assert.equal(recordedScoreGroups(rows)[2].missing, 1)
  assert.deepEqual(recordedScoreGroups([]), [])
})

test('recorded classifications and department counts reconcile with combined filters', () => {
  const rows = [legacy('a', 29, { level: 'avancado', respondent_department: 'RH' }), legacy('b', 13, { level: 'custom', respondent_department: 'RH' }), legacy('c', 10, { level: null, respondent_department: 'TI' })]
  const filtered = filterAssessments(rows, { ...EMPTY_FILTERS, version: 'legacy-unversioned', department: 'RH' })
  assert.equal(recordedCounts(filtered, 'level').reduce((n, row) => n + row.value, 0), 2)
  assert.equal(recordedCounts(rows, 'level').find(row => row.name === 'Não informado').value, 1)
  assert.equal(recordedScoreGroups(filtered)[0].n, 2)
  assert.deepEqual(recordedCounts([], 'level'), [])
})

test('historical answers count choices, never reinterpret points as v2 correctness', () => {
  const answers = [
    { assessment_id: 'a', question_number: 1, selected_option: 'D', score: 3, dimension: 'perfil_uso' },
    { assessment_id: 'b', question_number: 1, selected_option: 'A', score: 0 },
    { assessment_id: 'c', question_number: 1, selected_option: '-' },
    { assessment_id: 'outside', question_number: 1, selected_option: 'D' },
  ]
  const [question] = recordedQuestions(answers, ['a', 'b', 'c', 'd'].map(id => legacy(id, 0)))
  assert.equal(question.n, 2)
  assert.equal(question.missing, 2)
  assert.deepEqual(question.rows.map(row => row.value), [1, 0, 0, 1])
  assert.equal(Object.hasOwn(question, 'correct'), false)
  assert.equal(recordedQuestions([...answers, answers[0]], ['a', 'b'].map(id => legacy(id, 0)))[0].n, 1)
  assert.deepEqual(recordedQuestions(answers, []), [])
})

test('same question number stays isolated by historical instrument and denominator', () => {
  const rows = [legacy('a', 29, { score_max: 29 }), legacy('b', 10, { score_max: 29 }),
    legacy('c', 39, { score_max: 39 }), legacy('d', 39, { score_max: 39, scoring_model: 'other' }),
    legacy('e', 39, { score_max: 39, questionnaire_version: 'historical-v1' }),
    legacy('v2', 26, { questionnaire_version: 'knowledge-v2' })]
  const answers = rows.filter(row => row.id !== 'b').map(row => ({ assessment_id: row.id, question_number: 1, selected_option: 'A' }))
  const questions = recordedQuestions(answers, rows)
  assert.equal(questions.length, 4)
  assert.equal(new Set(questions.map(q => q.key)).size, 4)
  assert.equal(questions.reduce((n, q) => n + q.n, 0), 4)
  assert.equal(questions.find(q => q.population === 2).missing, 1)
  assert.ok(questions.filter(q => q.population === 1).every(q => q.missing === 0))
})

function clientFor(pages) {
  const calls = []
  let i = 0
  const query = { select: () => query, order: () => query,
    in: (key, ids) => { calls.push([key, ids]); return query },
    range: () => query, abortSignal: async () => pages[i++],
  }
  return { from: table => { assert.equal(table, 'assessment_answers'); return query }, calls }
}

test('historical answers load from the old table with complete paging, keeping JSON records and v2 separate', async () => {
  const a = { id: 'answer1', assessment_id: 'a', question_number: 1, selected_option: 'D' }
  const b = { id: 'answer2', assessment_id: 'a', question_number: 2, selected_option: 'C' }
  const client = clientFor([{ data: [a], count: 2 }, { data: [b], count: 2 }])
  const rows = [legacy('a', 29), legacy('b', 10, { answer_details: [{ question_number: 1, selected_option: 'A' }] }), legacy('v2', 26, { questionnaire_version: 'knowledge-v2' })]
  const result = await loadHistoricalAnswers(client, rows, new AbortController().signal)
  assert.equal(result.length, 3)
  assert.equal(result[0].assessment_id, 'b')
  assert.ok(client.calls.every(([, ids]) => ids.length === 1 && ids[0] === 'a'))
  assert.deepEqual(await loadHistoricalAnswers(clientFor([]), [], new AbortController().signal), [])
})

test('historical loading fails closed on denied, partial, changing, duplicate or out-of-scope responses', async () => {
  const signal = new AbortController().signal
  const rows = [legacy('a', 29)]
  const a = { id: 'answer1', assessment_id: 'a' }
  for (const pages of [
    [{ error: new Error('denied') }], [{ data: [], count: 1 }],
    [{ data: [a], count: 2 }, { data: [a], count: 2 }],
    [{ data: [a], count: 2 }, { data: [], count: 3 }],
    [{ data: [{ ...a, assessment_id: 'other' }], count: 1 }],
  ]) await assert.rejects(() => loadHistoricalAnswers(clientFor(pages), rows, signal))
  assert.deepEqual(await loadHistoricalAnswers(clientFor([{ data: [], count: 0 }]), rows, signal), [])
})

test('historical answer batches stay bounded to 50 assessments', async () => {
  const client = clientFor([{ data: [], count: 0 }, { data: [], count: 0 }])
  await loadHistoricalAnswers(client, Array.from({ length: 51 }, (_, i) => legacy(String(i), i)), new AbortController().signal)
  assert.deepEqual(client.calls.map(([, ids]) => ids.length), [50, 1])
})
