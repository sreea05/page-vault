import { Group, Panel, Separator } from "react-resizable-panels";
import { useEffect, useState } from "react"
import { fetchHtmlTree } from "./api"
import { FileTree } from "./components/FileTree"
import { PreviewTabs } from "./components/PreviewTabs"
import { ThemeToggle } from "./components/ThemeToggle"
import { FileNode } from "./types"
import { initTheme } from "./theme"
import "./styles.css"

export default function App() {
  const [tree, setTree] = useState<FileNode[]>([])
  const [tabs, setTabs] = useState<FileNode[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)

  useEffect(() => {
    initTheme()
    fetchHtmlTree("/home/tmp").then(setTree)
  }, [])

  function openFile(file: FileNode) {
    setTabs((prev) => {
      if (prev.find((t) => t.id === file.id)) return prev
      return [...prev, file]
    })
    setActiveTab(file.id)
  }

  function closeTab(id: string) {
    const remaining = tabs.filter((t) => t.id !== id)
    setTabs(remaining)
    if (activeTab === id) {
      setActiveTab(remaining[0]?.id ?? null)
    }
  }

  return (
    <div className="app">
      <div className="header">
        <div>HTML Explorer</div>
        <ThemeToggle />
      </div>

      <Group orientation="horizontal">
        <Panel defaultSize={25} minSize={15}>
          <div className="sidebar">
            <FileTree nodes={tree} onFileClick={openFile} />
          </div>
        </Panel>

        <Separator className="resize-handle" />

        <Panel defaultSize={75} minSize={30}>
          {tabs.length > 0 ? (
            <PreviewTabs
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              closeTab={closeTab}
            />
          ) : (
            <div className="empty-state">
              Select an HTML file to preview
            </div>
          )}
        </Panel>
      </Group>
    </div>
  )
}
