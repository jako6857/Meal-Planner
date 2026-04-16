create table if not exists public.meal_plans (
  user_id uuid not null references auth.users(id) on delete cascade,
  day text not null,
  recipe_id text not null,
  title text not null,
  image text,
  ingredients jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.meal_plans
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists day text,
  add column if not exists recipe_id text,
  add column if not exists title text,
  add column if not exists image text,
  add column if not exists ingredients jsonb default '[]'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_meal_plans_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists meal_plans_set_updated_at on public.meal_plans;
create trigger meal_plans_set_updated_at
before update on public.meal_plans
for each row
execute function public.set_meal_plans_updated_at();

-- Ensure uniqueness per user/day required by upsert on conflict (user_id, day).
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'meal_plans_user_day_key'
      and conrelid = 'public.meal_plans'::regclass
  ) then
    alter table public.meal_plans
      add constraint meal_plans_user_day_key unique (user_id, day);
  end if;
end
$$;

alter table public.meal_plans enable row level security;

drop policy if exists "users can read own meal plans" on public.meal_plans;
create policy "users can read own meal plans"
on public.meal_plans for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can insert own meal plans" on public.meal_plans;
create policy "users can insert own meal plans"
on public.meal_plans for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update own meal plans" on public.meal_plans;
create policy "users can update own meal plans"
on public.meal_plans for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users can delete own meal plans" on public.meal_plans;
create policy "users can delete own meal plans"
on public.meal_plans for delete
to authenticated
using (auth.uid() = user_id);
