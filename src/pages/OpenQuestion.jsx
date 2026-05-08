import { useState } from 'react'

/**
 * OpenQuestion Page — Pergunta aberta opcional
 * Implementa: Story 1.3
 */
export default function OpenQuestion({ onSubmit }) {
  const [text, setText] = useState('')

  return (
    <div className="id-page">
      <div className="id-form-wrapper">
        <div className="id-header">
          <span className="eyebrow">Pergunta Final — Opcional</span>
          <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)' }}>
            Na sua opinião, qual processo da empresa poderia ser melhorado com Inteligência Artificial?
          </h2>
          <p>Esta resposta é opcional, mas nos ajuda a identificar oportunidades reais de aplicação.</p>
        </div>

        <div className="divider" />

        <div className="input-group">
          <label className="input-label" htmlFor="open-answer">
            Sua resposta
            <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>(opcional)</span>
          </label>
          <textarea
            id="open-answer"
            className="input-field"
            placeholder="Descreva o processo ou área que você acredita que poderia se beneficiar com IA..."
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={1200}
          />
          <span className="input-error" style={{ color: 'var(--muted)' }}>
            {text.length}/1200
          </span>
        </div>

        <button
          id="btn-submit-open"
          className="btn btn-primary w-full"
          onClick={() => onSubmit(text)}
        >
          Ver meu resultado →
        </button>

        <button
          id="btn-skip-open"
          className="btn btn-outline w-full"
          onClick={() => onSubmit('')}
          style={{ marginTop: 0 }}
        >
          Pular e ver resultado
        </button>
      </div>
    </div>
  )
}
