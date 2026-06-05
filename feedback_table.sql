-- ============================================================
-- FEEDBACK TABLE + RLS POLICIES
-- Run in Supabase SQL Editor
-- ============================================================

create table if not exists feedback (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references profiles(id) on delete set null,
  category    text not null,
  message     text not null,
  status      text not null default 'open' check (status in ('open', 'resolved')),
  created_at  timestamptz default now()
);

alter table feedback enable row level security;

-- Authenticated users can submit their own feedback
create policy "auth_users_insert_feedback" on feedback
  for insert to authenticated
  with check (auth.uid() = user_id);

-- Unauthenticated users can submit feedback (user_id will be null)
create policy "anon_insert_feedback" on feedback
  for insert to anon
  with check (user_id is null);

-- Admins can read all feedback
create policy "admins_read_feedback" on feedback
  for select to authenticated
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Admins can update feedback status (open/resolved)
create policy "admins_update_feedback" on feedback
  for update to authenticated
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
