-- ============================================================
-- Nível IA — Database Schema
-- Execute no Supabase SQL Editor
-- ============================================================

-- ── Tabela principal: um registro por diagnóstico ──────────
CREATE TABLE IF NOT EXISTS assessments (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name     TEXT NOT NULL,
  stakeholder_name TEXT NOT NULL,
  stakeholder_role TEXT,
  total_score      INTEGER NOT NULL DEFAULT 0,
  level            TEXT NOT NULL DEFAULT 'inicial',
  open_answer      TEXT,
  completed_at     TIMESTAMPTZ DEFAULT now(),
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ── Tabela de respostas por dimensão ──────────────────────
CREATE TABLE IF NOT EXISTS assessment_answers (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL DEFAULT 0,
  dimension     TEXT NOT NULL,
  selected_option TEXT NOT NULL DEFAULT '-',
  score         INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── View: pontuação por dimensão ──────────────────────────
CREATE OR REPLACE VIEW dimension_scores AS
SELECT
  assessment_id,
  dimension,
  SUM(score)  AS dimension_score,
  COUNT(*)    AS question_count
FROM assessment_answers
GROUP BY assessment_id, dimension;

-- ── Row Level Security ─────────────────────────────────────
ALTER TABLE assessments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode inserir (respondentes anônimos)
CREATE POLICY "Anyone can insert assessments"
  ON assessments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can insert answers"
  ON assessment_answers FOR INSERT
  WITH CHECK (true);

-- Apenas admins autenticados podem ler
CREATE POLICY "Admins can read assessments"
  ON assessments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can read answers"
  ON assessment_answers FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── Índices de performance ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_assessments_created_at
  ON assessments (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_answers_assessment_id
  ON assessment_answers (assessment_id);
