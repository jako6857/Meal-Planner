import { supabase } from "./supabase"

const API_BASE = "https://www.themealdb.com/api/json/v1/1"
const RECIPES_CACHE_KEY = "recipes-cache:v1"

const readRecipesCache = () => {
  try {
    const raw = localStorage.getItem(RECIPES_CACHE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeRecipesCache = (items) => {
  try {
    localStorage.setItem(RECIPES_CACHE_KEY, JSON.stringify(items))
  } catch {
    // Ignore storage write failures.
  }
}

const filterCachedMeals = ({ meals, query = "", category = "", cuisine = "" }) => {
  const q = query.trim().toLowerCase()

  return meals.filter((meal) => {
    const matchQuery = q ? (meal.strMeal || "").toLowerCase().includes(q) : true
    const matchCategory = category ? meal.strCategory === category : true
    const matchCuisine = cuisine ? meal.strArea === cuisine : true
    return matchQuery && matchCategory && matchCuisine
  })
}

const paged = (items, page, pageSize) => {
  const from = (page - 1) * pageSize
  return {
    items: items.slice(from, from + pageSize),
    total: items.length,
  }
}

const toMealShape = (row) => ({
  idMeal: row.id,
  strMeal: row.title,
  strCategory: row.category,
  strArea: row.cuisine,
  strMealThumb: row.image,
  strInstructions: row.instructions,
  ingredients: row.ingredients || [],
})

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

const fetchApi = async (path) => {
  const res = await fetch(`${API_BASE}${path}`)
  const data = await res.json()
  return data.meals || []
}

const fetchBySearchApi = async (query) => fetchApi(`/search.php?s=${encodeURIComponent(query)}`)
const fetchByCategoryApi = async (category) => fetchApi(`/filter.php?c=${encodeURIComponent(category)}`)
const fetchByCuisineApi = async (cuisine) => fetchApi(`/filter.php?a=${encodeURIComponent(cuisine)}`)

const uniqueById = (meals) => {
  const map = new Map()
  meals.forEach((meal) => {
    map.set(meal.idMeal, meal)
  })
  return Array.from(map.values())
}

const querySupabaseRecipes = async ({ query = "", category = "", cuisine = "", page = 1, pageSize = 20 }) => {
  let dbQuery = supabase
    .from("recipes")
    .select("*", { count: "exact" })
    .order("title", { ascending: true })

  if (query) {
    dbQuery = dbQuery.ilike("title", `%${query}%`)
  }
  if (category) {
    dbQuery = dbQuery.eq("category", category)
  }
  if (cuisine) {
    dbQuery = dbQuery.eq("cuisine", cuisine)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error, count } = await dbQuery.range(from, to)

  if (error) {
    throw error
  }

  return {
    items: (data || []).map(toMealShape),
    total: count || 0,
  }
}

const querySupabaseRecipesAll = async ({ query = "", category = "", cuisine = "" }) => {
  let dbQuery = supabase
    .from("recipes")
    .select("*")
    .order("title", { ascending: true })

  if (query) {
    dbQuery = dbQuery.ilike("title", `%${query}%`)
  }
  if (category) {
    dbQuery = dbQuery.eq("category", category)
  }
  if (cuisine) {
    dbQuery = dbQuery.eq("cuisine", cuisine)
  }

  const { data, error } = await dbQuery

  if (error) {
    throw error
  }

  return (data || []).map(toMealShape)
}

const fetchExternalMeals = async ({ query = "", category = "", cuisine = "" }) => {
  let meals = []

  if (query) {
    meals = await fetchBySearchApi(query)
  } else if (category && cuisine) {
    const [byCategory, byCuisine] = await Promise.all([
      fetchByCategoryApi(category),
      fetchByCuisineApi(cuisine),
    ])
    const byCuisineIds = new Set(byCuisine.map((meal) => meal.idMeal))
    meals = byCategory.filter((meal) => byCuisineIds.has(meal.idMeal))
  } else if (category) {
    meals = await fetchByCategoryApi(category)
  } else if (cuisine) {
    meals = await fetchByCuisineApi(cuisine)
  } else {
    const seedLetters = ["a", "b", "c", "d", "e"]
    const chunks = await Promise.all(seedLetters.map((letter) => fetchApi(`/search.php?f=${letter}`)))
    meals = chunks.flat()
  }

  if (query && (category || cuisine)) {
    meals = meals.filter((meal) => {
      const matchCategory = category ? meal.strCategory === category : true
      const matchCuisine = cuisine ? meal.strArea === cuisine : true
      return matchCategory && matchCuisine
    })
  }

  return uniqueById(meals)
}

const fallbackFromExternalApi = async ({ query = "", category = "", cuisine = "", page = 1, pageSize = 20 }) => {
  const externalMeals = await fetchExternalMeals({ query, category, cuisine })
  const total = externalMeals.length
  const from = (page - 1) * pageSize
  const items = externalMeals.slice(from, from + pageSize)

  return { items, total }
}

export const searchMeals = async ({ query = "", category = "", cuisine = "", page = 1, pageSize = 20, source = "all" }) => {
  if (source === "own") {
    try {
      const result = await querySupabaseRecipes({ query, category, cuisine, page, pageSize })
      const cached = readRecipesCache()
      const existing = new Map(cached.map((meal) => [meal.idMeal, meal]))
      result.items.forEach((meal) => existing.set(meal.idMeal, meal))
      writeRecipesCache(Array.from(existing.values()))
      return result
    } catch {
      const filtered = filterCachedMeals({ meals: readRecipesCache(), query, category, cuisine })
      return paged(filtered, page, pageSize)
    }
  }

  // Default behavior merges Supabase recipes with TheMealDB results.
  try {
    const [dbItems, externalItems] = await Promise.all([
      querySupabaseRecipesAll({ query, category, cuisine }),
      fetchExternalMeals({ query, category, cuisine }),
    ])

    const merged = uniqueById([...dbItems, ...externalItems])
    writeRecipesCache(merged)

    return paged(merged, page, pageSize)
  } catch {
    // If Supabase table is missing or inaccessible, fall back to TheMealDB.
  }

  try {
    const result = await fallbackFromExternalApi({ query, category, cuisine, page, pageSize })
    const cached = readRecipesCache()
    const existing = new Map(cached.map((meal) => [meal.idMeal, meal]))
    result.items.forEach((meal) => existing.set(meal.idMeal, meal))
    writeRecipesCache(Array.from(existing.values()))
    return result
  } catch {
    const filtered = filterCachedMeals({ meals: readRecipesCache(), query, category, cuisine })
    return paged(filtered, page, pageSize)
  }
}

export const getMealById = async (id) => {
  try {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (!error && data) {
      return toMealShape(data)
    }
  } catch {
    // Fall through to external API.
  }

  const meals = await fetchApi(`/lookup.php?i=${encodeURIComponent(id)}`)
  return meals[0] || null
}

export const upsertRecipesToSupabase = async (meals) => {
  const rows = meals.map(toRecipeRow)
  const { error } = await supabase.from("recipes").upsert(rows, { onConflict: "id" })
  if (error) {
    throw error
  }
}