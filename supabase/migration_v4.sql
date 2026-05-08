-- ============================================================
-- Nível IA — Migration v4: Admin Delete Policy for Assessments
-- Execute no Supabase SQL Editor
-- ============================================================

-- NOTA: surveys já tem "Admins can manage surveys" (FOR ALL) criada na v2,
-- que cobre UPDATE e DELETE. Esta migration adiciona apenas o que falta.

-- Allow authenticated admins to delete assessments (respondents)
CREATE POLICY "Admins can delete assessments"
  ON assessments FOR DELETE
  USING (auth.role() = 'authenticated');
