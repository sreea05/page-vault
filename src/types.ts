export type FileNode = {
  id: string
  name: string
  path: string
  children?: FileNode[] | null
}
