/* The shared database. Questions the owner adds on /admin live in Supabase —
 * a real Postgres table — so every student on every device reads the same bank
 * without the site being redeployed.
 *
 * Reads are a plain select on public.questions, which is open to everyone.
 * Writes never touch the table: they go through four SECURITY DEFINER functions
 * in the public schema (check_admin, add_question, update_question,
 * delete_question, import_questions) exposed as RPC endpoints. The admin
 * password is an ARGUMENT to those functions and is verified inside Postgres
 * against a bcrypt hash, so the browser sends no custom header and the anon key
 * is the only credential on the wire.
 *
 * The password is never stored anywhere: the owner types it on /admin, it lives
 * in this module's memory for that session only, and closing the tab forgets it.
 *
 * Requests carry exactly two headers — apikey and Content-Type. No
 * Authorization: Bearer, because the publishable key is not a JWT and some
 * gateways reject it in that position.
 *
 * The REST calls are plain fetch() rather than the supabase-js client: one
 * table, a handful of verbs, and no 40 KB library in the landing chunk. */

import { SUPABASE_KEY, SUPABASE_URL } from '@/lib/config'

const URL_BASE = SUPABASE_URL.replace(/\/+$/, '')
const API_KEY = SUPABASE_KEY || undefined

export const questionsReady = Boolean(URL_BASE && API_KEY)

/* Set from the /admin login screen. Deliberately a module variable: nothing
   writes it to localStorage, sessionStorage or a cookie, so closing the tab
   forgets it. */
let writeKey: string | null = null

export function setWriteKey(key: string | null) {
  writeKey = key && key.trim() ? key.trim() : null
}

export function hasWriteKey() {
  return Boolean(writeKey)
}

/* The SQL the owner runs once. Every write function is SECURITY DEFINER, owned
   by the postgres role, so a caller with only the anon key can execute it and
   still not insert into the table directly. Replace CHANGE-ME-PASSWORD on the
   `select public.set_admin_password(...)` line with the password you will type
   on /admin, then run the whole script. */
