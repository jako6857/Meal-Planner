import { Link, useLocation } from "react-router-dom"
import { Home, Calendar, ShoppingCart, User } from "lucide-react"

export default function BottomNav() {
  const location = useLocation()

  const tab = (path) =>
    location.pathname === path
      ? "text-blue-600"
      : "text-gray-400"

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3">
      <Link to="/" className={`flex flex-col items-center ${tab("/")}`}>
        <Home size={22} />
        <span className="text-xs">Home</span>
      </Link>

      <Link to="/meal-prep" className={`flex flex-col items-center ${tab("/meal-prep")}`}>
        <Calendar size={22} />
        <span className="text-xs">Meals</span>
      </Link>

      <Link to="/shopping" className={`flex flex-col items-center ${tab("/shopping")}`}>
        <ShoppingCart size={22} />
        <span className="text-xs">Shop</span>
      </Link>

      <Link to="/profile" className={`flex flex-col items-center ${tab("/profile")}`}>
        <User size={22} />
        <span className="text-xs">Profile</span>
      </Link>
    </div>
  )
}