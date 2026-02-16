import {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
  useDeferredValue,
  memo,
} from "react";
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
  const deferredSearch = useDeferredValue(search);
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const fileCache = useRef(new Map<string, string>());

  /* ---------------------- THEME ---------------------- */

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode: darkMode ? "dark" : "light" },
      }),
    [darkMode]
  );

  /* ---------------------- LOAD FILES ---------------------- */

  useEffect(() => {
    invoke<string[]>("get_html_files", {
      basePath: BASE_PATH,
    }).then(setFiles);
  }, []);

  /* ---------------------- OPEN FILE (CACHED) ---------------------- */

  const openFile = useCallback(
    async (file: string) => {
      const existing = tabs.find((t) => t.id === file);
      if (existing) {
        setActiveTab(file);
        return;
      }

      if (fileCache.current.has(file)) {
        const content = fileCache.current.get(file)!;
        setTabs((prev) => [
          ...prev,
          { id: file, title: file.split(/[/\\]/).pop()!, content },
        ]);
        setActiveTab(file);
        return;
      }

      const content = await invoke<string>("read_html_file", {
        basePath: BASE_PATH,
        relativePath: file,
      });

      fileCache.current.set(file, content);

      setTabs((prev) => [
        ...prev,
        { id: file, title: file.split(/[/\\]/).pop()!, content },
      ]);
      setActiveTab(file);
    },
    [tabs]
  );

  /* ---------------------- CLOSE TAB ---------------------- */

  const closeTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => {
        const updated = prev.filter((t) => t.id !== tabId);
        if (updated.length === 0) {
          setActiveTab(null);
        } else if (tabId === activeTab) {
          setActiveTab(updated[0].id);
        }
        return updated;
      });
    },
    [activeTab]
  );

  /* ---------------------- TAB MAP ---------------------- */

  const tabsMap = useMemo(() => {
    const map = new Map<string, TabData>();
    tabs.forEach((t) => map.set(t.id, t));
    return map;
  }, [tabs]);

  /* ---------------------- FILTER FILES ---------------------- */

  const filteredFiles = useMemo(() => {
    return files.filter((f) =>
      f.toLowerCase().includes(deferredSearch.toLowerCase())
    );
  }, [files, deferredSearch]);

  /* ---------------------- BUILD TREE ---------------------- */

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

  /* ---------------------- KEYBOARD ---------------------- */

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!event.ctrlKey) return;

      if (event.key === "Tab") {
        setTabs((prev) => {
          if (!prev.length) return prev;
          const index = prev.findIndex((t) => t.id === activeTab);
          const next = index === prev.length - 1 ? 0 : index + 1;
          setActiveTab(prev[next].id);
          return prev;
        });
      }

      if (event.key === "w" && activeTab) {
        closeTab(activeTab);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeTab, closeTab]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box display="flex" flexDirection="column" height="100vh">
        <TopBar onSettings={() => setSettingsOpen(true)} />

        <Box display="flex" flex={1} minHeight={0}>
          <Sidebar
            tree={tree}
            search={search}
            setSearch={setSearch}
            openFile={openFile}
          />

          <EditorArea
            tabs={tabs}
            tabsMap={tabsMap}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            closeTab={closeTab}
          />
        </Box>
      </Box>

      <SettingsDialog
        open={settingsOpen}
        currentDarkMode={darkMode}
        onSave={(settings) => {
          setDarkMode(settings.darkMode);
          setSettingsOpen(false);
        }}
        onDiscard={() => {
          setSettingsOpen(false);
        }}
      />
    </ThemeProvider>
  );
}

/* ================= COMPONENTS ================= */

const TopBar = memo(({ onSettings }: { onSettings: () => void }) => (
  <AppBar position="static">
    <Toolbar sx={{ justifyContent: "flex-end" }}>
      <IconButton onClick={onSettings} color="inherit">
        <SettingsIcon />
      </IconButton>
    </Toolbar>
  </AppBar>
));

const Sidebar = memo(
  ({
    tree,
    search,
    setSearch,
    openFile,
  }: {
    tree: FileTree;
    search: string;
    setSearch: React.Dispatch<React.SetStateAction<string>>;
    openFile: (file: string) => void;
  }) => {
    const renderTree = (node: FileTree, path = ""): React.ReactNode =>
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
      <Box sx={{ width: 280, flexShrink: 0 }}>
        <Paper sx={{ p: 2, overflow: "auto", height: "100%" }}>
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
);

const EditorArea = memo(
  ({
    tabs,
    tabsMap,
    activeTab,
    setActiveTab,
    closeTab,
  }: {
    tabs: TabData[];
    tabsMap: Map<string, TabData>;
    activeTab: string | null;
    setActiveTab: (id: string) => void;
    closeTab: (id: string) => void;
  }) => (
    <Box flex={1} borderLeft="1px solid #444" display="flex" flexDirection="column">
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
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
            {activeTab.split(/[/\\]/).map((p, i) => (
              <span key={i}>{p}</span>
            ))}
          </Breadcrumbs>

          <iframe
            srcDoc={tabsMap.get(activeTab)?.content}
            style={{ width: "100%", height: "100%", border: "none", flex: 1 }}
          />
        </>
      )}
    </Box>
  )
);

/* ================= SETTINGS DIALOG ================= */

type SettingsDialogProps = {
  open: boolean;
  currentDarkMode: boolean;
  onSave: (settings: { darkMode: boolean }) => void;
  onDiscard: () => void;
};

const SettingsDialog = memo(function SettingsDialog({
  open,
  currentDarkMode,
  onSave,
  onDiscard,
}: SettingsDialogProps) {
  const [localDarkMode, setLocalDarkMode] = useState(currentDarkMode);

  // Sync when opened
  useEffect(() => {
    if (open) {
      setLocalDarkMode(currentDarkMode);
    }
  }, [open, currentDarkMode]);

  const handleClose = (
    _event: object,
    reason: "backdropClick" | "escapeKeyDown"
  ) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      return;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Settings</DialogTitle>

      <DialogContent>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Dark Mode</TableCell>
                <TableCell align="right">
                  <Switch
                    checked={localDarkMode}
                    onChange={() => setLocalDarkMode((p) => !p)}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() => onSave({ darkMode: localDarkMode })}
          color="primary"
        >
          Save
        </Button>

        <Button onClick={onDiscard} color="secondary">
          Discard
        </Button>
      </DialogActions>
    </Dialog>
  );
});
