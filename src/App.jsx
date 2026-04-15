import { useEffect, useState } from "react"
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home.jsx"
import MealPrep from "./pages/MealPrep.jsx"
import Shopping from "./pages/Shopping.jsx"
import Profile from "./pages/Profile.jsx"
import RecipeDetail from "./pages/RecipeDetail.jsx"
import CreateRecipe from "./pages/CreateRecipe.jsx"

import BottomNav from "./components/BottomNav.jsx"
import { supabase } from "./lib/supabase"
import { readSettings, saveSettings } from "./lib/settings"
import { syncPendingLikes } from "./lib/likes"
import { syncPendingMealPlans } from "./lib/mealPlans"

function App() {
  const [user, setUser] = useState(null)
  const [settings, setSettings] = useState(() => readSettings())

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)
    }

    init()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    saveSettings(settings)

    const root = document.documentElement
    root.setAttribute("data-theme", settings.theme)
    root.setAttribute("lang", settings.language === "da" ? "da" : "en")

    if (settings.textSize === "large") {
      root.classList.add("text-size-large")
    } else {
      root.classList.remove("text-size-large")
    }

    if (settings.motion === "reduced") {
      root.classList.add("reduce-motion")
    } else {
      root.classList.remove("reduce-motion")
    }
  }, [settings])

  useEffect(() => {
    if (!user?.id) {
      return
    }

    void syncPendingLikes(user.id)

    const onOnline = () => {
      void syncPendingLikes(user.id)
    }

    window.addEventListener("online", onOnline)
    return () => {
      window.removeEventListener("online", onOnline)
    }
  }, [user?.id])

  useEffect(() => {
    void syncPendingMealPlans()

    const onOnline = () => {
      void syncPendingMealPlans()
    }

    window.addEventListener("online", onOnline)
    return () => {
      window.removeEventListener("online", onOnline)
    }
  }, [])

  const updateSettings = (next) => {
    setSettings((prev) => ({ ...prev, ...next }))
  }

  const isGitHubPages = window.location.hostname.endsWith("github.io")
  const Router = isGitHubPages ? HashRouter : BrowserRouter

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <main className="mx-auto w-full max-w-5xl px-3 pt-3 pb-28 sm:px-4 sm:pt-4">
          <Routes>
            <Route path="/" element={<Home language={settings.language} user={user} />} />
            <Route path="/meal-prep" element={<MealPrep language={settings.language} />} />
            <Route path="/shopping" element={<Shopping language={settings.language} />} />
            <Route path="/create-recipe" element={<CreateRecipe user={user} language={settings.language} />} />
            <Route
              path="/profile"
              element={<Profile user={user} settings={settings} onUpdateSettings={updateSettings} />}
            />
            <Route path="/recipe/:id" element={<RecipeDetail language={settings.language} user={user} />} />
          </Routes>
        </main>

        <BottomNav language={settings.language} />
      </div>
    </Router>
  )
}

export default App