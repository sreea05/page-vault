import { useState, useMemo } from "react";
import {
  Box,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Tooltip,
  Divider,
  Button,
} from "@mui/material";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { useAppStore } from "../store/useAppStore";

type FileTree = { [key: string]: FileTree | null };

export default function Sidebar() {
  const files = useAppStore((s) => s.files);
  const openFile = useAppStore((s) => s.openFile);
  const basePath = useAppStore((s) => s.basePath);
  const openFolder = useAppStore((s) => s.openFolder);

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
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          p: 3,
          color: "text.secondary",
        }}
      >
        <FolderOpenOutlinedIcon sx={{ fontSize: 56, opacity: 0.35 }} />
        <Typography variant="body2" textAlign="center">
          Open a folder to browse your HTML files
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<FolderOpenOutlinedIcon />}
          onClick={openFolder}
        >
          Open Folder
        </Button>
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
            slots={{ icon: InsertDriveFileOutlinedIcon }}
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
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Search bar */}
      <Box sx={{ px: 1.5, pt: 1.5, pb: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search files…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <Tooltip title="Clear search">
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={() => setSearch("")}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ) : null,
            },
          }}
        />
      </Box>

      {/* File count */}
      <Box sx={{ px: 2, pb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {filtered.length === files.length
            ? `${files.length} file${files.length !== 1 ? "s" : ""}`
            : `${filtered.length} of ${files.length} files`}
        </Typography>
      </Box>

      <Divider />

      {/* Tree or no-results message */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 0.5, py: 0.5 }}>
        {filtered.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 1,
              color: "text.disabled",
              p: 2,
            }}
          >
            <SearchIcon sx={{ fontSize: 36, opacity: 0.35 }} />
            <Typography variant="body2" textAlign="center">
              No files match "{search}"
            </Typography>
          </Box>
        ) : (
          <SimpleTreeView>{renderTree(tree)}</SimpleTreeView>
        )}
      </Box>
    </Box>
  );
}
