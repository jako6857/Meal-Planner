import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

const parseIngredients = (text) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [namePart, ...measureParts] = line.split("-")
      return {
        name: namePart.trim().toLowerCase(),
        measure: measureParts.join("-").trim(),
      }
    })
    .filter((item) => item.name)

export default function CreateRecipe({ user }) {
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [cuisine, setCuisine] = useState("")
  const [image, setImage] = useState("")
  const [instructions, setInstructions] = useState("")
  const [ingredientsText, setIngredientsText] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()

    if (!user) {
      setError("You must be signed in to create recipes.")
      return
    }

    try {
      setLoading(true)
      setError("")

      const { error: insertError } = await supabase.from("recipes").insert({
        id: `user-${crypto.randomUUID()}`,
        user_id: user.id,
        title: title.trim(),
        category: category.trim() || null,
        cuisine: cuisine.trim() || null,
        image: image.trim() || null,
        instructions: instructions.trim() || null,
        ingredients: parseIngredients(ingredientsText),
      })

      if (insertError) {
        throw insertError
      }

      navigate("/")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-1 pb-2">
        <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">Create Recipe</h1>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">Please sign in first to add your own recipes.</p>
          <Link to="/profile" className="mt-3 inline-block text-sm font-semibold text-blue-600">
            Go to Sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-1 pb-2">
      <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">Create Recipe</h1>

      <form onSubmit={submit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder="Recipe title"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Category (e.g. Breakfast)"
          />
          <input
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Cuisine (e.g. American)"
          />
        </div>

        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder="Image URL"
        />

        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="min-h-28 w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder="How to make it"
        />

        <textarea
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
          className="min-h-32 w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder={"Ingredients (one per line)\nEggs - 2\nMilk - 200 ml"}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Recipe"}
        </button>
      </form>
    </div>
  )
}
