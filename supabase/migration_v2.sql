-- ============================================================
-- Nível IA — Migration v2: Survey-Link Model
-- Execute no Supabase SQL Editor
-- ============================================================

-- ── 1. Tabela de pesquisas (surveys) ──────────────────────
CREATE TABLE IF NOT EXISTS surveys (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token            TEXT UNIQUE NOT NULL,
  company_name     TEXT NOT NULL,
  stakeholder_name TEXT NOT NULL,
  stakeholder_role TEXT,
  is_active        BOOLEAN DEFAULT true,
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ── 2. Adicionar colunas em assessments ───────────────────
ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS survey_id       UUID REFERENCES surveys(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS respondent_role TEXT;

-- ── 3. View atualizada (inclui survey info) ───────────────
DROP VIEW IF EXISTS dimension_scores;
CREATE OR REPLACE VIEW dimension_scores AS
SELECT
  aa.assessment_id,
  a.survey_id,
  aa.dimension,
  SUM(aa.score)  AS dimension_score,
  COUNT(*)       AS question_count
FROM assessment_answers aa
JOIN assessments a ON a.id = aa.assessment_id
GROUP BY aa.assessment_id, a.survey_id, aa.dimension;

-- ── 4. RLS para surveys ────────────────────────────────────
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

-- Admins autenticados gerenciam tudo
CREATE POLICY "Admins can manage surveys"
  ON surveys FOR ALL
  USING (auth.role() = 'authenticated');

-- Público pode ler surveys ativas pelo token (para o link funcionar)
CREATE POLICY "Public can read active surveys"
  ON surveys FOR SELECT
  USING (is_active = true);

-- ── 5. Índices de performance ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_surveys_token
  ON surveys (token);

CREATE INDEX IF NOT EXISTS idx_surveys_created_at
  ON surveys (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assessments_survey_id
  ON assessments (survey_id);
