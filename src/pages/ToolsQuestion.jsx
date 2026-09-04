const AI_TOOLS = [
  'ChatGPT',
  'Claude.ai',
  'Google Gemini',
  'Kimi.ai',
  'Gemini Notebook',
  'Open Claw',
  'Hermes',
  'Dify.ai',
  'Notion.ai',
  'Microsoft Co-pilot',
  'Outras',
]

/**
 * ToolsQuestion — Seleção múltipla opcional de ferramentas de IA usadas.
 * Não interfere na pontuação ou no nível do diagnóstico.
 */
export default function ToolsQuestion({ selectedTools, onToggle, onSubmit }) {
  return (
    <div className="id-page">
      <div className="id-form-wrapper">
        <div className="id-header">
          <span className="eyebrow">Pergunta Final — Opcional</span>
          <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)' }}>
            Quais ferramentas de IA você utiliza?
          </h2>
          <p>Selecione todas as opções que se aplicam ao seu dia a dia.</p>
        </div>

        <div className="divider" />

        <div className="options-list" role="group" aria-label="Ferramentas de IA utilizadas">
          {AI_TOOLS.map(tool => {
            const selected = selectedTools.includes(tool)
            return (
              <button
                key={tool}
                type="button"
                role="checkbox"
                aria-checked={selected}
                className={`btn-option${selected ? ' selected' : ''}`}
                onClick={() => onToggle(tool)}
              >
                <span className="option-letter" aria-hidden="true">{selected ? '✓' : '○'}</span>
                <span>{tool}</span>
              </button>
            )
          })}
        </div>

        <button
          id="btn-submit-tools"
          className="btn btn-primary w-full"
          onClick={onSubmit}
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}
