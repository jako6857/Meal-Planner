import { supabase } from "./supabase"

const TABLE = "recipe_likes"

export const fetchLikedRecipeIds = async (userId) => {
  if (!userId) {
    return new Set()
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select("recipe_id")
    .eq("user_id", userId)

  if (error) {
    throw error
  }

  return new Set((data || []).map((row) => row.recipe_id))
}

export const fetchSavedRecipes = async (userId) => {
  if (!userId) {
    return []
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select("recipe_id, title, image, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

export const saveRecipeLike = async ({ userId, recipeId, title, image }) => {
  const { error } = await supabase
    .from(TABLE)
    .upsert(
      {
        user_id: userId,
        recipe_id: recipeId,
        title,
        image,
      },
      { onConflict: "user_id,recipe_id" }
    )

  if (error) {
    throw error
  }
}

export const removeRecipeLike = async ({ userId, recipeId }) => {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("user_id", userId)
    .eq("recipe_id", recipeId)

  if (error) {
    throw error
  }
}
