import { useEffect, useMemo } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  LinearProgress,
} from "@mui/material";
import { Group as PanelGroup, Panel, Separator as PanelSeparator } from "react-resizable-panels";
import { useAppStore } from "./store/useAppStore";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import EditorArea from "./components/EditorArea";

export default function App() {
  const darkMode = useAppStore((s) => s.darkMode);
  const initialize = useAppStore((s) => s.initialize);
  const loading = useAppStore((s) => s.loading);

  useEffect(() => {
    initialize();
  }, [initialize]);

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
      <Box display="flex" flexDirection="column" height="100vh">
        <TopBar />

        {loading && <LinearProgress sx={{ height: 2 }} />}

        {/* Use display:flex here so PanelGroup stretches via cross-axis, not height:100% */}
        <Box sx={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          <PanelGroup orientation="horizontal" style={{ flex: 1 }}>
            <Panel defaultSize={28} minSize={15} maxSize={65}>
              {/* display:flex + flexDirection:column so Sidebar fills via flex, not height:100% */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  borderRight: 1,
                  borderColor: "divider",
                  overflow: "hidden",
                }}
              >
                <Sidebar />
              </Box>
            </Panel>

            <PanelSeparator>
              <Box
                sx={{
                  width: 4,
                  height: "100%",
                  cursor: "col-resize",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "divider",
                  "&:hover": { bgcolor: "primary.light" },
                  transition: "background-color 0.15s",
                }}
              >
                <Box
                  sx={{
                    width: 2,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: "text.disabled",
                    opacity: 0.5,
                    pointerEvents: "none",
                  }}
                />
              </Box>
            </PanelSeparator>

            <Panel>
              <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <EditorArea />
              </Box>
            </Panel>
          </PanelGroup>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
