import React, { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { Link } from "react-router-dom"

export default function MealPrep() {
  const [meals, setMeals] = useState([])

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]

  useEffect(() => {
    loadMeals()
  }, [])

  const loadMeals = async () => {
    const { data } = await supabase.from("meal_plans").select("*")
    setMeals(data || [])
  }

  const removeMeal = async (day) => {
    await supabase.from("meal_plans").delete().eq("day", day)
    loadMeals()
  }

  const getMeal = (day) => {
    return meals.find((m) => m.day === day)
  }

  return (
    <div className="mx-auto max-w-2xl px-1 pb-2">
      <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
        Meal Prep
      </h1>

      <div className="space-y-4">
        {days.map((day) => {
          const meal = getMeal(day)

          return (
            <div key={day} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-2 font-semibold text-slate-900">{day}</h2>

              {meal ? (
                <>
                  <img src={meal.image} alt={meal.title} className="mb-3 h-40 w-full rounded-xl object-cover" />

                  <p className="mb-2 text-sm text-slate-700">{meal.title}</p>

                  <Link
                    to={`/recipe/${meal.recipe_id}`}
                    className="mb-2 block text-sm font-medium text-blue-600"
                  >
                    View Details
                  </Link>

                  <button
                    onClick={() => removeMeal(day)}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <Link
                  to="/"
                  className="text-sm font-medium text-blue-600"
                >
                  + Add Meal
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}