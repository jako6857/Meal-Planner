import React, { useEffect, useState } from "react"
import { searchMeals, getByCategory, getByCuisine } from "../lib/mealsApi"
import { Link } from "react-router-dom"

export default function Home() {
  const [recipes, setRecipes] = useState([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [cuisine, setCuisine] = useState("")

  useEffect(() => {
    loadDefault()
  }, [])

  const loadDefault = async () => {
    const data = await searchMeals("")
    setRecipes(data)
  }

  const handleSearch = async (value) => {
    setSearch(value)
    const data = await searchMeals(value)
    setRecipes(data)
  }

  const handleCategory = async (cat) => {
    setCategory(cat)
    setCuisine("")
    const data =
      cat === ""
        ? await searchMeals("")
        : await getByCategory(cat)
    setRecipes(data)
  }

  const handleCuisine = async (c) => {
    setCuisine(c)
    setCategory("")
    const data =
      c === ""
        ? await searchMeals("")
        : await getByCuisine(c)
    setRecipes(data)
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Recipes</h1>

      {/* SEARCH */}
      <input
        className="border p-2 w-full mb-4"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {/* CATEGORY FILTER */}
      <div className="flex gap-2 flex-wrap mb-3">
        {["", "Breakfast", "Dessert", "Seafood", "Chicken", "Vegetarian"].map((c) => (
          <button
            key={c}
            onClick={() => handleCategory(c)}
            className={`px-3 py-1 rounded ${
              category === c ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {c || "All"}
          </button>
        ))}
      </div>

      {/* CUISINE FILTER */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["", "Italian", "Mexican", "American", "Japanese"].map((c) => (
          <button
            key={c}
            onClick={() => handleCuisine(c)}
            className={`px-3 py-1 rounded ${
              cuisine === c ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {c || "All cuisines"}
          </button>
        ))}
      </div>

      {/* RECIPES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recipes.map((recipe) => (
          <Link
            key={recipe.idMeal}
            to={`/recipe/${recipe.idMeal}`}
            state={recipe}
          >
          <div className="bg-white rounded-2xl shadow p-3 active:scale-[0.98] transition">              <img src={recipe.strMealThumb} />
              <h2>{recipe.strMeal}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}