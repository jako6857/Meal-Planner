create table if not exists public.recipes (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  category text,
  cuisine text,
  image text,
  instructions text,
  ingredients jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recipes_title_idx on public.recipes (title);
create index if not exists recipes_category_idx on public.recipes (category);
create index if not exists recipes_cuisine_idx on public.recipes (cuisine);
create index if not exists recipes_user_id_idx on public.recipes (user_id);

alter table public.recipes
add column if not exists user_id uuid references auth.users(id) on delete set null;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists recipes_set_updated_at on public.recipes;
create trigger recipes_set_updated_at
before update on public.recipes
for each row
execute function public.set_updated_at();

alter table public.recipes enable row level security;

drop policy if exists "recipes are readable by everyone" on public.recipes;
create policy "recipes are readable by everyone"
on public.recipes for select
using (true);

drop policy if exists "authenticated users can insert own recipes" on public.recipes;
create policy "authenticated users can insert own recipes"
on public.recipes for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update own recipes" on public.recipes;
create policy "users can update own recipes"
on public.recipes for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users can delete own recipes" on public.recipes;
create policy "users can delete own recipes"
on public.recipes for delete
to authenticated
using (auth.uid() = user_id);