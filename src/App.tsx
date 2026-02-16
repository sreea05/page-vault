import { useEffect, useMemo } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  LinearProgress,
  Divider,
} from "@mui/material";
import { useAppStore } from "./store/useAppStore";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import EditorArea from "./components/EditorArea";
import SettingsDialog from "./components/SettingsDialog";

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
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box display="flex" flexDirection="column" height="100vh">
        <TopBar />

        {loading && <LinearProgress />}

        <Box display="flex" flex={1} minHeight={0}>
          <Sidebar />
          <Divider orientation="vertical" flexItem />
          <EditorArea />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
