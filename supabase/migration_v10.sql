-- ============================================================
-- Nível IA — Migration v10: Permanent Survey Deletion
-- Execute no Supabase SQL Editor
-- ============================================================

-- The function is transactional: a failure in either DELETE rolls back both.
CREATE OR REPLACE FUNCTION public.delete_survey_with_responses(target_survey_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  -- assessment_answers are deleted by their ON DELETE CASCADE constraint.
  DELETE FROM public.assessments
  WHERE survey_id = target_survey_id;

  DELETE FROM public.surveys
  WHERE id = target_survey_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_survey_with_responses(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_survey_with_responses(UUID) TO authenticated;
