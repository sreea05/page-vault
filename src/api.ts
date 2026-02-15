import { invoke } from "@tauri-apps/api/core"
import { FileNode } from "./types"

export async function fetchHtmlTree(basePath: string) {
  return await invoke<FileNode[]>("get_html_tree", {
    basePath,
  })
}

export async function fetchHtmlContent(path: string) {
  return await invoke<string>("read_html_file", { path })
}
