# Meal Planner App

Mobile-first meal planner built with React, Vite, Tailwind, and Supabase.

## What changed

- Home recipes now load with pagination (`20` per page + "Load more")
- Filtering supports `search + category + cuisine` at the same time
- Recipe queries are `Supabase-first` with TheMealDB fallback
- Recipe details fetch through the shared API layer
- Added one-time bulk import script to fill Supabase with many recipes
- Added in-app auth (sign up, sign in, sign out)
- Added a Create Recipe screen for logged-in users that saves directly to Supabase

## Setup

### 1) Environment variables

Create `.env` with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For importing recipes, also add a service role key (do not expose this in frontend code):

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2) Create recipes table in Supabase

Run SQL from `supabase/recipes.sql` in the Supabase SQL editor.

This adds:

- `user_id` ownership for custom recipes
- RLS policies so only authenticated users can create/update/delete their own recipes
- Public read access so everyone can browse recipes

### 3) Create likes table in Supabase

Run SQL from `supabase/recipe_likes.sql` in the Supabase SQL editor.

This adds:

- Per-user saved recipes (likes)
- RLS policies so users can only read/write their own saved recipes

### 4) Import many recipes

```bash
npm run import:recipes
```

This pulls a large recipe set from TheMealDB and upserts into `public.recipes`.

### 5) Run the app

```bash
npm install
npm run dev
```

## Notes

- Home page reads from `public.recipes` with server-side filtering and paging.
- If the table is empty or unavailable, the app falls back to TheMealDB automatically.
- Since data is local in Supabase after import, you get more recipes and fewer external API calls during normal use.
- Users can create their own recipes in-app from the Create tab after signing in on the Profile tab.
- Logged-in users can save/unsave recipes with hearts, and see them under Profile -> Saved Recipes.
