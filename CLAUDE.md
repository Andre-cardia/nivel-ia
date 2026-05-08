# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server (Vite HMR)
npm run build     # production build
npm run lint      # ESLint
npm run preview   # preview production build locally
```

No test framework is configured.

## Environment

Copy `.env.local.example` to `.env.local` and fill in:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Architecture

**Stack**: React 19 + Vite 8, React Router v7, Supabase JS v2.

### Public quiz flow

The entire quiz lives at the `/` route. Navigation between steps is **not router-based** — it's a state machine managed by `useQuiz` (`src/hooks/useQuiz.js`). Steps in order: `landing → identification → quiz → open → result`. `App.jsx` renders `<QuizApp>` which switches on `quiz.step`.

### Scoring engine (`src/lib/scoring.js`)

- 25 questions, answers A/B/C/D map to 0/1/2/3 points (max 75).
- 8 dimensions (e.g. `ia_generativa`, `riscos_etica`), each covering 3–4 question numbers.
- 4 levels by total score: `inicial` (0–18), `basico` (19–37), `intermediario` (38–56), `avancado` (57–75).

### Admin panel

- Route `/admin` is protected by `AdminRoute` in `App.jsx`, which checks `supabase.auth.getSession()` and redirects to `/admin/login` if unauthenticated.
- Auth is Supabase email+password (`signInWithPassword`).
- Admin pages are in `src/pages/admin/`.

### Database (Supabase)

Two tables: `assessments` (one row per completed quiz) and `assessment_answers` (one row per question). RLS is enabled: anonymous users can INSERT, only authenticated users can SELECT. Schema and migrations are in `supabase/`.

### Styling

Global CSS custom properties (`--bg`, `--s4`, `--font-mono`, etc.) defined in `src/styles/index.css`. UI components use utility classes like `btn`, `card`, `input-field`, `eyebrow`.
