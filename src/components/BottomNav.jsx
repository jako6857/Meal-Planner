import { Link, useLocation } from "react-router-dom"
import { Home, Calendar, ShoppingCart, User, SquarePen } from "lucide-react"

export default function BottomNav() {
  const location = useLocation()

  const tab = (path) => {
    const isActive = location.pathname === path
    return isActive
      ? "text-blue-600 bg-blue-50"
      : "text-slate-500"
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
      <nav className="mx-auto flex w-full max-w-md items-center justify-around rounded-2xl border border-slate-200 bg-white/95 px-2 py-2 shadow-[0_-6px_22px_rgba(15,23,42,0.12)] backdrop-blur">
        <Link to="/" className={`flex min-w-[64px] flex-col items-center rounded-xl px-2 py-1 ${tab("/")}`}>
          <Home size={20} />
          <span className="text-[11px]">Home</span>
        </Link>

        <Link to="/meal-prep" className={`flex min-w-[64px] flex-col items-center rounded-xl px-2 py-1 ${tab("/meal-prep")}`}>
          <Calendar size={20} />
          <span className="text-[11px]">Meals</span>
        </Link>

        <Link to="/shopping" className={`flex min-w-[64px] flex-col items-center rounded-xl px-2 py-1 ${tab("/shopping")}`}>
          <ShoppingCart size={20} />
          <span className="text-[11px]">Shop</span>
        </Link>

        <Link to="/create-recipe" className={`flex min-w-[64px] flex-col items-center rounded-xl px-2 py-1 ${tab("/create-recipe")}`}>
          <SquarePen size={20} />
          <span className="text-[11px]">Create</span>
        </Link>

        <Link to="/profile" className={`flex min-w-[64px] flex-col items-center rounded-xl px-2 py-1 ${tab("/profile")}`}>
          <User size={20} />
          <span className="text-[11px]">Profile</span>
        </Link>
      </nav>
    </div>
  )
}