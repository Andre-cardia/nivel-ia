-- ============================================================
-- Nível IA — Migration v8: Ferramentas de IA utilizadas
-- Execute no Supabase SQL Editor antes de publicar esta versão.
-- ============================================================

ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS tools_used TEXT[] NOT NULL DEFAULT '{}';
