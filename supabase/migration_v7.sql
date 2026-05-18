-- ============================================================
-- Nível IA — Migration v7: Re-adicionar respondent_name
-- Execute no Supabase SQL Editor
-- ============================================================

-- Reintroduz a coluna de nome do respondente (removida na v6)
ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS respondent_name TEXT;
