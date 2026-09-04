import assert from 'node:assert/strict'
import test from 'node:test'
import { QUESTIONS } from '../src/data/questions.js'
import {
  buildAnswerDetails,
  calculateDimensionScores,
  calculateTotalScore,
  CORRECT_ANSWERS,
  DIMENSION_MAX,
  MAX_SCORE,
} from '../src/lib/scoring.js'

const incorrectAnswer = question => Object.keys(question.options).find(option => option !== question.correctAnswer)

test('knowledge-v2 has one profile question and 26 scored questions', () => {
  assert.equal(QUESTIONS.length, 27)
  assert.equal(MAX_SCORE, 26)
  assert.equal(Object.keys(CORRECT_ANSWERS).length, 26)
  assert.equal(Object.values(DIMENSION_MAX).reduce((sum, maximum) => sum + maximum, 0), 26)
})

test('answer key is balanced and does not systematically reveal the longest option', () => {
  const scoredQuestions = QUESTIONS.slice(1)
  const answerCounts = scoredQuestions.reduce((counts, question) => {
    counts[question.correctAnswer] += 1
    return counts
  }, { A: 0, B: 0, C: 0, D: 0 })
  const countValues = Object.values(answerCounts)
  const correctIsLongest = scoredQuestions.filter((question) => {
    const correctLength = question.options[question.correctAnswer].length
    return correctLength === Math.max(...Object.values(question.options).map(option => option.length))
  })

  assert.ok(Math.max(...countValues) - Math.min(...countValues) <= 1)
  assert.ok(correctIsLongest.length <= 6)
})

test('options do not reveal distractors through absolute wording', () => {
  const absoluteCue = /\b(cada|todos|necessariamente|imediatamente|todo|todas|somente|apenas)\b/i
  for (const question of QUESTIONS.slice(1)) {
    for (const option of Object.values(question.options)) assert.doesNotMatch(option, absoluteCue)
  }
})

test('frequency never changes the knowledge score', () => {
  const objectiveAnswers = Object.fromEntries(QUESTIONS.slice(1).map(question => [question.id, question.correctAnswer]))
  for (const frequency of ['A', 'B', 'C', 'D']) {
    assert.equal(calculateTotalScore({ ...objectiveAnswers, 1: frequency }), 26)
  }
})

test('extremes and dimension totals are consistent', () => {
  const correct = Object.fromEntries(QUESTIONS.map(question => [question.id, question.correctAnswer ?? 'A']))
  const incorrect = Object.fromEntries(QUESTIONS.map(question => [question.id, question.correctAnswer ? incorrectAnswer(question) : 'D']))
  assert.equal(calculateTotalScore(correct), 26)
  assert.equal(calculateTotalScore(incorrect), 0)
  assert.equal(Object.values(calculateDimensionScores(correct)).reduce((sum, score) => sum + score, 0), 26)
  assert.equal(buildAnswerDetails(correct).length, 27)
  assert.equal(buildAnswerDetails(correct)[0].score, 0)
})
