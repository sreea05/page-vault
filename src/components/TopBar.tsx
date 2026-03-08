import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Chip,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SettingsIcon from "@mui/icons-material/Settings";
import RefreshIcon from "@mui/icons-material/Refresh";
import LockIcon from "@mui/icons-material/Lock";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { useAppStore } from "../store/useAppStore";
import { useState } from "react";
import SettingsDialog from "./SettingsDialog";

interface TopBarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function TopBar({ sidebarOpen, onToggleSidebar }: TopBarProps) {
  const openFolder = useAppStore((s) => s.openFolder);
  const loadFiles = useAppStore((s) => s.loadFiles);
  const basePath = useAppStore((s) => s.basePath);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const folderName = basePath
    ? basePath.replace(/\\/g, "/").split("/").filter(Boolean).pop() ?? basePath
    : null;

  return (
    <>
      <AppBar position="static" elevation={1}>
        <Toolbar sx={{ justifyContent: "space-between", minHeight: 52 }}>
          {/* Left: sidebar toggle + branding + folder controls */}
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}>
              <IconButton onClick={onToggleSidebar} color="inherit" size="small">
                {sidebarOpen ? (
                  <MenuOpenIcon fontSize="small" />
                ) : (
                  <MenuIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            <LockIcon sx={{ fontSize: 20, opacity: 0.9 }} />
            <Typography
              variant="subtitle1"
              fontWeight={700}
              letterSpacing={0.5}
              sx={{ mr: 1 }}
            >
              Page Vault
            </Typography>

            <Tooltip title="Open folder">
              <IconButton onClick={openFolder} color="inherit" size="small">
                <FolderOpenIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {basePath && (
              <>
                <Tooltip title={basePath}>
                  <Chip
                    label={folderName}
                    size="small"
                    variant="outlined"
                    sx={{
                      color: "inherit",
                      borderColor: "rgba(255,255,255,0.4)",
                      maxWidth: 300,
                      ".MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
                    }}
                  />
                </Tooltip>

                <Tooltip title="Reload files">
                  <IconButton onClick={loadFiles} color="inherit" size="small">
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>

          {/* Right: settings */}
          <Tooltip title="Settings">
            <IconButton onClick={() => setSettingsOpen(true)} color="inherit" size="small">
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
