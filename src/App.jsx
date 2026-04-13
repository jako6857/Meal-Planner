import { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home.jsx"
import MealPrep from "./pages/MealPrep.jsx"
import Shopping from "./pages/Shopping.jsx"
import Profile from "./pages/Profile.jsx"
import RecipeDetail from "./pages/RecipeDetail.jsx"
import CreateRecipe from "./pages/CreateRecipe.jsx"

import BottomNav from "./components/BottomNav.jsx"
import { supabase } from "./lib/supabase"

function App() {
  const [user, setUser] = useState(null)

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

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <main className="mx-auto w-full max-w-5xl px-3 pt-3 pb-28 sm:px-4 sm:pt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/meal-prep" element={<MealPrep />} />
            <Route path="/shopping" element={<Shopping />} />
            <Route path="/create-recipe" element={<CreateRecipe user={user} />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
          </Routes>
        </main>

        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

export default App