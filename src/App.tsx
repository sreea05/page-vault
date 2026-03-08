import { useEffect, useMemo, useState } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  LinearProgress,
} from "@mui/material";
import { useAppStore } from "./store/useAppStore";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import EditorArea from "./components/EditorArea";

const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 560;
const SIDEBAR_DEFAULT = 260;

export default function App() {
  const darkMode = useAppStore((s) => s.darkMode);
  const initialize = useAppStore((s) => s.initialize);
  const loading = useAppStore((s) => s.loading);

  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev: MouseEvent) => {
      const next = Math.min(
        SIDEBAR_MAX,
        Math.max(SIDEBAR_MIN, startWidth + ev.clientX - startX)
      );
      setSidebarWidth(next);
    };

    const onUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode: darkMode ? "dark" : "light" },
        shape: { borderRadius: 8 },
        components: {
          MuiTab: {
            styleOverrides: {
              root: { minHeight: 40 },
            },
          },
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/*
        Root column: explicit height:100vh gives the only percentage-height anchor
        needed in the entire tree. Everything below uses flex/grid stretch so no
        child ever needs height:"100%" against an implicit parent.
      */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <TopBar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
        />

        {loading && <LinearProgress sx={{ height: 2 }} />}

        {/*
          CSS Grid: grid cells stretch to fill the container height automatically
          (align-items defaults to "stretch") — no height:"100%" needed anywhere.
        */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: sidebarOpen
              ? `${sidebarWidth}px 4px 1fr`
              : "1fr",
            overflow: "hidden",
          }}
        >
          {/* Sidebar column */}
          {sidebarOpen && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                borderRight: 1,
                borderColor: "divider",
              }}
            >
              <Sidebar />
            </Box>
          )}

          {/* Drag handle column */}
          {sidebarOpen && (
            <Box
              onMouseDown={handleDividerMouseDown}
              sx={{
                cursor: "col-resize",
                bgcolor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": { bgcolor: "primary.light" },
                transition: "background-color 0.15s",
                zIndex: 1,
              }}
            >
              <Box
                sx={{
                  width: 2,
                  height: 32,
                  borderRadius: 1,
                  bgcolor: "text.disabled",
                  pointerEvents: "none",
                }}
              />
            </Box>
          )}

          {/* Editor column */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            <EditorArea />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
