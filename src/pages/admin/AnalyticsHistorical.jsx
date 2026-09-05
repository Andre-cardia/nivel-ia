import { useEffect, useMemo, useState } from 'react'
import { recordedCounts, recordedQuestions, recordedScoreGroups } from '../../lib/legacyAnalytics'
import { loadHistoricalAnswers } from '../../lib/analyticsSource'
import { ChartPanel } from './AnalyticsCharts'

export default function AnalyticsHistorical({ rows, allRows, section, client, refresh }) {
  const [scoreKey, setScoreKey] = useState('')
  const [questionKey, setQuestionKey] = useState('')
  const [answers, setAnswers] = useState({ source: null, refresh: -1, rows: [], error: '' })
  const groups = useMemo(() => recordedScoreGroups(rows), [rows])
  const selected = groups.find(group => group.key === scoreKey) || groups[0]
  const activeAnswers = answers.source === allRows && answers.refresh === refresh
  const questions = useMemo(() => recordedQuestions(activeAnswers ? answers.rows : [], rows), [activeAnswers, answers.rows, rows])
  const question = questions.find(item => item.key === questionKey) || questions[0]

  useEffect(() => {
    if (section !== 2 || activeAnswers) return
    const controller = new AbortController()
    async function load() {
      try {
        const details = await loadHistoricalAnswers(client, allRows, controller.signal)
        if (!controller.signal.aborted) setAnswers({ source: allRows, refresh, rows: details, error: '' })
      } catch {
        if (!controller.signal.aborted) setAnswers({ source: allRows, refresh, rows: [], error: 'Não foi possível carregar as respostas históricas completas. Use Atualizar para tentar novamente.' })
      }
    }
    load()
    return () => controller.abort()
  }, [section, activeAnswers, client, allRows, refresh])

  if (section === 0) return <>
    <div className="card analytics-insights"><h2>Resultados do questionário original</h2><p>{rows.length} respondentes no recorte. Os gráficos abaixo reagem aos filtros e permitem alternar entre barras, rosca e tabela.</p><p className="analytics-note">Notas e classificações são as registradas na aplicação, sem recálculo. Sem versão e escala confirmadas, não calculamos média comparativa ou percentual de acertos.</p></div>
    {groups.length > 1 && <label className="analytics-field"><span>Registro de pontuação</span><select value={selected.key} onChange={event => setScoreKey(event.target.value)}>{groups.map(group => <option key={group.key} value={group.key}>{group.label} · n={group.n}</option>)}</select></label>}
    <div className="analytics-grid">
      <ChartPanel title="Distribuição das notas registradas" description={`${selected?.label || 'Sem registros'} · n=${selected ? selected.n - selected.missing : 0}. Contagem por valor armazenado; não implica equivalência de instrumentos.`} rows={selected?.rows || []} modes={['bar', 'table']} />
      <ChartPanel title="Classificações registradas" description={`Base: ${rows.length} respondentes. Rótulos históricos, não uma nova avaliação de maturidade.`} rows={recordedCounts(rows, 'level')} modes={['bar', 'pie', 'table']} />
    </div>
    {!!selected?.missing && <p className="analytics-warning">{selected.missing} nota(s) ausente(s) ou inválida(s) fora da distribuição. Os respondentes continuam nos demais gráficos.</p>}
    <div className="analytics-grid"><ChartPanel title="Respondentes por departamento" description={`Base: ${rows.length}. Use o filtro Departamento para explorar os resultados de uma área.`} rows={recordedCounts(rows, 'respondent_department')} />
      <ChartPanel title="Respondentes por cargo" description={`Base: ${rows.length}. Categorias preservadas como informadas.`} rows={recordedCounts(rows, 'respondent_role')} /></div>
  </>

  if (section === 1) return <>
    <p className="analytics-note">Recortes do questionário original. Os filtros de departamento e cargo atualizam as distribuições. Comparações de médias com outras versões ou rodadas dependem de validar a escala histórica.</p>
    <div className="analytics-grid"><ChartPanel title="Classificações do recorte" description={`Base: ${rows.length}. Classificação registrada, sem reinterpretar os níveis antigos.`} rows={recordedCounts(rows, 'level')} modes={['bar', 'pie', 'table']} />
      <ChartPanel title="Composição por departamento" description={`Base: ${rows.length}. Compara participação, não desempenho.`} rows={recordedCounts(rows, 'respondent_department')} /></div>
  </>

  if (!activeAnswers) return <p role="status">Carregando respostas do questionário original…</p>
  if (answers.error) return <p role="alert" className="analytics-warning">{answers.error}</p>
  return <>
    <p className="analytics-note">Alternativas salvas na aplicação original. O gabarito e os enunciados de Conhecimento v2 não são aplicados a estas respostas. As letras podem pertencer a instrumentos históricos distintos.</p>
    {question ? <>
      <label className="analytics-field"><span>Questão original</span><select value={question.key} onChange={event => setQuestionKey(event.target.value)}>{questions.map(item => <option key={item.key} value={item.key}>{item.name} · {item.instrument}</option>)}</select></label>
      <ChartPanel title={`Respostas registradas — ${question.name}`} description={`${question.instrument} · n=${question.n} respostas únicas · ${question.missing} ausentes/inválidas na base de ${question.population} deste instrumento. Dimensão registrada: ${question.dimensions || 'não informada'}. Contagens, não acertos.`} rows={question.rows} modes={['bar', 'pie', 'table']} />
    </> : <p role="status" className="analytics-empty">Não há respostas individuais recuperáveis neste recorte. As notas e classificações continuam disponíveis em Diagnóstico.</p>}
  </>
}
