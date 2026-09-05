import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { compareRounds, createFinalRound, loadRoundPair } from '../../lib/assessmentRounds'
import { loadAnalyticsAssessments } from '../../lib/analyticsSource'
import { displayNumber as fmt } from '../../lib/analytics'
import { versionLabel } from '../../lib/assessmentVersions'
import { ChartPanel } from './AnalyticsCharts'

const NO_ROWS = []

export default function AnalyticsRounds({ client, surveyId, filters, presenting, refresh }) {
  const navigate = useNavigate()
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState({ key: '', pair: null, before: [], after: [], error: '', missingSchema: false })
  const [confirm, setConfirm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState('')
  const key = `${surveyId}:${revision}:${refresh}`

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const pair = await loadRoundPair(client, surveyId, controller.signal)
        const [before, after] = await Promise.all([
          pair.initial ? loadAnalyticsAssessments(client, pair.initial.id, controller.signal) : [],
          pair.final ? loadAnalyticsAssessments(client, pair.final.id, controller.signal) : [],
        ])
        if (!controller.signal.aborted) setState({ key, pair, before, after, error: '', missingSchema: false })
      } catch (error) {
        if (!controller.signal.aborted) setState({ key, pair: null, before: [], after: [], error: 'Não foi possível carregar as aplicações completas.',
          missingSchema: error.code === '42703' || error.code === 'PGRST204' || error.message === 'ROUND_SCHEMA_MISSING' })
      }
    }
    load()
    return () => controller.abort()
  }, [client, surveyId, key])

  const current = state.key === key
  const data = useMemo(() => compareRounds(current ? state.before : NO_ROWS, current ? state.after : NO_ROWS, filters), [current, state.before, state.after, filters])
  const pair = current ? state.pair : null

  async function createRound() {
    setCreating(true); setMessage('')
    try {
      await createFinalRound(client, pair.initial.id)
      setConfirm(false); setRevision(value => value + 1)
      setMessage('Rodada final pronta. Compartilhe o novo link com a mesma turma após o treinamento.')
    } catch (error) {
      setMessage(error.code === 'PGRST202' ? 'A criação de rodadas requer a migração v11 no banco.' : 'Não foi possível confirmar a criação. Atualize antes de tentar novamente; uma rodada existente será reutilizada.')
    } finally { setCreating(false) }
  }

  async function copyLink(token) {
    try { await navigator.clipboard.writeText(`${window.location.origin}/q/${token}`); setMessage('Link copiado.') }
    catch { setMessage('Não foi possível copiar automaticamente. Selecione e copie o link abaixo.') }
  }

  if (!current) return <p className="analytics-empty" role="status">Carregando aplicações inicial e final…</p>
  if (state.error) return <section className="card analytics-round-empty"><span className="eyebrow">Antes e depois do treinamento</span>
    <h2>{state.missingSchema ? 'Prepare a segunda aplicação' : 'Aplicações indisponíveis'}</h2>
    <p role="status">{state.missingSchema ? 'A segunda rodada requer a migração v11 no banco. O diagnóstico inicial continua disponível; nenhum dado foi alterado.' : state.error}</p>
    {!presenting && <button className="btn btn-outline" onClick={() => setRevision(value => value + 1)}>Tentar novamente</button>}
  </section>

  const chartRows = [{ name: 'Inicial', mean: data.before.mean, n: data.before.n, median: data.before.median }, { name: 'Final', mean: data.after.mean, n: data.after.n, median: data.after.median }]
  return <section className="analytics-rounds" aria-label="Aplicações do treinamento">
    <div className="analytics-round-intro"><span className="eyebrow">Duas aplicações. Uma turma.</span><h2>Antes e depois do treinamento</h2>
      <p>Compare o conhecimento demonstrado no início com uma nova aplicação ao final. Cada rodada tem seu próprio link e preserva suas respostas.</p></div>
    <div className="analytics-round-steps">
      <article className="card"><span className="eyebrow">01 / Diagnóstico inicial</span><h3>Ponto de partida</h3>
        <p>{pair.initial ? `${data.before.n} notas válidas no perfil selecionado` : 'Aplicação inicial não disponível ou excluída.'}</p>
        {!presenting && pair.initial && <><label className="analytics-field"><span>Link da aplicação inicial</span><input readOnly value={`${window.location.origin}/q/${pair.initial.token}`} onFocus={event => event.target.select()} /></label><div className="analytics-actions"><button className="btn btn-outline" onClick={() => copyLink(pair.initial.token)}>Copiar link inicial</button><button className="btn btn-outline" onClick={() => navigate(`/admin/surveys/${pair.initial.id}`)}>Ver inicial</button></div></>}
      </article>
      <article className={`card ${pair.final ? 'analytics-round-ready' : ''}`}><span className="eyebrow">02 / Aplicação final</span><h3>{pair.final ? 'Resultado após o treinamento' : 'Aguardando a segunda rodada'}</h3>
        <p>{pair.final ? `${data.after.n} notas válidas no perfil selecionado` : 'Crie um novo link quando o treinamento terminar e convide a mesma turma a responder.'}</p>
        {!presenting && pair.final && <><label className="analytics-field"><span>Link da aplicação final</span><input readOnly value={`${window.location.origin}/q/${pair.final.token}`} onFocus={event => event.target.select()} /></label><div className="analytics-actions"><button className="btn btn-outline" onClick={() => copyLink(pair.final.token)}>Copiar link final</button><button className="btn btn-outline" onClick={() => navigate(`/admin/surveys/${pair.final.id}`)}>Ver final</button></div></>}
        {!presenting && !pair.final && pair.initial && !confirm && <button className="btn btn-outline" onClick={() => { setConfirm(true); setMessage('') }}>Criar segunda rodada</button>}
        {!presenting && confirm && !pair.final && <div className="analytics-round-confirm"><p>Isso cria uma aplicação final ativa, com link próprio. Compartilhe somente após o treinamento. A aplicação inicial e suas respostas não serão modificadas.</p><div className="analytics-actions"><button className="btn btn-primary" disabled={creating} onClick={createRound}>{creating ? 'Criando…' : 'Confirmar criação da rodada final'}</button><button className="btn btn-outline" disabled={creating} onClick={() => setConfirm(false)}>Cancelar</button></div></div>}
      </article>
    </div>
    {message && <p role="status" className="analytics-note">{message}</p>}
    <p className="analytics-note">Comparação: {versionLabel(filters.version)}, mesmos filtros de departamento, cargo e frequência. Inclui toda a coleta de cada rodada; o filtro de datas do diagnóstico não se aplica aqui.</p>
    <p className="analytics-warning">As respostas são anônimas: não há pareamento individual. A composição da turma pode mudar. Diferenças de médias não comprovam, sozinhas, efeito do treinamento.</p>
    {pair.final && pair.initial && <>
      <div className="analytics-metrics analytics-round-metrics">
        <div className="card analytics-metric"><span className="eyebrow">Inicial · n={data.before.n}</span><strong>{fmt(data.before.mean)} /26</strong><p>Média de acertos antes do treinamento</p></div>
        <div className="card analytics-metric"><span className="eyebrow">Final · n={data.after.n}</span><strong>{fmt(data.after.mean)} /26</strong><p>Média de acertos após o treinamento</p></div>
        <div className="card analytics-metric"><span className="eyebrow">Final − inicial</span><strong>{data.delta == null ? '—' : `${data.delta > 0 ? '+' : ''}${fmt(data.delta)}`}</strong><p>Pontos na escala de 0 a 26 · diferença descritiva</p></div>
      </div>
      {!data.comparable ? <p role="status" className="analytics-empty">A comparação requer notas válidas de Conhecimento v2 nas duas aplicações. Nenhuma diferença será inferida enquanto faltar uma das bases.</p> : <>
        {(data.before.n < 5 || data.after.n < 5) && <p className="analytics-warning">Amostra pequena em pelo menos uma aplicação. Interprete as diferenças com cautela.</p>}
        <ChartPanel title="Conhecimento por aplicação" description="Duas rodadas independentes na mesma escala; consulte a amostra de cada uma na tabela." rows={chartRows} valueKey="mean" valueLabel="Média /26" max={26} columns={[{ key: 'name', label: 'Aplicação' }, { key: 'n', label: 'n válido' }, { key: 'mean', label: 'Média /26' }, { key: 'median', label: 'Mediana /26' }]} />
        <ChartPanel title="Temas antes e depois" description="Acertos / respostas objetivas válidas em cada tema. Diferença em pontos percentuais na tabela." rows={data.themes} comparison valueLabel="Inicial (%)" comparisonLabel="Final (%)" max={100} modes={['bar', 'radar', 'table']} columns={[{ key: 'name', label: 'Tema' }, { key: 'value', label: 'Inicial (%)' }, { key: 'benchmark', label: 'Final (%)' }, { key: 'difference', label: 'Diferença (p.p.)' }, { key: 'beforeN', label: 'Respostas válidas iniciais' }, { key: 'afterN', label: 'Respostas válidas finais' }]} />
      </>}
    </>}
  </section>
}
