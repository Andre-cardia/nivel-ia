import { useState } from 'react'
import logoNeuralhub from '../assets/logo-neuralhub-sm.png'

/**
 * Landing Page — Hero full-screen com CTA "Iniciar Diagnóstico"
 * Implementa: Story 1.1 AC1 e AC2
 */
export default function Landing({ onStart, survey }) {
  const [entering, setEntering] = useState(false)

  function handleStart() {
    setEntering(true)
    setTimeout(onStart, 300)
  }

  return (
    <section className={`hero-section bg-grid-tech bg-noise-tech${entering ? ' animate-rise' : ''}`}>
      {/* Decorative scan line */}
      <div className="hero-scan-line" style={{ top: '30%' }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div className="animate-rise" style={{ marginBottom: 'var(--s5)', display: 'flex', justifyContent: 'center' }}>
          <img src={logoNeuralhub} alt="Neural Hub" style={{ height: 144, objectFit: 'contain' }} />
        </div>

        {/* Eyebrow brand */}
        <p className="hero-brand animate-rise">
          Neural Hub · Diagnóstico Executivo
        </p>

        {/* Main headline */}
        <h1 className="hero-title animate-rise" style={{ animationDelay: '80ms' }}>
          Qual é o <em>Nível de Conhecimento de Inteligência Artificial</em> da<br />{survey ? survey.company_name : 'sua empresa'}?
        </h1>

        {/* Sub-headline */}
        <p className="hero-subtitle animate-rise" style={{ animationDelay: '160ms', margin: '0 auto' }}>
          Um diagnóstico estratégico para medir o grau de conhecimento,
          maturidade e percepção executiva sobre Inteligência Artificial.
        </p>

        {/* CTA */}
        <div className="animate-rise" style={{ animationDelay: '240ms' }}>
          <button
            id="btn-start-quiz"
            className="btn btn-primary"
            onClick={handleStart}
            style={{ fontSize: '1rem', padding: '0 40px', minHeight: '52px' }}
          >
            Iniciar Diagnóstico
          </button>
        </div>

        {/* Meta info */}
        <div className="hero-meta animate-rise" style={{ animationDelay: '320ms' }}>
          <span className="hero-meta-item">25 questões objetivas</span>
          <span className="hero-meta-item">10 a 15 minutos</span>
        </div>
      </div>
    </section>
  )
}
