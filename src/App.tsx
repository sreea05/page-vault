import { useEffect, useState, useMemo, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Paper,
  Tabs,
  Tab,
  IconButton,
  AppBar,
  Toolbar,
  TextField,
  Breadcrumbs,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";

const BASE_PATH = "/home/tmp";

type FileTree = { [key: string]: FileTree | null };
type TabData = { id: string; title: string; content: string };

export default function App() {
  const [files, setFiles] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
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
  async function openFile(file: string) {
    const existingTab = tabs.find((tab) => tab.id === file);

    if (existingTab) {
      setActiveTab(file); // Activate the existing tab
      return;
    }

    const content = await invoke<string>("read_html_file", {
      basePath: BASE_PATH,
      relativePath: file,
    });

    setTabs((prevTabs) => [
      ...prevTabs,
      { id: file, title: file.split(/[/\\]/).pop() || file, content },
    ]);
    setActiveTab(file); // Set the newly opened tab as active
  }

  // Close a tab
  function closeTab(tabId: string) {
    setTabs((prevTabs) => {
      const updatedTabs = prevTabs.filter((tab) => tab.id !== tabId);
      const newActiveTab = updatedTabs.length > 0 ? updatedTabs[0].id : null;
      setActiveTab(newActiveTab);
      return updatedTabs;
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
            onClick={() => openFile(full)} // Removed groupId
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
          setTabs((prevTabs) => {
            if (prevTabs.length > 0) {
              const currentIndex = prevTabs.findIndex((tab) => tab.id === activeTab);
              const newIndex = currentIndex === prevTabs.length - 1 ? 0 : currentIndex + 1;
              setActiveTab(prevTabs[newIndex].id);
            }
            return prevTabs;
          });
        }

        // Handle Ctrl+w to close the active tab
        if (event.key === "w" && activeTab) {
          closeTab(activeTab);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // If iframe is available, add event listener to it too
    const iframeDoc = iframeRef.current?.contentWindow?.document;
    iframeDoc?.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      iframeDoc?.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeTab]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box display="flex" flexDirection="column" height="100vh">
        <AppBar position="static">
          <Toolbar sx={{ justifyContent: "flex-end" }}>
            <IconButton onClick={() => setSettingsOpen(true)} color="inherit">
              <SettingsIcon /> {/* Settings icon on the right */}
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

          {/* Tabs */}
          <Box display="flex" flex={1} minWidth={0}>
            <Box flex={1} borderLeft="1px solid #444" display="flex" flexDirection="column" minWidth={0}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant="scrollable"
              >
                {tabs.map((tab) => (
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
                            closeTab(tab.id);
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
                    {activeTab.split(/[/\\]/).map((part, i) => (
                      <span key={i}>{part}</span>
                    ))}
                  </Breadcrumbs>
                  <iframe
                    ref={iframeRef}
                    srcDoc={tabs.find((tab) => tab.id === activeTab)?.content}
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
          </Box>
        </Box>
      </Box>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Dark Mode</TableCell>
                  <TableCell align="right">
                    <Switch checked={darkMode} onChange={() => setDarkMode((prev) => !prev)} />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
