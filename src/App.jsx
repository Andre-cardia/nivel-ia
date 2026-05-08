import './styles/index.css'
import { useQuiz } from './hooks/useQuiz'
import Landing from './pages/Landing'
import Identification from './pages/Identification'
import Quiz from './pages/Quiz'
import OpenQuestion from './pages/OpenQuestion'
import Result from './pages/Result'

export default function App() {
  const quiz = useQuiz()

  return (
    <>
      {quiz.step === 'landing' && (
        <Landing onStart={quiz.startQuiz} />
      )}
      {quiz.step === 'identification' && (
        <Identification onSubmit={quiz.submitIdentification} />
      )}
      {quiz.step === 'quiz' && (
        <Quiz
          currentQuestion={quiz.currentQuestion}
          totalQuestions={quiz.totalQuestions}
          questionData={quiz.currentQuestionData}
          selectedAnswer={quiz.selectedAnswer}
          progress={quiz.progress}
          onSelect={quiz.selectAnswer}
          onNext={quiz.goNext}
          onPrev={quiz.goPrev}
        />
      )}
      {quiz.step === 'open' && (
        <OpenQuestion onSubmit={quiz.submitOpen} />
      )}
      {quiz.step === 'result' && (
        <Result
          totalScore={quiz.totalScore}
          level={quiz.level}
          dimensionScores={quiz.dimensionScores}
          identification={quiz.identification}
          openAnswer={quiz.openAnswer}
          onRestart={quiz.restart}
        />
      )}
    </>
  )
}
