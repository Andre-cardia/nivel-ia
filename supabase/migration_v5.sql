-- ============================================================
-- Nivel IA - Migration v5: Anonymous Respondent Names
-- Execute no Supabase SQL Editor
-- ============================================================

-- Respostas devem permanecer anonimas. Cargo e departamento continuam
-- permitidos para analise agregada, mas nomes nao devem existir em assessments.
ALTER TABLE assessments
  DROP COLUMN IF EXISTS respondent_name,
  DROP COLUMN IF EXISTS stakeholder_name,
  DROP COLUMN IF EXISTS stakeholder_role;
