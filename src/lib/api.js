const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY

const CACHE_PREFIX = "spoonacular-cache:"
const CACHE_TTL_MS = 1000 * 60 * 60 * 24

function readCache(cacheKey) {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${cacheKey}`)
    if (!raw) {
      return null
    }

    const cached = JSON.parse(raw)
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(`${CACHE_PREFIX}${cacheKey}`)
      return null
    }

    return cached.data
  } catch {
    return null
  }
}

function writeCache(cacheKey, data) {
  try {
    localStorage.setItem(
      `${CACHE_PREFIX}${cacheKey}`,
      JSON.stringify({ timestamp: Date.now(), data })
    )
  } catch {
    // Ignore storage failures and fall back to live requests.
  }
}

export async function fetchRecipes() {
  if (!API_KEY) {
    throw new Error("Missing VITE_SPOONACULAR_API_KEY")
  }

  const cacheKey = "random-recipes"
  const cachedRecipes = readCache(cacheKey)
  if (cachedRecipes) {
    return cachedRecipes
  }

  const res = await fetch(
    `https://api.spoonacular.com/recipes/random?number=12&apiKey=${API_KEY}`
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch recipes: ${res.status}`)
  }

  const data = await res.json()
  writeCache(cacheKey, data.recipes || [])
  return data.recipes
}

export async function fetchRecipesByIngredients(ingredients) {
  if (!API_KEY) {
    throw new Error("Missing VITE_SPOONACULAR_API_KEY")
  }

  const normalizedIngredients = ingredients.slice(0, 5).sort().join(",")
  const cacheKey = `ingredients:${normalizedIngredients}`
  const cachedRecipes = readCache(cacheKey)
  if (cachedRecipes) {
    return cachedRecipes
  }

  const res = await fetch(
    `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(normalizedIngredients)}&number=6&apiKey=${API_KEY}`
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch recipe suggestions: ${res.status}`)
  }

  const data = await res.json()
  writeCache(cacheKey, data || [])
  return data
}