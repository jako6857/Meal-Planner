import React, { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Heart } from "lucide-react"
import { supabase } from "../lib/supabase"
import { normalizeMeal } from "../lib/normalizeMeal"
import { getMealById } from "../lib/mealsApi"
import { fetchLikedRecipeIds, removeRecipeLike, saveRecipeLike } from "../lib/likes"

const copy = {
  en: {
    loading: "Loading...",
    back: "Back",
    addToMealPlan: "Add to Meal Plan",
    ingredients: "Ingredients",
    howToMake: "How to make it",
    noInstructions: "No preparation instructions available for this recipe.",
    loginToSave: "Please sign in to save recipes.",
    saveFailed: "Could not update saved recipes.",
    days: {
      Monday: "Monday",
      Tuesday: "Tuesday",
      Wednesday: "Wednesday",
      Thursday: "Thursday",
      Friday: "Friday",
      Saturday: "Saturday",
      Sunday: "Sunday",
    },
  },
  da: {
    loading: "Indlæser...",
    back: "Tilbage",
    addToMealPlan: "Tilføj til madplan",
    ingredients: "Ingredienser",
    howToMake: "Sådan laver du den",
    noInstructions: "Ingen tilberedningsvejledning tilgængelig for denne opskrift.",
    loginToSave: "Log ind for at gemme opskrifter.",
    saveFailed: "Kunne ikke opdatere gemte opskrifter.",
    days: {
      Monday: "Mandag",
      Tuesday: "Tirsdag",
      Wednesday: "Onsdag",
      Thursday: "Torsdag",
      Friday: "Fredag",
      Saturday: "Lørdag",
      Sunday: "Søndag",
    },
  },
}

export default function RecipeDetail({ language = "en", user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const t = copy[language] || copy.en

  const [recipe, setRecipe] = useState(null)
  const [showDays, setShowDays] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]

  
  useEffect(() => {
    const load = async () => {
      const meal = await getMealById(id)
      setRecipe(meal)

      if (user && meal?.idMeal) {
        try {
          const ids = await fetchLikedRecipeIds(user.id)
          setIsLiked(ids.has(meal.idMeal))
        } catch {
          setIsLiked(false)
        }
      } else {
        setIsLiked(false)
      }
    }

    load()
  }, [id, user])

  const toggleLike = async () => {
    if (!recipe?.idMeal) {
      return
    }

    if (!user) {
      alert(t.loginToSave)
      return
    }

    try {
      setLikeLoading(true)
      if (isLiked) {
        await removeRecipeLike({ userId: user.id, recipeId: recipe.idMeal })
        setIsLiked(false)
      } else {
        await saveRecipeLike({
          userId: user.id,
          recipeId: recipe.idMeal,
          title: recipe.strMeal || "Untitled recipe",
          image: recipe.strMealThumb || null,
        })
        setIsLiked(true)
      }
    } catch {
      alert(t.saveFailed)
    } finally {
      setLikeLoading(false)
    }
  }

  const addToDay = async (day) => {
    const clean = normalizeMeal(recipe)

    console.log("NORMALIZED:", clean)

    const { error } = await supabase.from("meal_plans").upsert(
      {
        day,
        recipe_id: clean.id,
        title: clean.title,
        image: clean.image,
        ingredients: clean.ingredients,
      },
      { onConflict: "day" }
    )

    if (error) {
      alert(error.message)
      return
    }

    navigate("/meal-prep")
  }

  if (!recipe) return <div>{t.loading}</div>

  return (
    <div className="mx-auto max-w-2xl px-1 pb-2">
      <Link to="/" className="mb-4 block text-sm font-medium text-blue-600">
        ← {t.back}
      </Link>

      <div className="mb-4 flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{recipe.strMeal}</h1>
        <button
          type="button"
          onClick={toggleLike}
          disabled={likeLoading}
          className="rounded-full border border-slate-300 bg-white/80 p-2 backdrop-blur disabled:opacity-60"
          aria-label="Toggle saved recipe"
        >
          <Heart
            size={20}
            className={isLiked ? "text-red-500" : "text-slate-600"}
            fill={isLiked ? "#ef4444" : "transparent"}
          />
        </button>
      </div>

      <img
        src={recipe.strMealThumb}
        alt={recipe.strMeal}
        className="mb-5 h-60 w-full rounded-2xl border border-slate-200 object-cover shadow-sm sm:h-72"
      />

      <button
        onClick={() => setShowDays(!showDays)}
        className="mb-4 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
      >
        {t.addToMealPlan}
      </button>

      {showDays && (
        <div className="grid grid-cols-2 gap-2">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => addToDay(day)}
              className="rounded-lg border border-slate-200 bg-white p-3 text-sm font-medium hover:bg-slate-50"
            >
              {t.days[day] || day}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        <h2 className="mb-2 text-xl font-semibold">{t.ingredients}</h2>
        <ul className="space-y-1">
          {normalizeMeal(recipe).ingredients.map((i, idx) => (
            <li key={idx} className="text-sm text-slate-700">
              {i.name} — {i.measure}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-xl font-semibold">{t.howToMake}</h2>
        <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
          {recipe.strInstructions?.trim() || t.noInstructions}
        </p>
      </div>
    </div>
  )
}