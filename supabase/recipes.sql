create table if not exists public.recipes (
  id text primary key,
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