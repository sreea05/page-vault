import { screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAppStore } from "../store/useAppStore";
import TopBar from "./TopBar";
import { renderWithTheme } from "../test/renderWithTheme";

vi.mock("../store/useAppStore");

type StoreState = {
  openFolder: ReturnType<typeof vi.fn>;
  loadFiles: ReturnType<typeof vi.fn>;
  basePath: string | null;
};

function makeState(overrides: Partial<StoreState> = {}): StoreState {
  return {
    openFolder: vi.fn(),
    loadFiles: vi.fn(),
    basePath: null,
    ...overrides,
  };
}

function setupStore(state: StoreState) {
  vi.mocked(useAppStore).mockImplementation(
    (selector: unknown) =>
      (selector as (s: StoreState) => unknown)(state) as never
  );
}

function renderTopBar(
  props: { sidebarOpen?: boolean; onToggleSidebar?: () => void } = {}
) {
  return renderWithTheme(
    <TopBar
      sidebarOpen={props.sidebarOpen ?? true}
      onToggleSidebar={props.onToggleSidebar ?? vi.fn()}
    />
  );
}

describe("TopBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays the app name", () => {
    setupStore(makeState());
    renderTopBar();

    expect(screen.getByText("Page Vault")).toBeInTheDocument();
  });

  describe("sidebar toggle", () => {
    it("calls onToggleSidebar when the toggle button is clicked", () => {
      setupStore(makeState());
      const onToggleSidebar = vi.fn();
      renderTopBar({ onToggleSidebar });

      fireEvent.click(screen.getByRole("button", { name: /hide sidebar/i }));

      expect(onToggleSidebar).toHaveBeenCalledOnce();
    });

    it("shows Hide Sidebar tooltip when the sidebar is open", () => {
      setupStore(makeState());
      renderTopBar({ sidebarOpen: true });

      expect(
        screen.getByRole("button", { name: /hide sidebar/i })
      ).toBeInTheDocument();
    });

    it("shows Show Sidebar tooltip when the sidebar is closed", () => {
      setupStore(makeState());
      renderTopBar({ sidebarOpen: false });

      expect(
        screen.getByRole("button", { name: /show sidebar/i })
      ).toBeInTheDocument();
    });
  });

  describe("open folder", () => {
    it("calls openFolder when the open folder icon button is clicked", () => {
      const openFolder = vi.fn();
      setupStore(makeState({ openFolder }));
      renderTopBar();

      fireEvent.click(screen.getByRole("button", { name: /open folder/i }));

      expect(openFolder).toHaveBeenCalledOnce();
    });

    it("does not show the folder chip or reload button when no folder is selected", () => {
      setupStore(makeState({ basePath: null }));
      renderTopBar();

      expect(screen.queryByRole("button", { name: /reload files/i })).not.toBeInTheDocument();
    });
  });

  describe("when a folder is selected", () => {
    it("displays the folder name as a chip", () => {
      setupStore(makeState({ basePath: "/home/user/my-vault" }));
      renderTopBar();

      expect(screen.getByText("my-vault")).toBeInTheDocument();
    });

    it("shows the reload files button", () => {
      setupStore(makeState({ basePath: "/home/user/docs" }));
      renderTopBar();

      expect(
        screen.getByRole("button", { name: /reload files/i })
      ).toBeInTheDocument();
    });

    it("calls loadFiles when the reload button is clicked", () => {
      const loadFiles = vi.fn();
      setupStore(makeState({ basePath: "/home/user/docs", loadFiles }));
      renderTopBar();

      fireEvent.click(screen.getByRole("button", { name: /reload files/i }));

      expect(loadFiles).toHaveBeenCalledOnce();
    });

    it("extracts the folder name from a Windows-style backslash path", () => {
      setupStore(makeState({ basePath: "C:\\Users\\user\\my-vault" }));
      renderTopBar();

      expect(screen.getByText("my-vault")).toBeInTheDocument();
    });
  });

  describe("settings", () => {
    it("opens the settings dialog when the settings button is clicked", () => {
      setupStore(makeState());
      renderTopBar();

      fireEvent.click(screen.getByRole("button", { name: /settings/i }));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});
