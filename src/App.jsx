import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import './styles/index.css'
import { supabase } from './lib/supabase'
import { useQuiz } from './hooks/useQuiz'
import Landing from './pages/Landing'
import Identification from './pages/Identification'
import Quiz from './pages/Quiz'
import OpenQuestion from './pages/OpenQuestion'
import Result from './pages/Result'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import SurveyNew from './pages/admin/SurveyNew'
import SurveyDetail from './pages/admin/SurveyDetail'

/* ── Quiz flow (public) ──────────────────────────────────── */
function QuizApp() {
  const { token } = useParams()
  const quiz = useQuiz()
  const [survey, setSurvey] = useState(null)
  const [loading, setLoading] = useState(!!token)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) return
    supabase.from('surveys').select('*').eq('token', token).eq('is_active', true).single()
      .then(({ data, err }) => {
        if (err || !data) setError('Pesquisa não encontrada ou inativa.')
        else setSurvey(data)
        setLoading(false)
      })
  }, [token])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--error)' }}>{error}</p>
      </div>
    )
  }

  return (
    <>
      {quiz.step === 'landing'        && <Landing onStart={quiz.startQuiz} survey={survey} />}
      {quiz.step === 'identification' && <Identification onSubmit={quiz.submitIdentification} survey={survey} />}
      {quiz.step === 'quiz'           && (
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
      {quiz.step === 'open'   && <OpenQuestion onSubmit={quiz.submitOpen} />}
      {quiz.step === 'result' && (
        <Result
          totalScore={quiz.totalScore}
          level={quiz.level}
          dimensionScores={quiz.dimensionScores}
          identification={quiz.identification}
          openAnswer={quiz.openAnswer}
          onRestart={quiz.restart}
          survey={survey}
        />
      )}
    </>
  )
}

/* ── Admin guard ─────────────────────────────────────────── */
function AdminRoute() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  if (session === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  if (!session) return <Navigate to="/admin/login" replace />
  
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard onSignOut={handleSignOut} />} />
      <Route path="/surveys/new" element={<SurveyNew onSignOut={handleSignOut} />} />
      <Route path="/surveys/:id" element={<SurveyDetail onSignOut={handleSignOut} />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}

/* ── Root ────────────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public quiz */}
        <Route path="/" element={<QuizApp />} />
        <Route path="/q/:token" element={<QuizApp />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminRoute />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
