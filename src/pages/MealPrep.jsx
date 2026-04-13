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
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Meal Prep
      </h1>

      <div className="space-y-4">
        {days.map((day) => {
          const meal = getMeal(day)

          return (
            <div key={day} className="bg-white p-4 rounded-xl shadow">
              <h2 className="font-semibold mb-2">{day}</h2>

              {meal ? (
                <>
                  <img src={meal.image} className="rounded mb-2" />

                  <p className="mb-2">{meal.title}</p>

                  {/* 🔥 FIXED: only pass ID */}
                  <Link
                    to={`/recipe/${meal.recipe_id}`}
                    className="text-blue-500 block mb-2"
                  >
                    View Details
                  </Link>

                  <button
                    onClick={() => removeMeal(day)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <Link
                  to="/"
                  className="text-blue-500"
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