import { Box, Tabs, Tab, IconButton, Breadcrumbs } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAppStore } from "../store/useAppStore";

export default function EditorArea() {
  const tabs = useAppStore((s) => s.tabs);
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const closeTab = useAppStore((s) => s.closeTab);

  const active = tabs.find((t) => t.id === activeTab);

  return (
    <Box flex={1} display="flex" flexDirection="column">
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
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

      {active && (
        <>
          <Breadcrumbs sx={{ px: 2, py: 1 }}>
            {active.id.split(/[/\\]/).map((p, i) => (
              <span key={i}>{p}</span>
            ))}
          </Breadcrumbs>

          <iframe
            key={active.id}
            sandbox=""
            src={active.filePath}
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
}
