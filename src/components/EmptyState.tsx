import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title?: string;
  description: string;
  action?: ReactNode;
}

/**
 * Reusable empty-state placeholder shown when there is nothing to display.
 * Renders a centred icon, an optional heading, a short description, and an
 * optional call-to-action element (e.g. a Button or IconButton).
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        p: 3,
        color: "text.secondary",
      }}
    >
      {icon}
      {title && (
        <Typography variant="h6" fontWeight={500} color="text.secondary">
          {title}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {description}
      </Typography>
      {action}
    </Box>
  );
}
