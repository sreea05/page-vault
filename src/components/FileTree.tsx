import { FileNode } from "../types"
import { Folder, File } from "lucide-react"
import { useState } from "react"

export function FileTree({
  nodes,
  onFileClick,
}: {
  nodes: FileNode[]
  onFileClick: (file: FileNode) => void
}) {
  return (
    <div>
      {nodes.map((node) => (
        <TreeNode key={node.id} node={node} onFileClick={onFileClick} />
      ))}
    </div>
  )
}

function TreeNode({
  node,
  onFileClick,
}: {
  node: FileNode
  onFileClick: (file: FileNode) => void
}) {
  const [open, setOpen] = useState(false)
  const isDir = !!node.children

  return (
    <div style={{ marginLeft: 12 }}>
      {isDir ? (
        <>
          <div
            className="tree-item"
            onClick={() => setOpen(!open)}
          >
            <Folder size={16} />
            {node.name}
          </div>

          {open &&
            node.children?.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                onFileClick={onFileClick}
              />
            ))}
        </>
      ) : (
        <div
          className="tree-item"
          onClick={() => onFileClick(node)}
        >
          <File size={16} />
          {node.name}
        </div>
      )}
    </div>
  )
}
