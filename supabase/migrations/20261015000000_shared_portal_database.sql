create table if not exists public.portal_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique
);

create table if not exists public.portal_records (
  id uuid primary key default gen_random_uuid(),
  record_type text not null check (
    record_type in ('students', 'teachers', 'classes', 'announcements', 'schedules')
  ),
  record_id text not null,
  owner_id uuid references auth.users (id) on delete set null,
  grade text,
  stream text,
  day text,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  unique (record_type, record_id)
);

create index if not exists portal_records_owner_idx
  on public.portal_records (owner_id)
  where record_type = 'students';

create unique index if not exists portal_students_record_id_lower_idx
  on public.portal_records (lower(record_id))
  where record_type = 'students';

create index if not exists portal_records_schedule_idx
  on public.portal_records (grade, stream, day)
  where record_type = 'schedules';

create or replace function public.is_portal_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.portal_admins
    where user_id = (select auth.uid())
  );
$$;

create or replace function public.is_active_portal_student()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.portal_records
    where record_type = 'students'
      and owner_id = (select auth.uid())
      and lower(coalesce(data ->> 'status', 'active')) = 'active'
  );
$$;

create or replace function public.can_read_portal_schedule(
  target_grade text,
  target_stream text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.portal_records as student_record
    where student_record.record_type = 'students'
      and student_record.owner_id = (select auth.uid())
      and lower(coalesce(student_record.data ->> 'status', 'active')) = 'active'
      and student_record.grade = target_grade
      and coalesce(student_record.stream, '') = coalesce(target_stream, '')
  );
$$;

alter table public.portal_admins enable row level security;
alter table public.portal_records enable row level security;

drop policy if exists "Admins manage portal records" on public.portal_records;
create policy "Admins manage portal records"
  on public.portal_records
  for all
  to authenticated
  using ((select public.is_portal_admin()))
  with check ((select public.is_portal_admin()));

drop policy if exists "Students read their own record" on public.portal_records;
create policy "Students read their own record"
  on public.portal_records
  for select
  to authenticated
  using (
    record_type = 'students'
    and owner_id = (select auth.uid())
    and lower(coalesce(data ->> 'status', 'active')) = 'active'
  );

drop policy if exists "Students read shared school records" on public.portal_records;
create policy "Students read shared school records"
  on public.portal_records
  for select
  to authenticated
  using (
    (record_type in ('teachers', 'announcements') and (select public.is_active_portal_student()))
    or (
      record_type = 'schedules'
      and (select public.can_read_portal_schedule(grade, stream))
    )
  );

revoke all on public.portal_admins from anon, authenticated;
revoke all on public.portal_records from anon, authenticated;
revoke all on function public.is_portal_admin() from public, anon;
revoke all on function public.is_active_portal_student() from public, anon;
revoke all on function public.can_read_portal_schedule(text, text) from public, anon;
grant select, insert, update, delete on public.portal_records to authenticated;
grant execute on function public.is_portal_admin() to authenticated;
grant execute on function public.is_active_portal_student() to authenticated;
grant execute on function public.can_read_portal_schedule(text, text) to authenticated;
