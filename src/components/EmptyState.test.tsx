import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme, Button } from "@mui/material";
import { describe, it, expect } from "vitest";
import EmptyState from "./EmptyState";

const theme = createTheme();
const renderWithTheme = (ui: JSX.Element) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("EmptyState", () => {
  it("renders the icon", () => {
    renderWithTheme(
      <EmptyState
        icon={<span data-testid="empty-icon">📁</span>}
        description="Nothing here"
      />
    );

    expect(screen.getByTestId("empty-icon")).toBeInTheDocument();
  });

  it("renders the description text", () => {
    renderWithTheme(
      <EmptyState icon={<span />} description="Open a folder to browse" />
    );

    expect(screen.getByText("Open a folder to browse")).toBeInTheDocument();
  });

  it("renders the optional title when provided", () => {
    renderWithTheme(
      <EmptyState
        icon={<span />}
        title="Page Vault"
        description="Select a file"
      />
    );

    expect(screen.getByText("Page Vault")).toBeInTheDocument();
  });

  it("omits the title element when the title prop is not provided", () => {
    const { container } = renderWithTheme(
      <EmptyState icon={<span />} description="Select a file" />
    );

    expect(container.querySelector("h6")).not.toBeInTheDocument();
  });

  it("renders the optional action element when provided", () => {
    renderWithTheme(
      <EmptyState
        icon={<span />}
        description="Nothing here"
        action={<Button>Open Folder</Button>}
      />
    );

    expect(
      screen.getByRole("button", { name: "Open Folder" })
    ).toBeInTheDocument();
  });

  it("renders no action when the action prop is omitted", () => {
    renderWithTheme(
      <EmptyState icon={<span />} description="Nothing here" />
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders nothing in place of a falsy action prop", () => {
    renderWithTheme(
      <EmptyState
        icon={<span />}
        description="Nothing here"
        action={false}
      />
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
