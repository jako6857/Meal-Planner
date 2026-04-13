import React, { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { normalizeMeal } from "../lib/normalizeMeal"

export default function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [recipe, setRecipe] = useState(null)
  const [showDays, setShowDays] = useState(false)

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]

  
  useEffect(() => {
    const load = async () => {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
      )
      const data = await res.json()
      setRecipe(data.meals?.[0])
    }

    load()
  }, [id])

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

  if (!recipe) return <div>Loading...</div>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Link to="/" className="text-blue-500 mb-4 block">
        ← Back
      </Link>

      <h1 className="text-3xl font-bold mb-4">
        {recipe.strMeal}
      </h1>

      <img
        src={recipe.strMealThumb}
        alt={recipe.strMeal}
        className="rounded-xl mb-6"
      />

      <button
        onClick={() => setShowDays(!showDays)}
        className="bg-blue-500 text-white px-4 py-2 rounded-xl mb-4 w-full"
      >
        Add to Meal Plan
      </button>

      {showDays && (
        <div className="grid grid-cols-2 gap-2">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => addToDay(day)}
              className="border p-3 rounded-lg hover:bg-gray-100"
            >
              {day}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
        <ul className="space-y-1">
          {normalizeMeal(recipe).ingredients.map((i, idx) => (
            <li key={idx} className="text-gray-700">
              {i.name} — {i.measure}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}