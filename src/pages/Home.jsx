import React, { useEffect, useState } from "react"
import { searchMeals } from "../lib/mealsApi"
import { Link } from "react-router-dom"
import { Heart } from "lucide-react"
import { fetchLikedRecipeIds, removeRecipeLike, saveRecipeLike } from "../lib/likes"

const PAGE_SIZE = 20

const CATEGORY_OPTIONS = [
  { value: "", en: "All", da: "Alle" },
  { value: "Breakfast", en: "Breakfast", da: "Morgenmad" },
  { value: "Dessert", en: "Dessert", da: "Dessert" },
  { value: "Seafood", en: "Seafood", da: "Fisk og skaldyr" },
  { value: "Chicken", en: "Chicken", da: "Kylling" },
  { value: "Vegetarian", en: "Vegetarian", da: "Vegetarisk" },
]

const CUISINE_OPTIONS = [
  { value: "", en: "All cuisines", da: "Alle køkkener" },
  { value: "Italian", en: "Italian", da: "Italiensk" },
  { value: "Mexican", en: "Mexican", da: "Mexicansk" },
  { value: "American", en: "American", da: "Amerikansk" },
  { value: "Japanese", en: "Japanese", da: "Japansk" },
]

const copy = {
  en: {
    title: "Recipes",
    searchPlaceholder: "Search recipes...",
    ownRecipes: "Own Recipes",
    all: "All",
    allCuisines: "All cuisines",
    noRecipes: "No recipes found for this filter combination.",
    loading: "Loading recipes...",
    supabaseOnly: "Showing recipes from your Supabase database only.",
    loadMore: "Load more recipes",
    failedLoad: "Failed to load recipes",
    loginToSave: "Please sign in to save recipes.",
    saveFailed: "Could not update saved recipes.",
  },
  da: {
    title: "Opskrifter",
    searchPlaceholder: "Søg opskrifter...",
    ownRecipes: "Egne opskrifter",
    all: "Alle",
    allCuisines: "Alle køkkener",
    noRecipes: "Ingen opskrifter fundet for denne filterkombination.",
    loading: "Indlæser opskrifter...",
    supabaseOnly: "Viser kun opskrifter fra din Supabase-database.",
    loadMore: "Indlæs flere opskrifter",
    failedLoad: "Kunne ikke indlæse opskrifter",
    loginToSave: "Log ind for at gemme opskrifter.",
    saveFailed: "Kunne ikke opdatere gemte opskrifter.",
  },
}

export default function Home({ language = "en", user }) {
  const [recipes, setRecipes] = useState([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [cuisine, setCuisine] = useState("")
  const [source, setSource] = useState("all")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [likedIds, setLikedIds] = useState(new Set())
  const [togglingIds, setTogglingIds] = useState(new Set())
  const t = copy[language] || copy.en

  useEffect(() => {
    const loadLikes = async () => {
      if (!user) {
        setLikedIds(new Set())
        return
      }

      try {
        const ids = await fetchLikedRecipeIds(user.id)
        setLikedIds(ids)
      } catch {
        setLikedIds(new Set())
      }
    }

    loadLikes()
  }, [user])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRecipes({ page: 1, append: false })
    }, 250)

    return () => clearTimeout(timer)
  }, [search, category, cuisine, source])

  const loadRecipes = async ({ page: nextPage, append }) => {
    try {
      setLoading(true)
      setError("")

      const result = await searchMeals({
        query: search,
        category,
        cuisine,
        source,
        page: nextPage,
        pageSize: PAGE_SIZE,
      })

      setTotal(result.total)
      setPage(nextPage)
      setRecipes((prev) => (append ? [...prev, ...result.items] : result.items))
    } catch (err) {
      setError(err.message || t.failedLoad)
      if (!append) {
        setRecipes([])
        setTotal(0)
        setPage(1)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value) => {
    setSearch(value)
  }

  const handleCategory = (cat) => {
    setCategory(cat)
  }

  const handleCuisine = (c) => {
    setCuisine(c)
  }

  const toggleLike = async (event, recipe) => {
    event.preventDefault()
    event.stopPropagation()

    if (!user) {
      setError(t.loginToSave)
      return
    }

    const recipeId = recipe.idMeal
    if (!recipeId) {
      return
    }

    setTogglingIds((prev) => new Set(prev).add(recipeId))

    try {
      const isLiked = likedIds.has(recipeId)

      if (isLiked) {
        await removeRecipeLike({ userId: user.id, recipeId })
        setLikedIds((prev) => {
          const next = new Set(prev)
          next.delete(recipeId)
          return next
        })
      } else {
        await saveRecipeLike({
          userId: user.id,
          recipeId,
          title: recipe.strMeal || "Untitled recipe",
          image: recipe.strMealThumb || null,
        })
        setLikedIds((prev) => new Set(prev).add(recipeId))
      }
    } catch {
      setError(t.saveFailed)
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(recipeId)
        return next
      })
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-1 pb-2">
      <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">{t.title}</h1>

      <input
        className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[15px] shadow-sm outline-none focus:border-blue-400"
        placeholder={t.searchPlaceholder}
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <div className="mb-3 flex flex-wrap gap-2">
        <button
          onClick={() => setSource((prev) => (prev === "own" ? "all" : "own"))}
          className={`rounded-full px-3 py-1.5 text-sm ${
            source === "own" ? "bg-emerald-600 text-white" : "bg-white text-slate-700 border border-slate-200"
          }`}
        >
          {t.ownRecipes}
        </button>

        {CATEGORY_OPTIONS.map((option) => (
          <button
            key={option.value || "all"}
            onClick={() => handleCategory(option.value)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              category === option.value ? "bg-blue-600 text-white" : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            {language === "da" ? option.da : option.en}
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {CUISINE_OPTIONS.map((option) => (
          <button
            key={option.value || "all-cuisines"}
            onClick={() => handleCuisine(option.value)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              cuisine === option.value ? "bg-blue-600 text-white" : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            {language === "da" ? option.da : option.en}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Link
            key={recipe.idMeal}
            to={`/recipe/${recipe.idMeal}`}
            state={recipe}
          >
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md active:scale-[0.99]">
              <button
                type="button"
                onClick={(event) => toggleLike(event, recipe)}
                disabled={togglingIds.has(recipe.idMeal)}
                className="absolute right-2 top-2 z-10 rounded-full border border-white/70 bg-white/45 p-1.5 backdrop-blur disabled:opacity-60"
                aria-label="Toggle saved recipe"
              >
                <Heart
                  size={18}
                  className={likedIds.has(recipe.idMeal) ? "text-red-500" : "text-slate-700"}
                  fill={likedIds.has(recipe.idMeal) ? "#ef4444" : "transparent"}
                />
              </button>
              <img src={recipe.strMealThumb} alt={recipe.strMeal} className="aspect-[4/3] w-full object-cover" />
              <h2 className="px-3 py-3 text-sm font-semibold leading-snug text-slate-800">{recipe.strMeal}</h2>
            </div>
          </Link>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {!loading && recipes.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">{t.noRecipes}</p>
      )}

      {loading && <p className="mt-4 text-sm text-slate-500">{t.loading}</p>}

      {source === "own" && !loading && (
        <p className="mt-2 text-xs text-slate-500">{t.supabaseOnly}</p>
      )}

      {!loading && recipes.length < total && (
        <button
          onClick={() => loadRecipes({ page: page + 1, append: true })}
          className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          {t.loadMore}
        </button>
      )}
    </div>
  )
}