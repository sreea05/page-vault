import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { toggleTheme } from "../theme"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const t = (document.documentElement.getAttribute("data-theme") as "light" | "dark") ?? "light"
    setTheme(t)
    const obs = () => setTheme((document.documentElement.getAttribute("data-theme") as "light" | "dark") ?? "light")
    const mo = new MutationObserver(obs)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
    return () => mo.disconnect()
  }, [])

  return (
    <button
      onClick={() => toggleTheme()}
      aria-label="Toggle theme"
      style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}
    >
      {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
