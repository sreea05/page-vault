import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Sun, Moon } from "lucide-react"
import { setTheme } from "../theme"

export function ThemeToggle() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button style={{ background: "none", border: "none", cursor: "pointer" }}>
          <Sun size={18} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          padding: 6,
        }}
      >
        <DropdownMenu.Item onClick={() => setTheme("light")}>
          Light
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
