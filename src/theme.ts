export type Theme = "light" | "dark"

export function setTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme)
  localStorage.setItem("theme", theme)
}

export function initTheme() {
  const saved = localStorage.getItem("theme") as Theme | null
  setTheme(saved ?? "light")
}

export function toggleTheme() {
  const saved = (localStorage.getItem("theme") as Theme | null) ?? (document.documentElement.getAttribute("data-theme") as Theme | null)
  const next: Theme = saved === "dark" ? "light" : "dark"
  setTheme(next)
  return next
}
