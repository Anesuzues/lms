-- Unique certificate records for verification
create table if not exists public.certificates (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  user_name   text not null,
  course_name text not null,
  completed_at timestamptz,
  issued_at   timestamptz not null default now()
);

alter table public.certificates enable row level security;

-- Anyone can read a certificate (needed for public /verify/:id page)
create policy "Public read certificates"
  on public.certificates for select
  using (true);

-- Authenticated users can insert only their own certificates
create policy "Users insert own certificates"
  on public.certificates for insert
  with check (auth.uid() = user_id);
