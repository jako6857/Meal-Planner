import { useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

const RECIPE_IMAGE_BUCKET = "recipe-images"

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

const copy = {
  en: {
    title: "Create Recipe",
    signInFirst: "Please sign in first to add your own recipes.",
    goSignIn: "Go to Sign in",
    recipeTitle: "Recipe title",
    category: "Category (e.g. Breakfast)",
    cuisine: "Cuisine (e.g. American)",
    recipeImage: "Recipe image",
    chooseGallery: "Choose from gallery",
    takePhoto: "Take photo",
    uploading: "Uploading image...",
    manualImage: "Or paste image URL manually",
    instructions: "How to make it",
    ingredients: "Ingredients (one per line)\nEggs - 2\nMilk - 200 ml",
    saving: "Saving...",
    saveRecipe: "Save Recipe",
    mustSignIn: "You must be signed in to create recipes.",
    invalidImage: "Please choose a valid image file.",
    uploadFailedPrefix: "Image upload failed:",
    uploadFailedSuffix: "Ensure storage bucket 'recipe-images' exists and allows uploads for authenticated users.",
    previewAlt: "Recipe preview",
  },
  da: {
    title: "Opret opskrift",
    signInFirst: "Log ind foerst for at tilfoeje dine egne opskrifter.",
    goSignIn: "Gaa til log ind",
    recipeTitle: "Opskriftstitel",
    category: "Kategori (fx Morgenmad)",
    cuisine: "Koekken (fx Amerikansk)",
    recipeImage: "Opskriftsbillede",
    chooseGallery: "Vaelg fra galleri",
    takePhoto: "Tag billede",
    uploading: "Uploader billede...",
    manualImage: "Eller indsaat billed-URL manuelt",
    instructions: "Saadan laver du den",
    ingredients: "Ingredienser (en per linje)\nAeg - 2\nMaelk - 200 ml",
    saving: "Gemmer...",
    saveRecipe: "Gem opskrift",
    mustSignIn: "Du skal vaere logget ind for at oprette opskrifter.",
    invalidImage: "Vaelg en gyldig billedfil.",
    uploadFailedPrefix: "Upload af billede fejlede:",
    uploadFailedSuffix: "Soerg for at storage-bucket 'recipe-images' findes og tillader upload for loggede brugere.",
    previewAlt: "Forhaandsvisning af opskrift",
  },
}

export default function CreateRecipe({ user, language = "en" }) {
  const navigate = useNavigate()
  const galleryInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [cuisine, setCuisine] = useState("")
  const [image, setImage] = useState("")
  const [instructions, setInstructions] = useState("")
  const [ingredientsText, setIngredientsText] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const t = copy[language] || copy.en

  const uploadImageFile = async (file) => {
    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      setError(t.invalidImage)
      return
    }

    try {
      setUploadingImage(true)
      setError("")

      const extension = file.name.split(".").pop() || "jpg"
      const path = `${user.id}/${crypto.randomUUID()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from(RECIPE_IMAGE_BUCKET)
        .upload(path, file, { upsert: false })

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from(RECIPE_IMAGE_BUCKET)
        .getPublicUrl(path)

      setImage(data.publicUrl)
    } catch (err) {
      setError(
        `${t.uploadFailedPrefix} ${err.message}. ${t.uploadFailedSuffix}`
      )
    } finally {
      setUploadingImage(false)
    }
  }

  const onPickGallery = () => {
    galleryInputRef.current?.click()
  }

  const onPickCamera = () => {
    cameraInputRef.current?.click()
  }

  const onFileChange = async (e) => {
    const file = e.target.files?.[0]
    await uploadImageFile(file)
    e.target.value = ""
  }

  const submit = async (e) => {
    e.preventDefault()

    if (!user) {
      setError(t.mustSignIn)
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
        <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">{t.title}</h1>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">{t.signInFirst}</p>
          <Link to="/profile" className="mt-3 inline-block text-sm font-semibold text-blue-600">
            {t.goSignIn}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-1 pb-2">
      <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">{t.title}</h1>

      <form onSubmit={submit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder={t.recipeTitle}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder={t.category}
          />
          <input
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder={t.cuisine}
          />
        </div>

        <div className="rounded-xl border border-slate-200 p-3">
          <p className="mb-2 text-sm font-semibold text-slate-700">{t.recipeImage}</p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onPickGallery}
              disabled={uploadingImage}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              {t.chooseGallery}
            </button>

            <button
              type="button"
              onClick={onPickCamera}
              disabled={uploadingImage}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              {t.takePhoto}
            </button>
          </div>

          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFileChange}
            className="hidden"
          />

          {uploadingImage && <p className="mt-2 text-sm text-slate-500">{t.uploading}</p>}

          {image && (
            <div className="mt-3">
              <img src={image} alt={t.previewAlt} className="h-40 w-full rounded-lg object-cover" />
            </div>
          )}

          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder={t.manualImage}
          />
        </div>

        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="min-h-28 w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder={t.instructions}
        />

        <textarea
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
          className="min-h-32 w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder={t.ingredients}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? t.saving : t.saveRecipe}
        </button>
      </form>
    </div>
  )
}
