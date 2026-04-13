import { createClient } from "@supabase/supabase-js"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"

const API_BASE = "https://www.themealdb.com/api/json/v1/1"
const CHUNK_SIZE = 100

const loadEnvFile = (filePath) => {
  if (!existsSync(filePath)) {
    return
  }

  const content = readFileSync(filePath, "utf8")
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) {
      return
    }

    const separatorIndex = trimmed.indexOf("=")
    if (separatorIndex === -1) {
      return
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()
    if (!process.env[key]) {
      process.env[key] = value
    }
  })
}

const cwd = process.cwd()
loadEnvFile(path.join(cwd, ".env"))
loadEnvFile(path.join(cwd, ".env.local"))

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing credentials. Set VITE_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in your environment."
  )
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
})

const fetchMealsByLetter = async (letter) => {
  const res = await fetch(`${API_BASE}/search.php?f=${letter}`)
  const data = await res.json()
  return data.meals || []
}

const toRecipeRow = (meal) => ({
  id: meal.idMeal,
  title: meal.strMeal,
  category: meal.strCategory || null,
  cuisine: meal.strArea || null,
  image: meal.strMealThumb || null,
  instructions: meal.strInstructions || null,
  ingredients: Array.from({ length: 20 })
    .map((_, idx) => {
      const i = idx + 1
      const name = meal[`strIngredient${i}`]?.trim()
      const measure = meal[`strMeasure${i}`]?.trim()
      if (!name) {
        return null
      }
      return { name, measure: measure || "" }
    })
    .filter(Boolean),
})

const chunk = (items, size) => {
  const chunks = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

const run = async () => {
  const letters = "abcdefghijklmnopqrstuvwxyz".split("")
  console.log("Fetching recipes from TheMealDB...")

  const results = await Promise.all(letters.map(fetchMealsByLetter))
  const allMeals = results.flat()
  const uniqueMeals = Array.from(new Map(allMeals.map((meal) => [meal.idMeal, meal])).values())
  const rows = uniqueMeals.map(toRecipeRow)

  console.log(`Fetched ${allMeals.length} meals, ${rows.length} unique.`)
  console.log("Upserting to Supabase recipes table...")

  for (const batch of chunk(rows, CHUNK_SIZE)) {
    const { error } = await supabase.from("recipes").upsert(batch, { onConflict: "id" })
    if (error) {
      throw error
    }
  }

  console.log(`Done. Imported ${rows.length} recipes.`)
}

run().catch((error) => {
  console.error("Import failed:", error.message)
  process.exit(1)
})