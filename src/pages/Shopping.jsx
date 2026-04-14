import React, { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

const copy = {
  en: {
    title: "Shopping List",
    empty: "No ingredients found yet. Add meals to your plan first.",
  },
  da: {
    title: "Indkoebsliste",
    empty: "Ingen ingredienser endnu. Tilfoej foerst maaltider til din plan.",
  },
}

export default function Shopping({ language = "en" }) {
  const [items, setItems] = useState([])
  const t = copy[language] || copy.en

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data } = await supabase.from("meal_plans").select("*")

    console.log("MEAL DATA:", data) 

    const ingredients = []

    data?.forEach((meal) => {
      if (!meal.ingredients) return

      meal.ingredients.forEach((i) => {
        ingredients.push({
          name: i.name,
          measure: i.measure,
        })
      })
    })

   
    const map = {}

    ingredients.forEach((i) => {
      const key = i.name.toLowerCase()

      if (!map[key]) {
        map[key] = { name: key, measure: [] }
      }

      map[key].measure.push(i.measure)
    })

    setItems(Object.values(map))
  }

  return (
    <div className="mx-auto max-w-2xl px-1 pb-2">
      <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
        {t.title}
      </h1>

      {items.length === 0 && (
        <p className="text-sm text-slate-500">
          {t.empty}
        </p>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.name}
            className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <p className="font-semibold capitalize text-slate-900">
              {item.name}
            </p>

            <p className="text-sm text-slate-500">
              {item.measure.join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}