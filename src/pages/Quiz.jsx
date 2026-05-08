import { DIMENSION_LABELS } from '../lib/scoring'

/**
 * Quiz Page — Fluxo das 25 questões
 * Implementa: Story 1.2 - AC completo
 */
export default function Quiz({
  currentQuestion,
  totalQuestions,
  questionData,
  selectedAnswer,
  progress,
  onSelect,
  onNext,
  onPrev,
}) {
  if (!questionData) return null

  const dimensionLabel = DIMENSION_LABELS[questionData.dimension] || ''
  const eyebrow = `${String(questionData.id).padStart(2, '0')} — ${dimensionLabel.toUpperCase()}`

  return (
    <div className="quiz-body">
      {/* Sticky header with progress */}
      <header className="quiz-header">
        <div className="container quiz-header-inner">
          <span className="quiz-step-label">
            Questão <span>{currentQuestion + 1}</span> de <span>{totalQuestions}</span>
          </span>
          <div style={{ flex: 1, maxWidth: 320 }}>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={currentQuestion + 1}
                aria-valuemin={1}
                aria-valuemax={totalQuestions}
                aria-label={`Questão ${currentQuestion + 1} de ${totalQuestions}`}
              />
            </div>
          </div>
          <span className="quiz-step-label">
            <span style={{ color: 'var(--accent)' }}>{Math.round(progress)}%</span>
          </span>
        </div>
      </header>

      {/* Question content */}
      <main className="quiz-content">
        <div className="container">
          <div className="question-block" key={questionData.id}>
            {/* Question header */}
            <div className="question-header">
              <span className="eyebrow">{eyebrow}</span>
              <h2 className="question-text">{questionData.text}</h2>
            </div>

            {/* Options */}
            <div className="options-list" role="radiogroup" aria-label="Alternativas">
              {Object.entries(questionData.options).map(([letter, text]) => (
                <button
                  key={letter}
                  id={`option-${questionData.id}-${letter}`}
                  role="radio"
                  aria-checked={selectedAnswer === letter}
                  className={`btn-option${selectedAnswer === letter ? ' selected' : ''}`}
                  onClick={() => onSelect(questionData.id, letter)}
                >
                  <span className="option-letter">{letter}</span>
                  <span>{text}</span>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="question-footer">
              <button
                id="btn-prev-question"
                className="btn btn-outline"
                onClick={onPrev}
                disabled={currentQuestion === 0}
                style={{ minWidth: 120 }}
              >
                ← Anterior
              </button>
              <button
                id="btn-next-question"
                className="btn btn-primary"
                onClick={onNext}
                disabled={!selectedAnswer}
                style={{ minWidth: 160 }}
              >
                {currentQuestion === totalQuestions - 1 ? 'Concluir →' : 'Próxima →'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
