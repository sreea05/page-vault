import { useState, useMemo } from "react";
import { Box, Paper, TextField, Typography } from "@mui/material";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useAppStore } from "../store/useAppStore";

type FileTree = { [key: string]: FileTree | null };

export default function Sidebar() {
  const files = useAppStore((s) => s.files);
  const openFile = useAppStore((s) => s.openFile);
  const basePath = useAppStore((s) => s.basePath);

  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      files.filter((f) =>
        f.toLowerCase().includes(search.toLowerCase())
      ),
    [files, search]
  );

  const tree = useMemo(() => {
    const root: FileTree = {};
    filtered.forEach((f) => {
      const parts = f.split(/[/\\]/);
      let current = root;
      parts.forEach((p, i) => {
        if (!current[p]) current[p] = i === parts.length - 1 ? null : {};
        if (current[p]) current = current[p]!;
      });
    });
    return root;
  }, [filtered]);

  if (!basePath) {
    return (
      <Box sx={{ width: 280 }}>
        <Paper sx={{ p: 2 }}>
          <Typography>Select a folder to begin</Typography>
        </Paper>
      </Box>
    );
  }

  const renderTree = (node: FileTree, path = ""): any =>
    Object.entries(node).map(([name, children]) => {
      const full = path ? `${path}/${name}` : name;

      if (!children)
        return (
          <TreeItem
            key={full}
            itemId={full}
            label={name}
            slots={{ icon: InsertDriveFileIcon }}
            onClick={() => openFile(full)}
          />
        );

      return (
        <TreeItem
          key={full}
          itemId={full}
          label={name}
          slots={{ icon: FolderIcon }}
        >
          {renderTree(children, full)}
        </TreeItem>
      );
    });

  return (
    <Box sx={{ width: 280 }}>
      <Paper sx={{ p: 2, height: "100%", overflow: "auto" }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SimpleTreeView>{renderTree(tree)}</SimpleTreeView>
      </Paper>
    </Box>
  );
}
