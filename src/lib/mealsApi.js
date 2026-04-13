export const searchMeals = async (query) => {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
  )
  const data = await res.json()
  return data.meals || []
}

export const getByCategory = async (category) => {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
  )
  const data = await res.json()
  return data.meals || []
}

export const getByCuisine = async (cuisine) => {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?a=${cuisine}`
  )
  const data = await res.json()
  return data.meals || []
}

export const getMealById = async (id) => {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
  )
  const data = await res.json()
  return data.meals?.[0]
}