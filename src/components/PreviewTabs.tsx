import * as Tabs from "@radix-ui/react-tabs"
import { X } from "lucide-react"
import { fetchHtmlContent } from "../api"
import { FileNode } from "../types"
import { useState, useEffect } from "react"

export function PreviewTabs({
  tabs,
  activeTab,
  setActiveTab,
  closeTab,
}: {
  tabs: FileNode[]
  activeTab: string | null
  setActiveTab: (id: string) => void
  closeTab: (id: string) => void
}) {
  const [htmlCache, setHtmlCache] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!activeTab) return

    const tab = tabs.find((t) => t.id === activeTab)
    if (!tab || htmlCache[tab.id]) return

    fetchHtmlContent(tab.path).then((content) => {
      setHtmlCache((prev) => ({ ...prev, [tab.id]: content }))
    })
  }, [activeTab, tabs])

  return (
    <Tabs.Root
      value={activeTab ?? undefined}
      onValueChange={setActiveTab}
      className="preview"
    >
      <Tabs.List className="tabs-list">
        {tabs.map((tab) => (
          <Tabs.Trigger key={tab.id} value={tab.id} className="tab-trigger">
            {tab.name}
            <span
              onClick={(e) => {
                e.stopPropagation()
                closeTab(tab.id)
              }}
            >
              <X size={14} />
            </span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {tabs.map((tab) => (
        <Tabs.Content key={tab.id} value={tab.id} className="tab-content">
          <iframe
            srcDoc={htmlCache[tab.id] ?? "<p>Loading...</p>"}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}
