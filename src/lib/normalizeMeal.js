export function normalizeMeal(meal) {
  if (!meal) return { ingredients: [] }

  const ingredients = []

  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`]
    const measure = meal[`strMeasure${i}`]

    if (
      name &&
      typeof name === "string" &&
      name.trim() !== "" &&
      name.toLowerCase() !== "null"
    ) {
      ingredients.push({
        name: name.trim().toLowerCase(),
        measure: measure ? measure.trim() : "",
      })
    }
  }

  return {
    id: meal.idMeal,
    title: meal.strMeal,
    image: meal.strMealThumb,
    instructions: meal.strInstructions,
    ingredients,
  }
}