-- ============================================================
-- Nível IA — Migration v3: Respondent Department
-- Execute no Supabase SQL Editor
-- ============================================================

ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS respondent_department TEXT;
