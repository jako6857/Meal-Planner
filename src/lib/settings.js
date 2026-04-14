const SETTINGS_STORAGE_KEY = "meal-planner-settings"

export const DEFAULT_SETTINGS = {
  theme: "light",
  language: "en",
  textSize: "normal",
  motion: "full",
}

const isObject = (value) => value && typeof value === "object" && !Array.isArray(value)

export const readSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) {
      return DEFAULT_SETTINGS
    }

    const parsed = JSON.parse(raw)
    if (!isObject(parsed)) {
      return DEFAULT_SETTINGS
    }

    return {
      theme: parsed.theme === "dark" ? "dark" : "light",
      language: parsed.language === "da" ? "da" : "en",
      textSize: parsed.textSize === "large" ? "large" : "normal",
      motion: parsed.motion === "reduced" ? "reduced" : "full",
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Ignore localStorage failures to avoid crashing the app.
  }
}
