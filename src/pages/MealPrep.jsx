import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { deleteMealPlan, fetchMealPlans } from "../lib/mealPlans"

const copy = {
  en: {
    title: "Meal Prep",
    viewDetails: "View Details",
    remove: "Remove",
    addMeal: "+ Add Meal",
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
    title: "Madplan",
    viewDetails: "Se detaljer",
    remove: "Fjern",
    addMeal: "+ Tilføj måltid",
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

export default function MealPrep({ language = "en" }) {
  const [meals, setMeals] = useState([])
  const t = copy[language] || copy.en

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]

  useEffect(() => {
    loadMeals()
  }, [])

  const loadMeals = async () => {
    const data = await fetchMealPlans()
    setMeals(data || [])
  }

  const removeMeal = async (day) => {
    await deleteMealPlan(day)
    loadMeals()
  }

  const getMeal = (day) => {
    return meals.find((m) => m.day === day)
  }

  return (
    <div className="mx-auto max-w-2xl px-1 pb-2">
      <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
        {t.title}
      </h1>

      <div className="space-y-4">
        {days.map((day) => {
          const meal = getMeal(day)

          return (
            <div key={day} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-2 font-semibold text-slate-900">{t.days[day] || day}</h2>

              {meal ? (
                <>
                  <img src={meal.image} alt={meal.title} className="mb-3 h-40 w-full rounded-xl object-cover" />

                  <p className="mb-2 text-sm text-slate-700">{meal.title}</p>

                  <Link
                    to={`/recipe/${meal.recipe_id}`}
                    className="mb-2 block text-sm font-medium text-blue-600"
                  >
                    {t.viewDetails}
                  </Link>

                  <button
                    onClick={() => removeMeal(day)}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600"
                  >
                    {t.remove}
                  </button>
                </>
              ) : (
                <Link
                  to="/"
                  className="text-sm font-medium text-blue-600"
                >
                  {t.addMeal}
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}