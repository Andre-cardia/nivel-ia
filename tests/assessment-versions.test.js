import assert from 'node:assert/strict'
import test from 'node:test'
import { averageKnowledgeScore, scoreLabel } from '../src/lib/assessmentVersions.js'

test('averages include only valid knowledge-v2 assessments', () => {
  const assessments = [
    { questionnaire_version: 'knowledge-v2', scoring_model: 'binary-knowledge-26-v1', score_max: 26, total_score: 10 },
    { questionnaire_version: 'knowledge-v2', scoring_model: 'binary-knowledge-26-v1', score_max: 26, total_score: 20 },
    { questionnaire_version: 'knowledge-v2', scoring_model: null, score_max: 26, total_score: 26 },
    { questionnaire_version: null, score_max: null, total_score: 29 },
  ]
  assert.equal(averageKnowledgeScore(assessments), 15)
  assert.equal(scoreLabel(assessments[3]), '29 (máximo não informado)')
})
