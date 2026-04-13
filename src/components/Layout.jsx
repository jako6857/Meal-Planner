import { Link, useLocation } from "react-router-dom"

export default function Layout({ children }) {
  const location = useLocation()

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/meal-prep", label: "Prep" },
    { path: "/shopping", label: "Shop" },
    { path: "/summary", label: "Summary" }
  ]

  return (
    <div className="min-h-screen bg-gray-100 pb-20">

      {/* CONTENT */}
      <div className="p-4">{children}</div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 shadow-lg">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`text-sm ${
              location.pathname === item.path
                ? "text-blue-500 font-bold"
                : "text-gray-500"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

    </div>
  )
}