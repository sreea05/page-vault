import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  FormControlLabel,
  Typography,
  Divider,
} from "@mui/material";
import { useAppStore } from "../store/useAppStore";

export default function SettingsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const darkMode = useAppStore((s) => s.darkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>Settings</DialogTitle>
      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="overline" color="text.secondary" display="block" gutterBottom>
          Appearance
        </Typography>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
          label="Dark mode"
          labelPlacement="start"
          sx={{ display: "flex", justifyContent: "space-between", ml: 0 }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained" disableElevation>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
