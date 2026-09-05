import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { USAGE_OPTIONS } from '../../data/questions'
import { assessmentVersion, isKnowledgeAssessment, KNOWLEDGE_VERSION, scoreLabel, versionLabel } from '../../lib/assessmentVersions'
import { EMPTY_FILTERS, MISSING, csvContent, distribution, filterAssessments, groupMetrics, profileMetrics, questionMetrics, reportingDate, summarize, themeMetrics } from '../../lib/analytics'
import { loadAnalyticsAssessments, loadSurveyChoices } from '../../lib/analyticsSource'
import { AnalyticsTable, ChartPanel } from './AnalyticsCharts'
import AnalyticsRounds from './AnalyticsRounds'
import AnalyticsHistorical from './AnalyticsHistorical'
import { displayNumber as fmt } from '../../lib/analytics'
import './analytics.css'

const SECTIONS = ['Diagnóstico', 'Comparações', 'Questões e temas', 'Perfil de uso', 'Tabela de dados', 'Antes e depois']
const NO_ROWS = []
const scoreColumns = [{ key: 'name', label: 'Grupo' }, { key: 'n', label: 'n válido' }, { key: 'mean', label: 'Média /26' }, { key: 'median', label: 'Mediana /26' }, { key: 'deviation', label: 'Desvio padrão (pontos)' }]
const themeColumns = [{ key: 'name', label: 'Tema' }, { key: 'value', label: 'Acertos (%)' }, { key: 'benchmark', label: 'Referência (%)' }, { key: 'n', label: 'Respostas válidas' }, { key: 'missing', label: 'Ausentes/inválidas' }]
const surveyName = survey => survey ? `${survey.company_name} · ${survey.application_phase === 'final' ? 'Final' : 'Inicial'}` : 'Pesquisa não disponível'

