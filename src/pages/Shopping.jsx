import React, { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Shopping() {
  const [items, setItems] = useState([])

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
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Shopping List
      </h1>

      {items.length === 0 && (
        <p className="text-gray-500">
          No ingredients found — check console log
        </p>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.name}
            className="bg-white p-3 rounded-xl shadow"
          >
            <p className="font-semibold capitalize">
              {item.name}
            </p>

            <p className="text-sm text-gray-500">
              {item.measure.join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}