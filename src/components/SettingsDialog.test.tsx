import { screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAppStore } from "../store/useAppStore";
import SettingsDialog from "./SettingsDialog";
import { renderWithTheme } from "../test/renderWithTheme";

vi.mock("../store/useAppStore");

type StoreState = {
  darkMode: boolean;
  toggleDarkMode: ReturnType<typeof vi.fn>;
};

function makeState(overrides: Partial<StoreState> = {}): StoreState {
  return {
    darkMode: false,
    toggleDarkMode: vi.fn(),
    ...overrides,
  };
}

function setupStore(state: StoreState) {
  vi.mocked(useAppStore).mockImplementation(
    (selector: unknown) =>
      (selector as (s: StoreState) => unknown)(state) as never
  );
}

describe("SettingsDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is not visible when open is false", () => {
    setupStore(makeState());
    renderWithTheme(<SettingsDialog open={false} onClose={vi.fn()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the dialog when open is true", () => {
    setupStore(makeState());
    renderWithTheme(<SettingsDialog open onClose={vi.fn()} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("displays a Settings title", () => {
    setupStore(makeState());
    renderWithTheme(<SettingsDialog open onClose={vi.fn()} />);

    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("shows the dark mode toggle switch", () => {
    setupStore(makeState());
    renderWithTheme(<SettingsDialog open onClose={vi.fn()} />);

    expect(screen.getByRole("switch", { name: /dark mode/i })).toBeInTheDocument();
  });

  it("reflects the current dark mode state on the switch", () => {
    setupStore(makeState({ darkMode: true }));
    renderWithTheme(<SettingsDialog open onClose={vi.fn()} />);

    expect(
      screen.getByRole("switch", { name: /dark mode/i })
    ).toBeChecked();
  });

  it("reflects dark mode being off when darkMode is false", () => {
    setupStore(makeState({ darkMode: false }));
    renderWithTheme(<SettingsDialog open onClose={vi.fn()} />);

    expect(
      screen.getByRole("switch", { name: /dark mode/i })
    ).not.toBeChecked();
  });

  it("calls toggleDarkMode when the switch is clicked", () => {
    const toggleDarkMode = vi.fn();
    setupStore(makeState({ toggleDarkMode }));
    renderWithTheme(<SettingsDialog open onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("switch", { name: /dark mode/i }));

    expect(toggleDarkMode).toHaveBeenCalledOnce();
  });

  it("calls onClose when the Done button is clicked", () => {
    const onClose = vi.fn();
    setupStore(makeState());
    renderWithTheme(<SettingsDialog open onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /done/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
