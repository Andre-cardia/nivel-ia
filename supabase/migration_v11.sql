-- Story 6.3: aplicações inicial e final do treinamento.
-- Preparada localmente. Aplicar antes de habilitar a criação da segunda rodada.
BEGIN;

ALTER TABLE public.surveys
  ADD COLUMN IF NOT EXISTS application_phase TEXT NOT NULL DEFAULT 'initial'
    CHECK (application_phase IN ('initial', 'final')),
  ADD COLUMN IF NOT EXISTS baseline_survey_id UUID
    REFERENCES public.surveys(id) ON DELETE SET NULL;

-- Uma única rodada final por aplicação inicial, inclusive sob concorrência.
CREATE UNIQUE INDEX IF NOT EXISTS surveys_one_final_per_baseline
  ON public.surveys(baseline_survey_id) WHERE baseline_survey_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.validate_survey_round()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF NEW.baseline_survey_id IS NOT NULL THEN
    IF NEW.application_phase <> 'final' OR NEW.baseline_survey_id = NEW.id
      OR NOT EXISTS (SELECT 1 FROM public.surveys
        WHERE id = NEW.baseline_survey_id AND application_phase = 'initial') THEN
      RAISE EXCEPTION 'A rodada final deve estar vinculada a uma aplicação inicial.';
    END IF;
  END IF;
  IF NEW.application_phase <> 'initial' AND EXISTS (
    SELECT 1 FROM public.surveys WHERE baseline_survey_id = NEW.id
  ) THEN
    RAISE EXCEPTION 'Uma aplicação inicial vinculada não pode se tornar final.';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS validate_survey_round ON public.surveys;
CREATE TRIGGER validate_survey_round BEFORE INSERT OR UPDATE ON public.surveys
  FOR EACH ROW EXECUTE FUNCTION public.validate_survey_round();

CREATE OR REPLACE FUNCTION public.create_final_survey(initial_survey_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  initial_row public.surveys%ROWTYPE;
  final_id UUID;
BEGIN
  IF auth.role() IS DISTINCT FROM 'authenticated' OR auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO initial_row FROM public.surveys WHERE id = initial_survey_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pesquisa inicial não encontrada.'; END IF;
  IF initial_row.application_phase <> 'initial' THEN
    RAISE EXCEPTION 'Selecione uma aplicação inicial, não uma rodada final.';
  END IF;
  SELECT id INTO final_id FROM public.surveys WHERE baseline_survey_id = initial_survey_id;
  IF final_id IS NOT NULL THEN RETURN final_id; END IF;

  INSERT INTO public.surveys (token, company_name, stakeholder_name, stakeholder_role,
    created_by, application_phase, baseline_survey_id)
  VALUES (replace(gen_random_uuid()::text, '-', ''), initial_row.company_name,
    initial_row.stakeholder_name, initial_row.stakeholder_role, auth.uid(), 'final', initial_survey_id)
  RETURNING id INTO final_id;
  RETURN final_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_final_survey(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_final_survey(UUID) TO authenticated;
COMMIT;

-- Não altera assessments, questionário, RLS ou respostas existentes.
-- Ao excluir a inicial, a final e suas respostas são preservadas (vínculo fica NULL).
-- A aplicação mantém o rótulo final e informa que a referência não está disponível.
