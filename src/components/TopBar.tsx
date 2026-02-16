import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SettingsIcon from "@mui/icons-material/Settings";
import { useAppStore } from "../store/useAppStore";
import { useState } from "react";
import SettingsDialog from "./SettingsDialog";

export default function TopBar() {
  const openFolder = useAppStore((s) => s.openFolder);
  const basePath = useAppStore((s) => s.basePath);

  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={openFolder} color="inherit">
              <FolderOpenIcon />
            </IconButton>

            <Typography variant="body2" noWrap>
              {basePath ?? "No folder selected"}
            </Typography>
          </Box>

          <IconButton onClick={() => setSettingsOpen(true)} color="inherit">
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
