import { screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAppStore } from "../store/useAppStore";
import { TabData } from "../store/useAppStore";
import EditorArea from "./EditorArea";
import { renderWithTheme } from "../test/renderWithTheme";

vi.mock("../store/useAppStore");

type StoreState = {
  tabs: TabData[];
  activeTab: string | null;
  setActiveTab: ReturnType<typeof vi.fn>;
  closeTab: ReturnType<typeof vi.fn>;
  openFolder: ReturnType<typeof vi.fn>;
  basePath: string | null;
};

function makeState(overrides: Partial<StoreState> = {}): StoreState {
  return {
    tabs: [],
    activeTab: null,
    setActiveTab: vi.fn(),
    closeTab: vi.fn(),
    openFolder: vi.fn(),
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

describe("EditorArea", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when no tabs are open and no folder is selected", () => {
    it("shows the app name in the empty state", () => {
      setupStore(makeState({ tabs: [], basePath: null }));
      renderWithTheme(<EditorArea />);

      expect(screen.getByText("Page Vault")).toBeInTheDocument();
    });

    it("prompts the user to open a folder", () => {
      setupStore(makeState({ tabs: [], basePath: null }));
      renderWithTheme(<EditorArea />);

      expect(
        screen.getByText("Open a folder to get started")
      ).toBeInTheDocument();
    });

    it("shows an Open Folder icon button", () => {
      setupStore(makeState({ tabs: [], basePath: null }));
      renderWithTheme(<EditorArea />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("calls openFolder when the icon button is clicked", () => {
      const openFolder = vi.fn();
      setupStore(makeState({ tabs: [], basePath: null, openFolder }));
      renderWithTheme(<EditorArea />);

      fireEvent.click(screen.getByRole("button"));

      expect(openFolder).toHaveBeenCalledOnce();
    });
  });

  describe("when no tabs are open but a folder is selected", () => {
    it("prompts the user to select a file from the sidebar", () => {
      setupStore(makeState({ tabs: [], basePath: "/docs" }));
      renderWithTheme(<EditorArea />);

      expect(
        screen.getByText("Select a file from the sidebar to preview it here")
      ).toBeInTheDocument();
    });

    it("does not show an open-folder action button", () => {
      setupStore(makeState({ tabs: [], basePath: "/docs" }));
      renderWithTheme(<EditorArea />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("when tabs are open", () => {
    const tabs: TabData[] = [
      { id: "a.html", title: "a.html", filePath: "pagevault://localhost/a" },
      { id: "b.html", title: "b.html", filePath: "pagevault://localhost/b" },
    ];

    it("renders a tab for each open file", () => {
      setupStore(makeState({ tabs, activeTab: "a.html" }));
      renderWithTheme(<EditorArea />);

      expect(screen.getByText("a.html")).toBeInTheDocument();
      expect(screen.getByText("b.html")).toBeInTheDocument();
    });

    it("calls setActiveTab when a tab is clicked", () => {
      const setActiveTab = vi.fn();
      setupStore(makeState({ tabs, activeTab: "a.html", setActiveTab }));
      renderWithTheme(<EditorArea />);

      fireEvent.click(screen.getByText("b.html"));

      expect(setActiveTab).toHaveBeenCalledWith("b.html");
    });

    it("calls closeTab with the tab id when the close button is clicked", () => {
      const closeTab = vi.fn();
      setupStore(makeState({ tabs, activeTab: "a.html", closeTab }));
      renderWithTheme(<EditorArea />);

      const closeButtons = screen.getAllByRole("button");
      fireEvent.click(closeButtons[0]);

      expect(closeTab).toHaveBeenCalled();
    });

    it("renders an iframe for the active tab", () => {
      setupStore(
        makeState({
          tabs,
          activeTab: "a.html",
        })
      );
      renderWithTheme(<EditorArea />);

      const iframe = document.querySelector("iframe");
      expect(iframe).toBeInTheDocument();
      expect(iframe?.src).toContain("pagevault://localhost/a");
    });

    it("renders the iframe with an empty sandbox attribute to prevent script execution", () => {
      setupStore(makeState({ tabs, activeTab: "a.html" }));
      renderWithTheme(<EditorArea />);

      const iframe = document.querySelector("iframe");
      expect(iframe).toHaveAttribute("sandbox", "");
    });
  });
});
