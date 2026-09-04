import { useState, useCallback } from 'react'
import { QUESTIONS } from '../data/questions'
import {
  calculateTotalScore,
  calculateDimensionScores,
  determineLevel,
} from '../lib/scoring'
import { NO_AI_TOOL, OTHER_AI_TOOL, toggleToolSelection } from '../lib/toolsSelection'

/**
 * useQuiz — State machine para o fluxo completo do diagnóstico.
 * Steps: 'landing' → 'identification' → 'quiz' → 'tools' → 'open' → 'result'
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
  const [toolsUsed, setToolsUsed] = useState([])
  const [toolsOther, setToolsOther] = useState('')

  // Derived state
  const totalScore = calculateTotalScore(answers)
  const dimensionScores = calculateDimensionScores(answers)
  const level = determineLevel()
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
      setStep('tools')
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

  const toggleTool = useCallback((tool) => {
    setToolsUsed(prev => {
      if (tool === NO_AI_TOOL || (tool === OTHER_AI_TOOL && prev.includes(tool))) setToolsOther('')
      return toggleToolSelection(prev, tool)
    })
  }, [])

  const submitTools = useCallback(() => setStep('open'), [])
  const returnToQuiz = useCallback(() => setStep('quiz'), [])
  const returnToTools = useCallback(() => setStep('tools'), [])

  const restart = useCallback(() => {
    setStep('landing')
    setCurrentQuestion(0)
    setAnswers({})
    setIdentification({ companyName: '', stakeholderName: '', stakeholderRole: '', stakeholderDepartment: '' })
    setOpenAnswer('')
    setToolsUsed([])
    setToolsOther('')
  }, [])

  return {
    // State
    step,
    currentQuestion,
    answers,
    identification,
    openAnswer,
    toolsUsed,
    toolsOther,
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
    toggleTool,
    setToolsOther,
    submitTools,
    returnToQuiz,
    returnToTools,
    restart,
  }
}
