import { ReactNode } from "react";
import { render } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme();

/** Wraps `ui` in a MUI ThemeProvider so components that depend on the theme context render correctly. */
export function renderWithTheme(ui: ReactNode) {
  return render(
    <ThemeProvider theme={theme}>{ui}</ThemeProvider>
  );
}
