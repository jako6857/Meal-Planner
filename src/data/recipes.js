<div className="flex gap-2 mb-6 flex-wrap">
  {["", "italian", "mexican", "american", "asian"].map((c) => (
    <button
      key={c}
      onClick={() => {
        setCuisine(c)
        fetchRecipes(search, category, c)
      }}
      className={`px-3 py-1 rounded ${
        cuisine === c
          ? "bg-blue-500 text-white"
          : "bg-gray-200"
      }`}
    >
      {c || "All cuisines"}
    </button>
  ))}
</div>