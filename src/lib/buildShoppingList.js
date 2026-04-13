export function buildShoppingList(meals) {
  const map = {}

  meals.forEach((meal) => {
    const ingredients = meal.ingredients || []

    ingredients.forEach((ing) => {
      const key = ing.name.toLowerCase()

      if (!map[key]) {
        map[key] = {
          name: key,
          measure: [],
        }
      }

      map[key].measure.push(ing.measure)
    })
  })

  return Object.values(map)
}