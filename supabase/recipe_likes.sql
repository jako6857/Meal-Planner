create table if not exists public.recipe_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id text not null,
  title text not null,
  image text,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create index if not exists recipe_likes_user_created_idx
  on public.recipe_likes (user_id, created_at desc);

alter table public.recipe_likes enable row level security;

drop policy if exists "users can read own likes" on public.recipe_likes;
create policy "users can read own likes"
on public.recipe_likes for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can insert own likes" on public.recipe_likes;
create policy "users can insert own likes"
on public.recipe_likes for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can delete own likes" on public.recipe_likes;
create policy "users can delete own likes"
on public.recipe_likes for delete
to authenticated
using (auth.uid() = user_id);