export const SETUP_SQL = `-- EduMahi setup. Run once in the Supabase SQL Editor.
-- Replace CHANGE-ME-PASSWORD on the set_admin_password line near the bottom.

create extension if not exists pgcrypto;

create table if not exists public.questions (
  id          bigint primary key,
  exam        text not null,
  subject     text not null,
  chapter     text not null default 'Unclassified',
  year        int,
  shift       text,
  type        text not null default 'Practice',
  difficulty  text not null default 'Medium',
  question_en text not null,
  question_hi text not null,
  options_en  jsonb not null default '[]'::jsonb,
  options_hi  jsonb not null default '[]'::jsonb,
  image_url   text,
  answer      int  not null check (answer between 0 and 3),
  solution_en text not null default '',
  solution_hi text not null default '',
  created_at  timestamptz not null default now()
);

alter table public.questions enable row level security;

-- Everyone may read the bank.
drop policy if exists "questions are public" on public.questions;
create policy "questions are public" on public.questions
  for select using (true);

-- Nobody may write to it directly. No insert/update/delete policy is created,
-- and the table grants are revoked, so even a valid login is refused here.
revoke insert, update, delete, truncate on public.questions from anon, authenticated;
grant select on public.questions to anon, authenticated;

-- The only secret: a bcrypt hash. No policy grants select on this table, so the
-- anon key cannot read it through the REST API either.
create table if not exists public.edumahi_admin (
  id            int primary key default 1 check (id = 1),
  password_hash text not null
);
alter table public.edumahi_admin enable row level security;
revoke all on public.edumahi_admin from anon, authenticated;

-- Internal check. Lives in a schema the API does not expose.
create schema if not exists edumahi_private;
revoke all on schema edumahi_private from anon, authenticated;

create or replace function edumahi_private.admin_ok(pw text)
returns boolean
language sql
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.edumahi_admin
    where id = 1 and password_hash = crypt(coalesce(pw, ''), password_hash)
  );
$$;
revoke all on function edumahi_private.admin_ok(text) from public, anon, authenticated;

-- >>> CHANGE-ME-PASSWORD: write your own password inside the quotes, then run.
create or replace function public.set_admin_password(pw text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.edumahi_admin (id, password_hash)
  values (1, crypt(pw, gen_salt('bf')))
  on conflict (id) do update set password_hash = excluded.password_hash;
end;
$$;
select public.set_admin_password('CHANGE-ME-PASSWORD');
drop function if exists public.set_admin_password(text);

-- Is the password right? Returns a boolean, never an error, so a wrong guess
-- gets a plain "no" and costs the same as a right one.
create or replace function public.check_admin(pw text)
returns boolean
language sql
security definer
set search_path = public, pg_temp
as $$ select edumahi_private.admin_ok(pw); $$;

-- Insert one question. The payload is the row shape the /admin form builds.
create or replace function public.add_question(pw text, q jsonb)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare new_id bigint;
begin
  if not edumahi_private.admin_ok(pw) then
    raise exception 'Wrong admin password' using errcode = '28000';
  end if;

  insert into public.questions (
    id, exam, subject, chapter, year, shift, type, difficulty,
    question_en, question_hi, options_en, options_hi, image_url, answer,
    solution_en, solution_hi
  ) values (
    coalesce((q->>'id')::bigint, (select coalesce(max(id), 0) + 1 from public.questions)),
    q->>'exam',
    q->>'subject',
    coalesce(nullif(q->>'chapter', ''), 'Unclassified'),
    nullif(q->>'year', '')::int,
    nullif(q->>'shift', ''),
    coalesce(nullif(q->>'type', ''), 'Practice'),
    coalesce(nullif(q->>'difficulty', ''), 'Medium'),
    q->>'question_en',
    coalesce(nullif(q->>'question_hi', ''), q->>'question_en'),
    coalesce(q->'options_en', '[]'::jsonb),
    coalesce(q->'options_hi', '[]'::jsonb),
    nullif(q->>'image_url', ''),
    (q->>'answer')::int,
    coalesce(q->>'solution_en', ''),
    coalesce(nullif(q->>'solution_hi', ''), q->>'solution_en', '')
  )
  on conflict (id) do update set
    exam = excluded.exam,
    subject = excluded.subject,
    chapter = excluded.chapter,
    year = excluded.year,
    shift = excluded.shift,
    type = excluded.type,
    difficulty = excluded.difficulty,
    question_en = excluded.question_en,
    question_hi = excluded.question_hi,
    options_en = excluded.options_en,
    options_hi = excluded.options_hi,
    image_url = excluded.image_url,
    answer = excluded.answer,
    solution_en = excluded.solution_en,
    solution_hi = excluded.solution_hi
  returning id into new_id;

  return new_id;
end;
$$;

-- Edit one question by id. add_question upserts, so this is the same write with
-- the id required — kept as its own endpoint so an edit can never insert.
create or replace function public.update_question(pw text, q jsonb)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare target bigint := nullif(q->>'id', '')::bigint;
begin
  if not edumahi_private.admin_ok(pw) then
    raise exception 'Wrong admin password' using errcode = '28000';
  end if;
  if target is null then
    raise exception 'update_question needs a question id' using errcode = '22023';
  end if;
  if not exists (select 1 from public.questions where id = target) then
    raise exception 'No question with id %', target using errcode = 'P0002';
  end if;
  return public.add_question(pw, q);
end;
$$;

create or replace function public.delete_question(pw text, qid bigint)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not edumahi_private.admin_ok(pw) then
    raise exception 'Wrong admin password' using errcode = '28000';
  end if;
  delete from public.questions where id = qid;
  return true;
end;
$$;

-- Bulk upload: one array of rows, one transaction. A bad row aborts the lot
-- rather than leaving half a sheet in the bank.
create or replace function public.import_questions(pw text, rows jsonb)
returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare item jsonb; done int := 0;
begin
  if not edumahi_private.admin_ok(pw) then
    raise exception 'Wrong admin password' using errcode = '28000';
  end if;
  if rows is null or jsonb_typeof(rows) <> 'array' then
    raise exception 'import_questions needs a JSON array' using errcode = '22023';
  end if;
  for item in select * from jsonb_array_elements(rows) loop
    perform public.add_question(pw, item);
    done := done + 1;
  end loop;
  return done;
end;
$$;

-- Only these four are callable from the browser.
revoke all on function public.check_admin(text) from public, anon, authenticated;
revoke all on function public.add_question(text, jsonb) from public, anon, authenticated;
revoke all on function public.update_question(text, jsonb) from public, anon, authenticated;
revoke all on function public.delete_question(text, bigint) from public, anon, authenticated;
revoke all on function public.import_questions(text, jsonb) from public, anon, authenticated;

grant execute on function public.check_admin(text) to anon, authenticated;
grant execute on function public.add_question(text, jsonb) to anon, authenticated;
grant execute on function public.update_question(text, jsonb) to anon, authenticated;
grant execute on function public.delete_question(text, bigint) to anon, authenticated;
grant execute on function public.import_questions(text, jsonb) to anon, authenticated;

-- Reload PostgREST's schema cache so the new functions appear immediately.
notify pgrst, 'reload schema';
`

/* The exact URL a call went to, kept on the error so the admin screen can show
 * it. "Failed to fetch" from the browser names neither the host nor the cause,
 * and that is the only clue an owner gets when the request never leaves. */
export type DbError = Error & { status?: number; url?: string; body?: string }

function dbError(message: string): DbError {
  return new Error(message)
}

/* Postgres error codes the functions raise, mapped to something an owner can
   act on. 28000 is a wrong password; P0002 is a missing row. */
