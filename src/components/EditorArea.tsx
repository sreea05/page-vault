import { Box, Tabs, Tab, IconButton, Tooltip, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import { useAppStore } from "../store/useAppStore";

export default function EditorArea() {
  const tabs = useAppStore((s) => s.tabs);
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const closeTab = useAppStore((s) => s.closeTab);
  const openFolder = useAppStore((s) => s.openFolder);
  const basePath = useAppStore((s) => s.basePath);

  const active = tabs.find((t) => t.id === activeTab);

  if (tabs.length === 0) {
    return (
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={2}
        sx={{ color: "text.disabled" }}
      >
        <FolderOpenOutlinedIcon sx={{ fontSize: 72, opacity: 0.25 }} />
        <Typography variant="h6" fontWeight={500} color="text.secondary">
          Page Vault
        </Typography>
        <Typography variant="body2" color="text.disabled" textAlign="center">
          {basePath
            ? "Select a file from the sidebar to preview it here"
            : "Open a folder to get started"}
        </Typography>
        {!basePath && (
          <Tooltip title="Open a folder">
            <IconButton onClick={openFolder} size="large" color="primary">
              <FolderOpenOutlinedIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  }

  return (
    <Box flex={1} display="flex" flexDirection="column" minWidth={0}>
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: "divider", minHeight: 40 }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            sx={{ minHeight: 40, py: 0, px: 1.5, textTransform: "none" }}
            label={
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{ maxWidth: 160 }}
                  title={tab.title}
                >
                  {tab.title}
                </Typography>
                <Tooltip title="Close tab">
                  <IconButton
                    component="span"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    sx={{ p: 0.25 }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          />
        ))}
      </Tabs>

      {active && (
        <iframe
          key={active.id}
          sandbox=""
          src={active.filePath}
          style={{
            width: "100%",
            flex: 1,
            border: "none",
          }}
        />
      )}
    </Box>
  );
}
