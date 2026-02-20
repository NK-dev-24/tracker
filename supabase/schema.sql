-- ============================================================
-- 75 HARD TRACKER — Supabase Schema (v2)
-- Run this in your Supabase SQL editor (replace existing)
-- ============================================================

-- 1. Profiles table
create table if not exists public.profiles (
  id                  uuid references auth.users on delete cascade primary key,
  email               text,
  name                text,
  has_paid            boolean not null default false,
  onboarding_complete boolean not null default false,
  created_at          timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Service role can do anything on profiles"
  on public.profiles for all using (true) with check (true);

-- 2. Challenges (one per user — their active challenge settings + state)
create table if not exists public.challenges (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid not null references public.profiles(id) on delete cascade unique,
  duration            integer not null default 75,     -- 31 | 75 | 90
  start_date          date,
  end_date            date,                            -- computed: start_date + duration
  current_day         integer not null default 1,
  streak_active       boolean not null default true,
  last_completed_date date,
  custom_tasks        jsonb,                           -- [{id, label, description}, ...] or null = use defaults
  updated_at          timestamptz not null default now()
);

alter table public.challenges enable row level security;

create policy "Users manage own challenge"
  on public.challenges for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Service role can do anything on challenges"
  on public.challenges for all using (true) with check (true);

-- 3. Daily logs
create table if not exists public.daily_logs (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  log_date        date not null,
  completed_tasks text[] not null default '{}',
  all_complete    boolean not null default false,
  created_at      timestamptz not null default now(),
  unique(user_id, log_date)
);

alter table public.daily_logs enable row level security;

create policy "Users manage own daily logs"
  on public.daily_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
