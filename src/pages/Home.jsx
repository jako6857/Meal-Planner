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
    <div className="mx-auto max-w-5xl px-1 pb-2">
      <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">Recipes</h1>

      <input
        className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[15px] shadow-sm outline-none focus:border-blue-400"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <div className="mb-3 flex flex-wrap gap-2">
        {["", "Breakfast", "Dessert", "Seafood", "Chicken", "Vegetarian"].map((c) => (
          <button
            key={c}
            onClick={() => handleCategory(c)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              category === c ? "bg-blue-600 text-white" : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            {c || "All"}
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {["", "Italian", "Mexican", "American", "Japanese"].map((c) => (
          <button
            key={c}
            onClick={() => handleCuisine(c)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              cuisine === c ? "bg-blue-600 text-white" : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            {c || "All cuisines"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Link
            key={recipe.idMeal}
            to={`/recipe/${recipe.idMeal}`}
            state={recipe}
          >
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md active:scale-[0.99]">
              <img src={recipe.strMealThumb} alt={recipe.strMeal} className="aspect-[4/3] w-full object-cover" />
              <h2 className="px-3 py-3 text-sm font-semibold leading-snug text-slate-800">{recipe.strMeal}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}