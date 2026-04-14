import { supabase } from "./supabase"

const TABLE = "recipe_likes"
const CACHE_PREFIX = "recipe-likes-cache:"
const PENDING_PREFIX = "recipe-likes-pending:"

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      return fallback
    }
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage errors to keep app usable.
  }
}

const cacheKey = (userId) => `${CACHE_PREFIX}${userId}`
const pendingKey = (userId) => `${PENDING_PREFIX}${userId}`

const readCache = (userId) => readJson(cacheKey(userId), {})
const writeCache = (userId, map) => writeJson(cacheKey(userId), map)

const readPending = (userId) => readJson(pendingKey(userId), {})
const writePending = (userId, map) => writeJson(pendingKey(userId), map)

const upsertLocalCache = ({ userId, recipeId, title, image }) => {
  const cache = readCache(userId)
  cache[recipeId] = {
    recipe_id: recipeId,
    title: title || "Saved recipe",
    image: image || null,
    created_at: new Date().toISOString(),
  }
  writeCache(userId, cache)
}

const removeLocalCache = ({ userId, recipeId }) => {
  const cache = readCache(userId)
  delete cache[recipeId]
  writeCache(userId, cache)
}

const setPendingState = ({ userId, recipeId, liked, title, image }) => {
  const pending = readPending(userId)
  pending[recipeId] = {
    liked,
    title: title || "Saved recipe",
    image: image || null,
    updated_at: new Date().toISOString(),
  }
  writePending(userId, pending)
}

const applyPendingToIds = (baseSet, pendingMap) => {
  const next = new Set(baseSet)
  Object.entries(pendingMap).forEach(([recipeId, action]) => {
    if (action.liked) {
      next.add(recipeId)
    } else {
      next.delete(recipeId)
    }
  })
  return next
}

const applyPendingToList = (baseList, pendingMap) => {
  const byId = new Map(baseList.map((item) => [item.recipe_id, item]))

  Object.entries(pendingMap).forEach(([recipeId, action]) => {
    if (action.liked) {
      byId.set(recipeId, {
        recipe_id: recipeId,
        title: action.title || byId.get(recipeId)?.title || "Saved recipe",
        image: action.image || byId.get(recipeId)?.image || null,
        created_at: action.updated_at || new Date().toISOString(),
      })
    } else {
      byId.delete(recipeId)
    }
  })

  return Array.from(byId.values()).sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

const queryRemoteLikes = async (userId) => {
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

const updateCacheFromRemote = (userId, rows) => {
  const nextCache = {}
  rows.forEach((row) => {
    nextCache[row.recipe_id] = {
      recipe_id: row.recipe_id,
      title: row.title,
      image: row.image,
      created_at: row.created_at,
    }
  })
  writeCache(userId, nextCache)
}

export const syncPendingLikes = async (userId) => {
  if (!userId) {
    return { synced: 0, failed: 0 }
  }

  const pending = readPending(userId)
  const entries = Object.entries(pending)

  if (!entries.length || !navigator.onLine) {
    return { synced: 0, failed: entries.length }
  }

  const nextPending = { ...pending }
  let synced = 0

  for (const [recipeId, action] of entries) {
    try {
      if (action.liked) {
        const { error } = await supabase
          .from(TABLE)
          .upsert(
            {
              user_id: userId,
              recipe_id: recipeId,
              title: action.title || "Saved recipe",
              image: action.image || null,
            },
            { onConflict: "user_id,recipe_id" }
          )

        if (error) {
          throw error
        }
      } else {
        const { error } = await supabase
          .from(TABLE)
          .delete()
          .eq("user_id", userId)
          .eq("recipe_id", recipeId)

        if (error) {
          throw error
        }
      }

      delete nextPending[recipeId]
      synced += 1
    } catch {
      // Keep failed item in pending queue.
    }
  }

  writePending(userId, nextPending)

  if (!Object.keys(nextPending).length) {
    try {
      const remoteRows = await queryRemoteLikes(userId)
      updateCacheFromRemote(userId, remoteRows)
    } catch {
      // Cache refresh is best effort.
    }
  }

  return { synced, failed: Object.keys(nextPending).length }
}

export const fetchLikedRecipeIds = async (userId) => {
  if (!userId) {
    return new Set()
  }

  const pending = readPending(userId)
  const cachedRows = Object.values(readCache(userId))
  let baseSet = new Set(cachedRows.map((row) => row.recipe_id))

  if (navigator.onLine) {
    try {
      const remoteRows = await queryRemoteLikes(userId)
      updateCacheFromRemote(userId, remoteRows)
      baseSet = new Set(remoteRows.map((row) => row.recipe_id))
    } catch {
      // Fall back to local cache.
    }
  }

  return applyPendingToIds(baseSet, pending)
}

export const fetchSavedRecipes = async (userId) => {
  if (!userId) {
    return []
  }

  const pending = readPending(userId)
  let baseList = Object.values(readCache(userId)).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  if (navigator.onLine) {
    try {
      const remoteRows = await queryRemoteLikes(userId)
      updateCacheFromRemote(userId, remoteRows)
      baseList = remoteRows
    } catch {
      // Fall back to local cache.
    }
  }

  return applyPendingToList(baseList, pending)
}

export const saveRecipeLike = async ({ userId, recipeId, title, image }) => {
  if (!userId) {
    throw new Error("Missing user id")
  }

  upsertLocalCache({ userId, recipeId, title, image })
  setPendingState({ userId, recipeId, liked: true, title, image })
  await syncPendingLikes(userId)
}

export const removeRecipeLike = async ({ userId, recipeId }) => {
  if (!userId) {
    throw new Error("Missing user id")
  }

  removeLocalCache({ userId, recipeId })
  setPendingState({ userId, recipeId, liked: false })
  await syncPendingLikes(userId)
}
