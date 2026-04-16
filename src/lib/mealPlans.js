import { supabase } from "./supabase"

const CACHE_PREFIX = "meal-plans-cache:v2:"
const PENDING_PREFIX = "meal-plans-pending:v2:"

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
    // Ignore localStorage issues.
  }
}

const scopeKey = (userId) => userId || "guest"
const cacheKey = (userId) => `${CACHE_PREFIX}${scopeKey(userId)}`
const pendingKey = (userId) => `${PENDING_PREFIX}${scopeKey(userId)}`

const readCacheMap = (userId) => readJson(cacheKey(userId), {})
const writeCacheMap = (userId, map) => writeJson(cacheKey(userId), map)
const readPendingMap = (userId) => readJson(pendingKey(userId), {})
const writePendingMap = (userId, map) => writeJson(pendingKey(userId), map)

const mapToList = (map) => Object.values(map)

const listToMap = (list) => {
  const map = {}
  ;(list || []).forEach((item) => {
    if (item?.day) {
      map[item.day] = item
    }
  })
  return map
}

const setPending = (userId, day, action) => {
  const pending = readPendingMap(userId)
  pending[day] = {
    ...action,
    updated_at: new Date().toISOString(),
  }
  writePendingMap(userId, pending)
}

const applyPendingToMap = (baseMap, pendingMap) => {
  const next = { ...baseMap }
  Object.entries(pendingMap).forEach(([day, action]) => {
    if (action.type === "delete") {
      delete next[day]
    } else if (action.type === "upsert") {
      next[day] = action.meal
    }
  })
  return next
}

const updateCacheFromRemote = (userId, rows) => {
  writeCacheMap(userId, listToMap(rows || []))
}

export const syncPendingMealPlans = async (userId) => {
  if (!userId) {
    return { synced: 0, failed: 0 }
  }

  const pending = readPendingMap(userId)
  const entries = Object.entries(pending)

  if (!entries.length || !navigator.onLine) {
    return { synced: 0, failed: entries.length }
  }

  const nextPending = { ...pending }
  let synced = 0

  for (const [day, action] of entries) {
    try {
      if (action.type === "delete") {
        const { error } = await supabase
          .from("meal_plans")
          .delete()
          .eq("user_id", userId)
          .eq("day", day)
        if (error) {
          throw error
        }
      }

      if (action.type === "upsert") {
        const { error } = await supabase
          .from("meal_plans")
          .upsert({ ...action.meal, user_id: userId }, { onConflict: "user_id,day" })
        if (error) {
          throw error
        }
      }

      delete nextPending[day]
      synced += 1
    } catch {
      // Keep action in queue for next retry.
    }
  }

  writePendingMap(userId, nextPending)

  if (!Object.keys(nextPending).length) {
    try {
      const { data, error } = await supabase.from("meal_plans").select("*").eq("user_id", userId)
      if (!error) {
        updateCacheFromRemote(userId, data || [])
      }
    } catch {
      // Cache refresh is best effort.
    }
  }

  return { synced, failed: Object.keys(nextPending).length }
}

export const fetchMealPlans = async (userId) => {
  const pending = readPendingMap(userId)
  let baseMap = readCacheMap(userId)

  if (navigator.onLine && userId) {
    try {
      await syncPendingMealPlans(userId)
      const { data, error } = await supabase.from("meal_plans").select("*").eq("user_id", userId)
      if (!error) {
        baseMap = listToMap(data || [])
        writeCacheMap(userId, baseMap)
      }
    } catch {
      // Fallback to local cache.
    }
  }

  return mapToList(applyPendingToMap(baseMap, pending))
}

export const upsertMealPlan = async (meal, userId) => {
  if (!meal?.day) {
    throw new Error("Missing meal plan day")
  }

  const cache = readCacheMap(userId)
  cache[meal.day] = meal
  writeCacheMap(userId, cache)
  setPending(userId, meal.day, { type: "upsert", meal })

  if (navigator.onLine && userId) {
    await syncPendingMealPlans(userId)
  }
}

export const deleteMealPlan = async (day, userId) => {
  if (!day) {
    throw new Error("Missing meal plan day")
  }

  const cache = readCacheMap(userId)
  delete cache[day]
  writeCacheMap(userId, cache)
  setPending(userId, day, { type: "delete" })

  if (navigator.onLine && userId) {
    await syncPendingMealPlans(userId)
  }
}