const DB_MESSAGES: Record<string, string> = {
  '28000': 'That password does not match the one in the database.',
  P0002: 'That question is no longer in the database. Reload and try again.',
  '22023': 'The database refused the payload: a required field was empty or malformed.',
  '42883': 'The write functions are missing. Run the setup SQL in the Supabase SQL Editor.',
  '42501': 'Postgres refused that call (permission). Re-run the setup SQL so the grants are in place.',
  PGRST202: 'The function is not exposed yet. Run the setup SQL, then reload this page.',
  PGRST205: 'The questions table does not exist yet. Run the setup SQL first.',
}

async function request<T>(url: string, init: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, init)
  } catch (err) {
    /* fetch only rejects when the request never completed: no network, DNS,
       CORS, or a blocked request. Say which URL, because that is the half the
       browser refuses to tell us. */
    throw dbError(
      `Could not reach ${url} — ${(err as Error).message}. The browser blocked or failed the request before the database answered.`,
    )
  }

  const detail = await res.text().catch(() => '')
  if (!res.ok) {
    let code = ''
    let msg = ''
    try {
      const parsed = JSON.parse(detail) as { code?: string; message?: string; details?: string; hint?: string }
      code = parsed.code ?? ''
      msg = [parsed.message, parsed.details, parsed.hint].filter(Boolean).join(' — ')
    } catch {
      msg = detail.slice(0, 300)
    }
    const friendly = DB_MESSAGES[code]
    const e = dbError(`${friendly ?? 'The database refused the call.'} ${msg}`.trim()) as DbError
    e.status = res.status
    e.url = url
    e.body = detail
    throw e
  }
  if (!detail) return undefined as T
  try {
    return JSON.parse(detail) as T
  } catch {
    throw dbError(`The database answered ${url} with something that is not JSON: ${detail.slice(0, 160)}`)
  }
}

/* The one place headers are set: apikey and Content-Type, nothing else. */
function headers(): Record<string, string> {
  if (!API_KEY) throw dbError('No publishable key is set: the key in src/lib/config.ts is empty.')
  return { apikey: API_KEY, 'Content-Type': 'application/json' }
}

async function read<T>(path: string): Promise<T> {
  if (!URL_BASE) throw dbError('No database is connected yet: the URL in src/lib/config.ts is empty.')
  return request<T>(`${URL_BASE}/rest/v1/${path}`, { method: 'GET', headers: headers() })
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  if (!URL_BASE) throw dbError('No database is connected yet: the URL in src/lib/config.ts is empty.')
  return request<T>(`${URL_BASE}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(args),
  })
}

/* The password the caller typed, or a clear refusal rather than a 401 from the
   function's own guard. */
function requireKey(): string {
  if (!writeKey) throw dbError('Enter the admin password first.')
  return writeKey
}

/* Checked by the database function, not by a header the policy inspects. A real
   boolean: wrong guess and right guess look alike from the outside. */
export async function checkWriteKey(key: string): Promise<boolean> {
  const candidate = key.trim()
  if (!candidate) throw dbError('Enter the admin password.')
  const ok = await rpc<boolean>('check_admin', { pw: candidate })
  if (!ok) {
    setWriteKey(null)
    throw dbError('That password does not match the one in the database.')
  }
  setWriteKey(candidate)
  return true
}

let highWater = 0

/* The shape the rest of the site reads. Mirrors Question in data/questions.ts
   plus the optional image. */
export type StoredQuestion = {
  id: number
  exam: string
  subject: string
  chapter: string
  year: number | null
  shift: string | null
  type: string
  difficulty: string
  question_en: string
  question_hi: string
  options_en: string[]
  options_hi: string[]
  image_url: string | null
  answer: number
  solution_en: string
  solution_hi: string
}

export async function fetchStoredQuestions(): Promise<StoredQuestion[]> {
  return read<StoredQuestion[]>('questions?select=*&order=id.asc')
}

export async function insertStoredQuestions(rows: StoredQuestion[]): Promise<void> {
  const pw = requireKey()
  if (rows.length === 0) return
  if (rows.length === 1) {
    await rpc<number>('add_question', { pw, q: rows[0] })
    return
  }
  await rpc<number>('import_questions', { pw, rows })
}

export async function updateStoredQuestion(row: StoredQuestion): Promise<void> {
  await rpc<number>('update_question', { pw: requireKey(), q: row })
}

export async function deleteStoredQuestion(id: number): Promise<void> {
  await rpc<boolean>('delete_question', { pw: requireKey(), qid: id })
}

/* The next free id. Cached across a session so two adds in a row do not race
   for the same number. */
export function noteHighestId(ids: number[]) {
  highWater = Math.max(highWater, ...ids, 0)
}
export function claimId(seedMax: number) {
  highWater = Math.max(highWater, seedMax) + 1
  return highWater
}
