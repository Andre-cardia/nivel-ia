-- ============================================================
-- Nível IA — Migration v9: questionário versionado knowledge-v2
-- Execute no Supabase SQL Editor antes de publicar esta versão.
-- ============================================================

ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS questionnaire_version TEXT,
  ADD COLUMN IF NOT EXISTS scoring_model TEXT,
  ADD COLUMN IF NOT EXISTS score_max INTEGER,
  ADD COLUMN IF NOT EXISTS usage_frequency TEXT,
  ADD COLUMN IF NOT EXISTS tools_other TEXT,
  ADD COLUMN IF NOT EXISTS answer_details JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_assessments_questionnaire_version
  ON assessments (questionnaire_version);
