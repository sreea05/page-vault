import { useEffect, useState, useMemo, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  IconButton,
  AppBar,
  Toolbar,
  TextField,
  Breadcrumbs,
} from "@mui/material";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

const BASE_PATH = "/home/tmp";

type FileTree = { [key: string]: FileTree | null };
type TabData = { id: string; title: string; content: string };
type TabGroup = { id: string; tabs: TabData[]; activeTab: string | null };

export default function App() {
  const [files, setFiles] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<TabGroup[]>([
    { id: "g1", tabs: [], activeTab: null },
  ]);
  const [darkMode, setDarkMode] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  // Load the list of files
  async function loadFiles() {
    const result = await invoke<string[]>("get_html_files", {
      basePath: BASE_PATH,
    });
    setFiles(result);
  }

  // Open a file when clicked from the file tree
  async function openFile(file: string, groupId: string) {
    const group = groups.find((g) => g.id === groupId);
    const existingTab = group?.tabs.find((tab) => tab.id === file);

    if (existingTab) {
      setGroups((prev) => {
        const updated = prev.map((g) => {
          if (g.id === groupId) {
            return { ...g, activeTab: file }; // Activate the existing tab
          }
          return g;
        });
        return updated;
      });
      return;
    }

    const content = await invoke<string>("read_html_file", {
      basePath: BASE_PATH,
      relativePath: file,
    });

    setGroups((prev) => {
      const updated = prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            tabs: [
              ...g.tabs,
              {
                id: file,
                title: file.split(/[/\\]/).pop() || file,
                content,
              },
            ],
            activeTab: file, // Set the newly opened tab as active
          };
        }
        return g;
      });
      return updated;
    });
  }

  // Close a tab
  function closeTab(groupId: string, tabId: string) {
    setGroups((prev) => {
      const updated = prev.map((g) => {
        if (g.id === groupId) {
          const tabs = g.tabs.filter((t) => t.id !== tabId);
          const activeTab = tabs.length > 0 ? tabs[0].id : null;
          return {
            ...g,
            tabs,
            activeTab,
          };
        }
        return g;
      });

      return updated;
    });
  }

  const filteredFiles = useMemo(() => {
    return files.filter((f) =>
      f.toLowerCase().includes(search.toLowerCase())
    );
  }, [files, search]);

  const tree: FileTree = useMemo(() => {
    const root: FileTree = {};
    filteredFiles.forEach((f) => {
      const parts = f.split(/[/\\]/);
      let current = root;
      parts.forEach((p, i) => {
        if (!current[p]) current[p] = i === parts.length - 1 ? null : {};
        if (current[p]) current = current[p]!;
      });
    });
    return root;
  }, [filteredFiles]);

  function renderTree(node: FileTree, path = ""): React.ReactNode {
    return Object.entries(node).map(([name, children]) => {
      const full = path ? `${path}/${name}` : name;

      if (!children)
        return (
          <TreeItem
            key={full}
            itemId={full}
            label={name}
            slots={{ icon: InsertDriveFileIcon }}
            onClick={() => openFile(full, "g1")}
          />
        );

      return (
        <TreeItem key={full} itemId={full} label={name} slots={{ icon: FolderIcon }}>
          {renderTree(children, full)}
        </TreeItem>
      );
    });
  }

  const theme = createTheme({
    palette: { mode: darkMode ? "dark" : "light" },
  });

useEffect(() => {
  // Add keyboard event listener to cycle through tabs using Ctrl+Tab
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey) {
      // Handle Ctrl+Tab to switch between tabs
      if (event.key === "Tab") {
        setGroups((prev) => {
          return prev.map((group) => {
            if (group.tabs.length > 0) {
              const currentIndex = group.tabs.findIndex(
                (tab) => tab.id === group.activeTab
              );
              const newIndex =
                currentIndex === group.tabs.length - 1
                  ? 0
                  : currentIndex + 1;

              return {
                ...group,
                activeTab: group.tabs[newIndex].id,
              };
            }
            return group;
          });
        });
      }

      // Handle Ctrl+w to close the active tab
      if (event.key === "w") {
        const activeGroup = groups.find(
          (group) => group.activeTab !== null
        );
        if (activeGroup && activeGroup.activeTab) {
          closeTab(activeGroup.id, activeGroup.activeTab);
        }
      }
    }
  };

  // Attach the event listener to both the window and iframe document
  window.addEventListener("keydown", handleKeyDown);

  // If iframe is available, add event listener to it too
  const iframeDoc = iframeRef.current?.contentWindow?.document;
  iframeDoc?.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    iframeDoc?.removeEventListener("keydown", handleKeyDown);
  };
}, [groups]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box display="flex" flexDirection="column" height="100vh">
        <AppBar position="static">
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography>HTML Viewer</Typography>
            <IconButton onClick={() => setDarkMode((d) => !d)} color="inherit">
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box display="flex" flex={1} minHeight={0}>
          {/* Fixed Sidebar */}
          <Box
            sx={{
              width: 280, // Fixed sidebar width
              display: "flex",
              flexDirection: "row",
              flexShrink: 0,
            }}
          >
            <Paper sx={{ flex: 1, p: 2, overflow: "auto" }}>
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

          {/* Tab Groups */}
          <Box display="flex" flex={1} minWidth={0}>
            {groups.map((group) => {
              const activeTab = group.tabs.find((t) => t.id === group.activeTab);

              return (
                <Box
                  key={group.id}
                  flex={1}
                  borderLeft="1px solid #444"
                  display="flex"
                  flexDirection="column"
                  minWidth={0}
                >
                  <Tabs
                    value={group.activeTab}
                    onChange={(_, v) =>
                      setGroups((prev) =>
                        prev.map((g) =>
                          g.id === group.id ? { ...g, activeTab: v } : g
                        )
                      )
                    }
                    variant="scrollable"
                  >
                    {group.tabs.map((tab) => (
                      <Tab
                        key={tab.id}
                        value={tab.id}
                        label={
                          <Box display="flex" alignItems="center">
                            {tab.title}
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                closeTab(group.id, tab.id);
                              }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        }
                      />
                    ))}
                  </Tabs>

                  {activeTab && (
                    <>
                      <Breadcrumbs sx={{ px: 2, py: 1 }}>
                        {activeTab.id
                          .split(/[/\\]/)
                          .map((part, i) => (
                            <span key={i}>{part}</span>
                          ))}
                      </Breadcrumbs>
                      <iframe
                        ref={iframeRef}
                        srcDoc={activeTab.content}
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "none",
                          flex: 1,
                        }}
                      />
                    </>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
