export function normalizeIngredientName(name) {
  if (!name) return ""

  let n = name.toLowerCase().trim()

  // remove plurals
  if (n.endsWith("s")) n = n.slice(0, -1)

  // normalize common variations
  const map = {
    "red onion": "onion",
    "white onion": "onion",
    "yellow onion": "onion",
    "garlic cloves": "garlic",
    "chicken breast": "chicken",
    "chicken breasts": "chicken"
  }

  return map[n] || n
}