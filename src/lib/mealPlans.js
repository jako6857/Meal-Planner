import { supabase } from "./supabase"

const CACHE_KEY = "meal-plans-cache:v1"
const PENDING_KEY = "meal-plans-pending:v1"

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

const readCacheMap = () => readJson(CACHE_KEY, {})
const writeCacheMap = (map) => writeJson(CACHE_KEY, map)
const readPendingMap = () => readJson(PENDING_KEY, {})
const writePendingMap = (map) => writeJson(PENDING_KEY, map)

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

const setPending = (day, action) => {
  const pending = readPendingMap()
  pending[day] = {
    ...action,
    updated_at: new Date().toISOString(),
  }
  writePendingMap(pending)
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

const updateCacheFromRemote = (rows) => {
  writeCacheMap(listToMap(rows || []))
}

export const syncPendingMealPlans = async () => {
  const pending = readPendingMap()
  const entries = Object.entries(pending)

  if (!entries.length || !navigator.onLine) {
    return { synced: 0, failed: entries.length }
  }

  const nextPending = { ...pending }
  let synced = 0

  for (const [day, action] of entries) {
    try {
      if (action.type === "delete") {
        const { error } = await supabase.from("meal_plans").delete().eq("day", day)
        if (error) {
          throw error
        }
      }

      if (action.type === "upsert") {
        const { error } = await supabase.from("meal_plans").upsert(action.meal, { onConflict: "day" })
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

  writePendingMap(nextPending)

  if (!Object.keys(nextPending).length) {
    try {
      const { data, error } = await supabase.from("meal_plans").select("*")
      if (!error) {
        updateCacheFromRemote(data || [])
      }
    } catch {
      // Cache refresh is best effort.
    }
  }

  return { synced, failed: Object.keys(nextPending).length }
}

export const fetchMealPlans = async () => {
  const pending = readPendingMap()
  let baseMap = readCacheMap()

  if (navigator.onLine) {
    try {
      await syncPendingMealPlans()
      const { data, error } = await supabase.from("meal_plans").select("*")
      if (!error) {
        baseMap = listToMap(data || [])
        writeCacheMap(baseMap)
      }
    } catch {
      // Fallback to local cache.
    }
  }

  return mapToList(applyPendingToMap(baseMap, pending))
}

export const upsertMealPlan = async (meal) => {
  if (!meal?.day) {
    throw new Error("Missing meal plan day")
  }

  const cache = readCacheMap()
  cache[meal.day] = meal
  writeCacheMap(cache)
  setPending(meal.day, { type: "upsert", meal })

  if (navigator.onLine) {
    await syncPendingMealPlans()
  }
}

export const deleteMealPlan = async (day) => {
  if (!day) {
    throw new Error("Missing meal plan day")
  }

  const cache = readCacheMap()
  delete cache[day]
  writeCacheMap(cache)
  setPending(day, { type: "delete" })

  if (navigator.onLine) {
    await syncPendingMealPlans()
  }
}
