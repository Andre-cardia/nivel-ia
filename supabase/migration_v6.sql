-- ============================================================
-- Nível IA — Migration v6: Remove colunas de nome e ajustes de schema
-- Execute no Supabase SQL Editor
-- ============================================================

-- Remove colunas de identificação pessoal (anonimização)
-- Inclui o que a v5 deveria ter feito + colunas remanescentes
ALTER TABLE assessments
  DROP COLUMN IF EXISTS respondent_name,
  DROP COLUMN IF EXISTS stakeholder_name,
  DROP COLUMN IF EXISTS stakeholder_role;

-- Garante que total_score aceita valores até 59 (novo máximo)
-- (coluna já é INTEGER, nenhuma alteração necessária no tipo)

-- Confirma que company_name não aceita NULL (manter restrição)
-- sem mudança necessária

-- Índice de nível para relatórios por nível
CREATE INDEX IF NOT EXISTS idx_assessments_level
  ON assessments (level);
