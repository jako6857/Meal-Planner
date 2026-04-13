import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home.jsx"
import MealPrep from "./pages/MealPrep.jsx"
import Shopping from "./pages/Shopping.jsx"
import Profile from "./pages/Profile.jsx"
import RecipeDetail from "./pages/RecipeDetail.jsx"

import BottomNav from "./components/BottomNav.jsx"

function App() {
  return (
    <BrowserRouter>
      <div className="pb-20 bg-gray-50 min-h-screen">

        {/* MAIN CONTENT */}
        <div className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/meal-prep" element={<MealPrep />} />
            <Route path="/shopping" element={<Shopping />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
          </Routes>
        </div>

        {/* BOTTOM NAV */}
        <BottomNav />

      </div>
    </BrowserRouter>
  )
}

export default App