function FilterField({ label, value, onChange, options }) {
  return <label className="analytics-field"><span>{label}</span><select value={value} onChange={event => onChange(event.target.value)}>
    {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
  </select></label>
}

function Metric({ label, value, note }) {
  return <div className="card analytics-metric"><p className="eyebrow">{label}</p><strong>{value}</strong><p>{note}</p></div>
}

export default function SurveyAnalytics({ onSignOut, client = supabase }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dataset, setDataset] = useState({ id: '', survey: null, rows: [], surveys: [], error: '', loading: true, updated: '' })
  const [refresh, setRefresh] = useState(0)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [section, setSection] = useState(0)
  const [group, setGroup] = useState('respondent_department')
  const [reference, setReference] = useState('self')
  const [cohort, setCohort] = useState({ department: '', role: '', usage: '' })
  const [comparison, setComparison] = useState({ key: '', rows: [], error: '' })
  const [external, setExternal] = useState({ value: '', source: '', sample: '' })
  const [presenting, setPresenting] = useState(false)
  const [page, setPage] = useState(0)
  const presentButton = useRef(null)
  const exitButton = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setDataset(previous => ({ ...previous, loading: true, error: '' }))
      try {
        const [surveyResult, rows, surveys] = await Promise.all([
          client.from('surveys').select('id,company_name').eq('id', id).abortSignal(controller.signal).single(),
          loadAnalyticsAssessments(client, id, controller.signal), loadSurveyChoices(client, controller.signal),
        ])
        if (surveyResult.error) throw surveyResult.error
        if (controller.signal.aborted) return
        setDataset({ id, survey: surveyResult.data, rows, surveys, error: '', loading: false, updated: new Date().toLocaleString('pt-BR') })
        setFilters(previous => {
          const versions = rows.map(assessmentVersion)
          const version = versions.includes(previous.version) || !versions.length ? previous.version : versions[0]
          return { ...previous, version }
        })
      } catch {
        if (!controller.signal.aborted) setDataset(previous => ({ ...previous, id, loading: false, error: 'Não foi possível carregar os dados completos. Verifique sua conexão e tente atualizar.' }))
      }
    }
    load()
    return () => controller.abort()
  }, [id, refresh, client])

  useEffect(() => {
    if (['self', 'cohort', 'external'].includes(reference)) return
    const controller = new AbortController()
    const key = `${id}:${reference}:${refresh}`
    async function load() {
      try {
        const rows = await loadAnalyticsAssessments(client, reference === 'all' ? null : reference.slice(7), controller.signal)
        if (!controller.signal.aborted) setComparison({ key, rows, error: '' })
      } catch {
        if (!controller.signal.aborted) setComparison({ key, rows: [], error: 'A referência não pôde ser carregada. Selecione novamente ou atualize.' })
      }
    }
    load()
    return () => controller.abort()
  }, [id, reference, refresh, client])

  useEffect(() => {
    if (!presenting) return
    exitButton.current?.focus()
    function handleKey(event) {
      if (event.target instanceof HTMLElement && ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return
      if (event.key === 'Escape') { setPresenting(false); setTimeout(() => presentButton.current?.focus(), 0) }
      if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
        event.preventDefault()
        setSection(previous => event.key === 'Home' ? 0 : event.key === 'End' ? SECTIONS.length - 1 : Math.max(0, Math.min(SECTIONS.length - 1, previous + (event.key === 'ArrowRight' ? 1 : -1))))
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [presenting])

  useEffect(() => {
    if (presenting) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [presenting, section])

  const rows = dataset.id === id ? dataset.rows : NO_ROWS
  const versions = [...new Set(rows.map(assessmentVersion))]
  if (!versions.includes(KNOWLEDGE_VERSION)) versions.unshift(KNOWLEDGE_VERSION)
  const choices = field => [{ value: '', label: 'Todos' }, ...[...new Set(rows.map(row => row[field] || MISSING))].sort().map(value => ({ value, label: value }))]
  const changeFilter = (key, value) => { setFilters(previous => ({ ...previous, [key]: value })); setPage(0) }
  const filtered = useMemo(() => filterAssessments(rows, filters), [rows, filters])
  const valid = useMemo(() => filtered.filter(isKnowledgeAssessment), [filtered])
  const stats = useMemo(() => summarize(filtered), [filtered])
  const isKnowledge = filters.version === KNOWLEDGE_VERSION
  const invalidDateRange = Boolean(filters.start && filters.end && filters.start > filters.end)
  const compareLoading = !['self', 'cohort', 'external'].includes(reference) && comparison.key !== `${id}:${reference}:${refresh}`
  const compareError = !['self', 'cohort', 'external'].includes(reference) && !compareLoading ? comparison.error : ''
  const referenceRows = ['self', 'cohort'].includes(reference) ? rows : !compareLoading && !compareError ? comparison.rows : NO_ROWS
  const benchmarkRows = useMemo(() => reference === 'external' ? [] : filterAssessments(referenceRows, { ...filters, department: '', role: '', usage: '', ...(reference === 'cohort' ? cohort : {}) }), [referenceRows, filters, reference, cohort])
  const benchmarkStats = useMemo(() => summarize(benchmarkRows), [benchmarkRows])
  const externalValid = external.value.trim() !== '' && Number.isFinite(Number(external.value)) && Number(external.value) >= 0 && Number(external.value) <= 26 && external.source.trim().length > 0
  const benchmark = reference === 'external' ? (externalValid ? Number(external.value) : null) : benchmarkStats.mean
  const delta = stats.mean != null && benchmark != null ? stats.mean - benchmark : null
  const groups = useMemo(() => groupMetrics(filtered, group).map(item => ({ ...item, name: group === 'usage_frequency' ? USAGE_OPTIONS[item.name] || MISSING : item.name })), [filtered, group])
  const themes = useMemo(() => {
    const base = themeMetrics(benchmarkRows)
    return themeMetrics(filtered).map((theme, i) => ({ ...theme, benchmark: base[i].value }))
  }, [filtered, benchmarkRows])
  const questions = useMemo(() => questionMetrics(filtered), [filtered])
  const profiles = useMemo(() => profileMetrics(filtered), [filtered])
  const histogram = useMemo(() => distribution(filtered), [filtered])
  const themeRanking = themes.filter(theme => theme.value != null).sort((a, b) => a.value - b.value)
  const companyGroups = useMemo(() => groupMetrics(benchmarkRows, 'survey_id').map(item => ({ ...item, id: item.name, name: surveyName(dataset.surveys.find(survey => survey.id === item.name)) })), [benchmarkRows, dataset.surveys])
  const context = `${versionLabel(filters.version)} · ${filters.start || 'Início'} → ${filters.end || 'Sem limite final'} · ${filters.department || 'Todos os departamentos'} · ${filters.role || 'Todos os cargos'} · ${USAGE_OPTIONS[filters.usage] || filters.usage || 'Todas as frequências'}`
  const referenceLabel = reference === 'self' ? 'Pesquisa atual' : reference === 'cohort' ? `Grupo B: ${cohort.department || 'todos os departamentos'}, ${cohort.role || 'todos os cargos'}, ${USAGE_OPTIONS[cohort.usage] || cohort.usage || 'todas as frequências'}` : reference === 'all' ? 'Todas as pesquisas cadastradas' : reference === 'external' ? 'Referência externa fornecida' : surveyName(dataset.surveys.find(item => item.id === reference.slice(7)))
  const details = filtered.map((row, index) => ({ id: row.id, name: index + 1, date: reportingDate(row.created_at) || MISSING,
    department: row.respondent_department || MISSING, role: row.respondent_role || MISSING,
    score: scoreLabel(row), usage: USAGE_OPTIONS[row.usage_frequency] || MISSING,
    tools: Array.isArray(row.tools_used) && row.tools_used.length ? row.tools_used.join(', ') : MISSING,
  }))
  const detailColumns = [{ key: 'name', label: '#' }, { key: 'date', label: 'Data (Brasília)' }, { key: 'department', label: 'Departamento' }, { key: 'role', label: 'Cargo' }, { key: 'score', label: 'Nota registrada' }, { key: 'usage', label: 'Frequência de uso' }, { key: 'tools', label: 'Ferramentas' }]
  const safePage = Math.min(page, Math.max(0, Math.ceil(details.length / 25) - 1))

  function exportData() {
    const csv = csvContent(detailColumns.map(c => c.label), details.map(row => detailColumns.map(c => row[c.key])))
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url; link.download = `analytics-${id}-${filters.version}.csv`; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return <div className={`admin-layout analytics-layout ${presenting ? 'analytics-presenting' : ''}`}>
    {!presenting && <aside className="admin-sidebar">
      <div className="brand-logo"><div className="brand-logo-icon">N</div><span className="brand-logo-text">Nível IA</span></div>
      <nav className="analytics-side-nav"><button onClick={() => navigate('/admin')}>← Dashboard</button><button onClick={() => navigate(`/admin/surveys/${id}`)}>Respondentes</button><span className="eyebrow">Analytics</span></nav>
      <button className="btn btn-outline" onClick={onSignOut} style={{ marginTop: 'auto' }}>Sair</button>
    </aside>}
    <main className="admin-main analytics-main">
      <header className="analytics-header">
        <div><span className="eyebrow">Neural Hub / Nível IA</span><h1>{dataset.id === id ? dataset.survey?.company_name || 'Analytics' : 'Analytics'}</h1>
          <p>Diagnóstico de conhecimento em inteligência artificial · {dataset.surveys.find(survey => survey.id === id)?.application_phase === 'final' ? 'Aplicação final' : 'Aplicação inicial'}</p></div>
        <div className="analytics-actions">
          {!presenting && <><button className="btn btn-outline" onClick={() => navigate(`/admin/surveys/${id}`)}>← Respondentes</button><button className="btn btn-outline" onClick={() => setRefresh(v => v + 1)} disabled={dataset.loading}>Atualizar</button>
            <button className="btn btn-primary" ref={presentButton} onClick={() => { setSection(0); setPresenting(true) }} disabled={dataset.loading || !!dataset.error}>Apresentar</button></>}
          {presenting && <button className="btn btn-outline" ref={exitButton} onClick={() => { setPresenting(false); setTimeout(() => presentButton.current?.focus(), 0) }}>Sair da apresentação (Esc)</button>}
        </div>
      </header>
      {!presenting && <section className="analytics-hero" aria-label="Painel de diagnóstico">
        <img src="/images/analytics-neural-core.jpg" alt="" width="1536" height="1024" fetchPriority="high" />
        <div className="analytics-hero-copy"><span className="eyebrow">Conhecimento em foco</span><h2>Entenda o ponto de partida.<br /><span>Prepare o próximo passo.</span></h2><p>Um retrato da turma para orientar o treinamento.<br />Uma segunda aplicação para comparar os resultados.</p><span className="analytics-hero-tag">DIAGNÓSTICO / APRENDIZADO / NOVA APLICAÇÃO</span></div>
      </section>}
      {dataset.loading || dataset.id !== id ? <p role="status" className="analytics-empty">Carregando dados completos…</p> : dataset.error ? <div className="card" role="alert"><p>{dataset.error}</p><button className="btn btn-primary" onClick={() => setRefresh(v => v + 1)}>Tentar novamente</button></div> : <>
        {!presenting && <section className="card analytics-filters" aria-label="Filtros do dashboard">
          <FilterField label="Versão" value={filters.version} onChange={value => changeFilter('version', value)} options={versions.map(value => ({ value, label: versionLabel(value) }))} />
          {section !== 5 && <><label className="analytics-field"><span>Coleta de (Brasília)</span><input type="date" value={filters.start} onChange={event => changeFilter('start', event.target.value)} /></label>
          <label className="analytics-field"><span>Coleta até (Brasília)</span><input type="date" value={filters.end} onChange={event => changeFilter('end', event.target.value)} /></label></>}
          <FilterField label="Departamento" value={filters.department} onChange={value => changeFilter('department', value)} options={choices('respondent_department')} />
          <FilterField label="Cargo" value={filters.role} onChange={value => changeFilter('role', value)} options={choices('respondent_role')} />
          <FilterField label="Frequência de IA" value={filters.usage} onChange={value => changeFilter('usage', value)} options={[{ value: '', label: 'Todas' }, ...Object.entries(USAGE_OPTIONS).map(([value, label]) => ({ value, label })), { value: MISSING, label: MISSING }]} />
          <div className="analytics-filter-shortcuts"><span className="analytics-note">{section === 5 ? 'As duas aplicações são comparadas integralmente, com os mesmos filtros de perfil.' : 'Datas filtram a coleta, não representam evolução de aprendizado.'}</span><button className="btn btn-outline" onClick={() => { setFilters(previous => ({ ...EMPTY_FILTERS, version: previous.version })); setPage(0) }}>Limpar filtros</button></div>
        </section>}
        <p className="analytics-context">{section === 5 ? `${versionLabel(filters.version)} · ${filters.department || 'Todos os departamentos'} · ${filters.role || 'Todos os cargos'} · ${USAGE_OPTIONS[filters.usage] || filters.usage || 'Todas as frequências'} · Coleta completa das duas rodadas` : context}</p>
        {section !== 5 && invalidDateRange && <p role="alert" className="analytics-warning">A data inicial deve ser anterior ou igual à data final.</p>}
        {section !== 5 && <div className="analytics-metrics">
          <Metric label="Respondentes no recorte" value={filtered.length} note={`${rows.length} registros na pesquisa`} />
          {isKnowledge && <><Metric label="Média de acertos" value={`${fmt(stats.mean)} /26`} note={`${stats.n} notas válidas · ${fmt(stats.mean == null ? null : stats.mean / 26 * 100)}% de acertos`} />
            <Metric label="Mediana" value={`${fmt(stats.median)} /26`} note="Valor central das notas válidas" />
            <Metric label="Dispersão" value={fmt(stats.deviation)} note={`Desvio padrão · mínimo ${fmt(stats.min)} / máximo ${fmt(stats.max)}`} /></>}
        </div>}
        {section !== 5 && isKnowledge && filtered.length > stats.n && <p className="analytics-warning">{filtered.length - stats.n} registro(s) sem nota/modelo válido excluído(s) das métricas de conhecimento.</p>}
        {section !== 5 && isKnowledge && stats.n > 0 && stats.n < 5 && <p className="analytics-warning">Amostra pequena (n={stats.n}). Comparações são descritivas; não demonstram diferenças estatísticas.</p>}
        {!isKnowledge && <p className="card analytics-warning">Questionário original: gráficos dos resultados registrados, separados de Conhecimento v2. Escala e gabarito históricos não são presumidos.</p>}
        {section !== 5 && !filtered.length && <p role="status" className="analytics-empty">Nenhum respondente corresponde aos filtros selecionados.</p>}
        {!presenting && <nav className="analytics-tabs" aria-label="Seções de analytics">{SECTIONS.map((name, i) => <button key={name} aria-current={section === i ? 'page' : undefined} onClick={() => setSection(i)}>{name}</button>)}</nav>}
        {presenting && <div className="analytics-slide-title"><span>{section + 1} / {SECTIONS.length}</span><h2>{SECTIONS[section]}</h2></div>}

        {section === 0 && isKnowledge && <>
          <div className="analytics-insights card"><h2>Leitura do recorte</h2><p>{stats.n ? `${stats.n} notas válidas, média ${fmt(stats.mean)}/26 e mediana ${fmt(stats.median)}/26.` : 'Ainda não há notas válidas neste recorte.'}</p>
            {themeRanking.length > 0 && <p>Menor percentual observado: <strong>{themeRanking[0].name}</strong> ({fmt(themeRanking[0].value)}%). Maior: <strong>{themeRanking.at(-1).name}</strong> ({fmt(themeRanking.at(-1).value)}%). Priorize a revisão dos temas com menor acerto, considerando a cobertura de respostas.</p>}
            <p className="analytics-note">O questionário descreve conhecimento demonstrado; não mede produtividade, competência prática ou maturidade organizacional.</p></div>
          <div className="analytics-grid"><ChartPanel title="Distribuição de acertos" description="Faixas de pontuação, sem classificação de maturidade." rows={histogram} modes={['bar', 'pie', 'table']} />
            <ChartPanel title="Conhecimento por tema" description="Acertos / respostas objetivas válidas por tema. Ausências não são zeros." rows={themes} valueLabel="Acertos (%)" max={100} modes={['radar', 'bar', 'table']} columns={themeColumns.filter(c => c.key !== 'benchmark')} /></div>
          <div className="card analytics-round-callout"><div><span className="eyebrow">Depois do treinamento</span><h3>Uma nova aplicação. Uma comparação real entre rodadas.</h3><p>O calendário não mede aprendizado. Aplique novamente à turma e compare as duas bases, mantendo o anonimato.</p></div><button className="btn btn-outline" onClick={() => setSection(5)}>Ver aplicações →</button></div>
        </>}
        {section === 1 && isKnowledge && <>
          {!presenting && <div className="card analytics-reference"><FilterField label="Benchmark de referência" value={reference} onChange={setReference} options={[
            { value: 'self', label: 'Pesquisa atual — referência interna' }, { value: 'cohort', label: 'Grupo A versus grupo B da pesquisa' }, { value: 'all', label: 'Todas as pesquisas cadastradas' },
            ...dataset.surveys.filter(item => item.id !== id).map(item => ({ value: `survey:${item.id}`, label: surveyName(item) })),
            { value: 'external', label: 'Referência externa fornecida' },
          ]} />
            {reference === 'cohort' && <><FilterField label="Grupo B — Departamento" value={cohort.department} onChange={value => setCohort(v => ({ ...v, department: value }))} options={choices('respondent_department')} />
              <FilterField label="Grupo B — Cargo" value={cohort.role} onChange={value => setCohort(v => ({ ...v, role: value }))} options={choices('respondent_role')} />
              <FilterField label="Grupo B — Frequência" value={cohort.usage} onChange={value => setCohort(v => ({ ...v, usage: value }))} options={[{ value: '', label: 'Todas' }, ...Object.entries(USAGE_OPTIONS).map(([value, label]) => ({ value, label })), { value: MISSING, label: MISSING }]} /></>}
            {reference === 'external' && <><label className="analytics-field"><span>Nota média equivalente /26</span><input type="number" min="0" max="26" step="0.1" value={external.value} onChange={e => setExternal(v => ({ ...v, value: e.target.value }))} /></label>
              <label className="analytics-field"><span>Fonte, data e instrumento comparável</span><input value={external.source} onChange={e => setExternal(v => ({ ...v, source: e.target.value }))} placeholder="Informe a origem e o método" /></label>
              <label className="analytics-field"><span>Tamanho da amostra (se conhecido)</span><input type="number" min="1" value={external.sample} onChange={e => setExternal(v => ({ ...v, sample: e.target.value }))} /></label></>}
          </div>}
          <p className="analytics-note">Referência: {referenceLabel}. {reference === 'external' ? `Fornecida pelo administrador, não validada pelo sistema. Fonte: ${external.source || 'não informada'}. Use apenas instrumentos comparáveis; normalizar a escala não garante comparabilidade.` : reference === 'cohort' ? 'Grupo A usa os filtros do dashboard; grupo B usa os filtros acima. Mesma versão e datas. Os grupos podem se sobrepor.' : `Mesma versão e datas do recorte, sem filtros de departamento, cargo ou frequência. ${reference === 'all' ? 'Inclui a pesquisa atual; média ponderada pelo número de respondentes, não representa o mercado.' : 'Pode incluir os mesmos respondentes do recorte.'}`}</p>
          {compareLoading && <p role="status">Carregando referência completa…</p>}{compareError && <p role="alert" className="analytics-warning">{compareError}</p>}
          {reference === 'all' && <p className="analytics-warning">A base geral pode incluir aplicações iniciais e finais, com pessoas que participaram de mais de uma rodada. O total conta respostas por aplicação, não pessoas únicas. Para comparar o treinamento, use Antes e depois.</p>}
          <div className="analytics-metrics"><Metric label="Média da referência" value={`${fmt(benchmark)} /26`} note={reference === 'external' ? `n=${external.sample || 'não informado'} · valor fornecido` : `n=${benchmarkStats.n} notas válidas`} />
            <Metric label="Recorte − referência" value={delta == null ? '—' : `${delta > 0 ? '+' : ''}${fmt(delta)} pontos`} note={delta == null ? 'Selecione uma referência com dados válidos.' : 'Diferença descritiva de médias'} /></div>
          <div className="analytics-section-control"><FilterField label="Comparar grupos" value={group} onChange={setGroup} options={[{ value: 'respondent_department', label: 'Departamentos' }, { value: 'respondent_role', label: 'Cargos' }, { value: 'usage_frequency', label: 'Frequência de uso' }]} /></div>
          <div className="analytics-grid"><ChartPanel title="Comparação de grupos" description="Média de cada grupo no recorte. Consulte n e dispersão na tabela; grupos pequenos têm maior oscilação." rows={groups} valueKey="mean" valueLabel="Média /26" max={26} reference={benchmark} columns={scoreColumns} />
            <ChartPanel title="Temas versus referência" description="Percentual de acertos em respostas válidas. Referência externa não contém detalhe por tema." rows={themes} valueLabel="Recorte (%)" max={100} comparison={reference !== 'external'} modes={['bar', 'radar', 'table']} columns={themeColumns} /></div>
          {reference === 'all' && <ChartPanel title="Comparação entre pesquisas" description="Cada barra representa uma pesquisa; somente mesma versão e datas. A média geral pondera respondentes." rows={companyGroups} valueKey="mean" valueLabel="Média /26" max={26} columns={scoreColumns} />}
        </>}
        {section === 2 && isKnowledge && <>
          <ChartPanel title="Acertos por questão" description="Q2–Q27; denominador por questão. Q1 é perfil de uso e não compõe a nota." rows={questions} valueLabel="Acertos (%)" max={100} columns={[{ key: 'name', label: 'Questão' }, { key: 'question', label: 'Enunciado' }, { key: 'theme', label: 'Tema' }, { key: 'value', label: 'Acertos (%)' }, { key: 'n', label: 'Respostas válidas' }, { key: 'missing', label: 'Ausentes/inválidas' }]} />
          <AnalyticsTable rows={themes} columns={themeColumns.filter(c => c.key !== 'benchmark')} caption="Cobertura e desempenho por tema" />
        </>}
        {section === 3 && <div className="analytics-grid"><ChartPanel title="Frequência de uso de IA" description={`Perfil informado na coleta · n=${filtered.length}. Não altera a nota de conhecimento.`} rows={profiles.usage} modes={['bar', 'pie', 'table']} />
          <ChartPanel title="Ferramentas utilizadas" description={`Seleção múltipla · base ${filtered.length} respondentes. Contagens podem somar mais que a base; omissão é distinta de não utilizar.`} rows={profiles.tools} /></div>}
        {section === 4 && <section className="card"><div className="analytics-chart-heading"><div><h2>Dados do recorte</h2><p>Notas como registradas; dados pessoais e respostas abertas não são expostos nesta tabela.</p></div><button className="btn btn-outline" onClick={exportData} disabled={!details.length}>Exportar CSV ({details.length})</button></div>
          <AnalyticsTable key={`${safePage}:${JSON.stringify(filters)}`} rows={details.slice(safePage * 25, safePage * 25 + 25)} columns={detailColumns} caption="Respondentes filtrados — ordenação na página atual" />
          <div className="analytics-pagination"><button className="btn btn-outline" disabled={!safePage} onClick={() => setPage(safePage - 1)}>Anterior</button><span>Página {safePage + 1} de {Math.max(1, Math.ceil(details.length / 25))}</span><button className="btn btn-outline" disabled={(safePage + 1) * 25 >= details.length} onClick={() => setPage(safePage + 1)}>Próxima</button></div>
        </section>}
        {section === 5 && <AnalyticsRounds key={id} client={client} surveyId={id} filters={filters} presenting={presenting} refresh={refresh} />}
        {!isKnowledge && section < 3 && <AnalyticsHistorical rows={filtered} allRows={rows} section={section} client={client} refresh={refresh} />}
        <footer className="analytics-footer"><span>Fonte: registros do diagnóstico · Carregado em {dataset.updated} · Datas de coleta em Brasília.</span>{section !== 5 && <span>{isKnowledge ? `${valid.length} notas válidas / ${filtered.length} respondentes no recorte` : `${filtered.length} registros históricos no recorte`}</span>}</footer>
        {presenting && <nav className="analytics-presentation-nav" aria-label="Controles de apresentação"><button className="btn btn-outline" disabled={!section} onClick={() => setSection(v => v - 1)}>← Anterior</button><span aria-live="polite">{section + 1}/{SECTIONS.length} · {SECTIONS[section]}</span><button className="btn btn-primary" disabled={section === SECTIONS.length - 1} onClick={() => setSection(v => v + 1)}>Próximo →</button></nav>}
      </>}
    </main>
  </div>
}
