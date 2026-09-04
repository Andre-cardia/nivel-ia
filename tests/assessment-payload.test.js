import assert from 'node:assert/strict'
import test from 'node:test'
import { QUESTIONS } from '../src/data/questions.js'
import { buildAssessmentPayload, isAssessmentRetryDuplicate } from '../src/lib/assessmentPayload.js'

const completeAnswers = Object.fromEntries(QUESTIONS.map(question => [question.id, question.correctAnswer ?? 'B']))
const baseInput = {
  assessmentId: '123e4567-e89b-12d3-a456-426614174000',
  survey: { id: 'survey-id', company_name: 'Empresa' },
  identification: { stakeholderName: '', stakeholderRole: 'Gestor', stakeholderDepartment: 'Operações' },
  answers: completeAnswers,
  openAnswer: '',
  toolsUsed: ['Outras'],
  toolsOther: 'Ferramenta interna',
}

test('builds one complete and versioned assessment payload', () => {
  const payload = buildAssessmentPayload(baseInput)
  assert.equal(payload.total_score, 26)
  assert.equal(payload.score_max, 26)
  assert.equal(payload.questionnaire_version, 'knowledge-v2')
  assert.equal(payload.scoring_model, 'binary-knowledge-26-v1')
  assert.equal(payload.answer_details.length, 27)
  assert.equal(payload.answer_details[0].score, 0)
  assert.equal(payload.tools_other, 'Ferramenta interna')
})

test('rejects incomplete answers before inserting an assessment', () => {
  const incompleteAnswers = { ...completeAnswers }
  delete incompleteAnswers[27]
  assert.throws(
    () => buildAssessmentPayload({ ...baseInput, answers: incompleteAnswers }),
    /respostas inválidas ou incompletas/,
  )
})

test('rejects an option that does not exist in the question', () => {
  const invalidAnswers = { ...completeAnswers, 27: 'X' }
  assert.throws(
    () => buildAssessmentPayload({ ...baseInput, answers: invalidAnswers }),
    /respostas inválidas ou incompletas/,
  )
})

test('accepts as idempotent retry only a duplicate of the same assessment id', () => {
  const id = baseInput.assessmentId
  assert.equal(isAssessmentRetryDuplicate({ code: '23505', details: `Key (id)=(${id}) already exists.` }, id), true)
  assert.equal(isAssessmentRetryDuplicate({ code: '23505', message: 'duplicate email constraint' }, id), false)
  assert.equal(isAssessmentRetryDuplicate({ code: '42501', message: 'permission denied' }, id), false)
})
