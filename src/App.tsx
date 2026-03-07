import { useEffect, useMemo } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  LinearProgress,
} from "@mui/material";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
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

        <Box flex={1} minHeight={0}>
          <PanelGroup orientation="horizontal" style={{ height: "100%" }}>
            <Panel defaultSize={22} minSize={15} maxSize={45}>
              <Box
                sx={{
                  height: "100%",
                  overflowY: "auto",
                  borderRight: 1,
                  borderColor: "divider",
                }}
              >
                <Sidebar />
              </Box>
            </Panel>

            <PanelResizeHandle
              style={{
                width: 5,
                cursor: "col-resize",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />

            <Panel>
              <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <EditorArea />
              </Box>
            </Panel>
          </PanelGroup>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
