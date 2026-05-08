import { useState, useCallback } from 'react'
import { QUESTIONS } from '../data/questions'
import {
  calculateTotalScore,
  calculateDimensionScores,
  determineLevel,
} from '../lib/scoring'

/**
 * useQuiz — State machine para o fluxo completo do diagnóstico.
 * Steps: 'landing' → 'identification' → 'quiz' → 'open' → 'result'
 */
export function useQuiz() {
  const [step, setStep] = useState('landing')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({}) // { [questionId]: 'A'|'B'|'C'|'D' }
  const [identification, setIdentification] = useState({
    companyName: '',
    stakeholderName: '',
    stakeholderRole: '',
    stakeholderDepartment: '',
  })
  const [openAnswer, setOpenAnswer] = useState('')

  // Derived state
  const totalScore = calculateTotalScore(answers)
  const dimensionScores = calculateDimensionScores(answers)
  const level = determineLevel(totalScore)
  const progress = (currentQuestion / QUESTIONS.length) * 100

  // ── Actions ─────────────────────────────────────────────

  const startQuiz = useCallback(() => setStep('identification'), [])

  const submitIdentification = useCallback((data) => {
    setIdentification(data)
    setStep('quiz')
    setCurrentQuestion(0)
  }, [])

  const selectAnswer = useCallback((questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }))
  }, [])

  const goNext = useCallback(() => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(q => q + 1)
    } else {
      setStep('open')
    }
  }, [currentQuestion])

  const goPrev = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(q => q - 1)
    }
  }, [currentQuestion])

  const submitOpen = useCallback((text) => {
    setOpenAnswer(text)
    setStep('result')
  }, [])

  const restart = useCallback(() => {
    setStep('landing')
    setCurrentQuestion(0)
    setAnswers({})
    setIdentification({ companyName: '', stakeholderName: '', stakeholderRole: '', stakeholderDepartment: '' })
    setOpenAnswer('')
  }, [])

  return {
    // State
    step,
    currentQuestion,
    answers,
    identification,
    openAnswer,
    // Derived
    totalScore,
    dimensionScores,
    level,
    progress,
    currentQuestionData: QUESTIONS[currentQuestion],
    totalQuestions: QUESTIONS.length,
    selectedAnswer: answers[QUESTIONS[currentQuestion]?.id],
    // Actions
    startQuiz,
    submitIdentification,
    selectAnswer,
    goNext,
    goPrev,
    submitOpen,
    restart,
  }
}
