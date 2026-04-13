import React, { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { Link } from "react-router-dom"
import { fetchRecipesByIngredients } from "../lib/api"

export default function Suggestions() {
  const [ingredients, setIngredients] = useState([])
  const [recipes, setRecipes] = useState([])

  useEffect(() => {
    loadIngredients()
  }, [])

  const loadIngredients = async () => {
    const { data, error } = await supabase
      .from("meal_plans")
      .select("ingredients")

    if (error) {
      console.error(error)
      return
    }

    const allIngredients = new Set()

    data.forEach(meal => {
      meal.ingredients?.forEach(ing => {
        allIngredients.add(ing.name.toLowerCase())
      })
    })

    const ingredientList = Array.from(allIngredients)
    setIngredients(ingredientList)

    if (ingredientList.length > 0) {
      fetchRecipes(ingredientList)
    }
  }

  const fetchRecipes = async (ingredients) => {
    try {
      const data = await fetchRecipesByIngredients(ingredients)
      setRecipes(data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Smart Suggestions</h1>

      {/* Ingredient Summary */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Using your ingredients:</h2>
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ing, i) => (
            <span key={i} className="bg-gray-200 px-2 py-1 rounded">
              {ing}
            </span>
          ))}
        </div>
      </div>

      {/* Recipes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recipes.map(recipe => (
          <Link
            key={recipe.id}
            to={`/recipe/${recipe.id}`}
            state={recipe}
          >
            <div className="border rounded-xl p-3 shadow hover:shadow-lg transition">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="rounded-lg mb-2"
              />
              <h2 className="font-semibold">{recipe.title}</h2>

              {/* Match info */}
              <p className="text-sm text-gray-500">
                Uses {recipe.usedIngredientCount} of your ingredients
              </p>
            </div>
          </Link>
        ))}
      </div>

      {recipes.length === 0 && (
        <p>No suggestions yet. Add meals first.</p>
      )}
    </div>
  )
}