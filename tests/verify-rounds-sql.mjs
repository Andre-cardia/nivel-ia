// Isolated PostgreSQL/WASM integration check, no connection to Supabase.
// Usage: node tests/verify-rounds-sql.mjs /absolute/path/to/@electric-sql/pglite/dist/index.js
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const { PGlite } = await import(pathToFileURL(process.argv[2]).href)
const db = new PGlite()
try {
  await db.exec(`
    CREATE ROLE authenticated; CREATE ROLE anon;
    CREATE SCHEMA auth;
    CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS
      'SELECT current_setting(''request.jwt.claim.role'', true)';
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS
      'SELECT nullif(current_setting(''request.jwt.claim.sub'', true), '''')::uuid';
    CREATE TABLE auth.users (id uuid PRIMARY KEY);
    INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000001');
    CREATE TABLE public.surveys (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY, token text UNIQUE NOT NULL,
      company_name text NOT NULL, stakeholder_name text NOT NULL, stakeholder_role text,
      is_active boolean DEFAULT true, created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at timestamptz DEFAULT now()
    );
    CREATE TABLE public.assessments (id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      survey_id uuid REFERENCES public.surveys(id) ON DELETE SET NULL);
    ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
    CREATE POLICY admin_access ON public.surveys FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY public_read ON public.surveys FOR SELECT USING (is_active = true);
    GRANT USAGE ON SCHEMA public, auth TO authenticated, anon;
    GRANT ALL ON public.surveys, public.assessments TO authenticated;
    GRANT SELECT ON public.surveys TO anon;
    INSERT INTO public.surveys (id, token, company_name, stakeholder_name)
      VALUES ('10000000-0000-0000-0000-000000000001', 'initial-token', 'Empresa TESTE', 'Stakeholder TESTE');
    INSERT INTO public.assessments (survey_id) VALUES ('10000000-0000-0000-0000-000000000001');
  `)
  const migration = await readFile(new URL('../supabase/migration_v11.sql', import.meta.url), 'utf8')
  await db.exec(migration)
  await db.exec(migration) // Safe replay before/after rollout.
  await db.exec(await readFile(new URL('../supabase/migration_v10.sql', import.meta.url), 'utf8'))
  await db.exec(`SET ROLE anon; SET request.jwt.claim.role = 'anon';`)
  await assert.rejects(() => db.query("SELECT public.create_final_survey('10000000-0000-0000-0000-000000000001')"), /permission denied/)
  await db.exec(`RESET ROLE; SET ROLE authenticated;
    SET request.jwt.claim.role = 'authenticated';
    SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';`)
  const call = "SELECT public.create_final_survey('10000000-0000-0000-0000-000000000001') AS id"
  const first = (await db.query(call)).rows[0].id
  const second = (await db.query(call)).rows[0].id
  assert.equal(first, second, 'retry must return the same final round')
  const final = (await db.query('SELECT * FROM public.surveys WHERE id=$1', [first])).rows[0]
  assert.equal(final.application_phase, 'final')
  assert.equal(final.baseline_survey_id, '10000000-0000-0000-0000-000000000001')
  assert.equal(final.company_name, 'Empresa TESTE')
  assert.notEqual(final.token, 'initial-token')
  assert.equal(final.is_active, true)
  assert.equal((await db.query('SELECT count(*)::int AS n FROM public.assessments')).rows[0].n, 1)
  assert.equal((await db.query('SELECT count(*)::int AS n FROM public.surveys')).rows[0].n, 2)
  await assert.rejects(() => db.query(`INSERT INTO public.surveys
    (token, company_name, stakeholder_name, application_phase, baseline_survey_id)
    VALUES ('duplicate-final', 'TESTE', 'TESTE', 'final', '10000000-0000-0000-0000-000000000001')`), /duplicate key/)
  await db.exec('RESET ROLE')
  await db.exec(migration)
  await db.exec('SET ROLE authenticated')
  assert.equal((await db.query(call)).rows[0].id, first)
  await assert.rejects(() => db.query('SELECT public.create_final_survey($1)', [first]), /inicial/)
  await assert.rejects(() => db.query("SELECT public.create_final_survey('10000000-0000-0000-0000-000000000099')"), /não encontrada/)
  await assert.rejects(() => db.query('UPDATE public.surveys SET baseline_survey_id=id WHERE id=$1', [first]), /inicial/)
  await assert.rejects(() => db.query("UPDATE public.surveys SET application_phase='final' WHERE token='initial-token'"), /vinculada/)
  await db.query('INSERT INTO public.assessments (survey_id) VALUES ($1)', [first])
  await db.query("SELECT public.delete_survey_with_responses('10000000-0000-0000-0000-000000000001')")
  const orphan = (await db.query('SELECT * FROM public.surveys WHERE id=$1', [first])).rows[0]
  assert.equal(orphan.application_phase, 'final')
  assert.equal(orphan.baseline_survey_id, null)
  assert.equal((await db.query('SELECT count(*)::int AS n FROM public.assessments WHERE survey_id=$1', [first])).rows[0].n, 1)
  console.log('PASS: migration replay, RLS/RPC permissions, idempotent creation, separate token, preserved responses, invalid linkage and scoped deletion.')
} catch (error) {
  console.error('FAIL:', error.message)
  process.exitCode = 1
} finally { await db.close() }
