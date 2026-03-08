import { screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAppStore } from "../store/useAppStore";
import Sidebar from "./Sidebar";
import { renderWithTheme } from "../test/renderWithTheme";

vi.mock("../store/useAppStore");

type StoreState = {
  files: string[];
  openFile: ReturnType<typeof vi.fn>;
  basePath: string | null;
  openFolder: ReturnType<typeof vi.fn>;
};

function makeState(overrides: Partial<StoreState> = {}): StoreState {
  return {
    files: [],
    openFile: vi.fn(),
    basePath: null,
    openFolder: vi.fn(),
    ...overrides,
  };
}

function setupStore(state: StoreState) {
  vi.mocked(useAppStore).mockImplementation(
    (selector: unknown) =>
      (selector as (s: StoreState) => unknown)(state) as never
  );
}

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when no folder is selected", () => {
    it("shows the empty state prompt to open a folder", () => {
      setupStore(makeState({ basePath: null }));
      renderWithTheme(<Sidebar />);

      expect(
        screen.getByText("Open a folder to browse your HTML files")
      ).toBeInTheDocument();
    });

    it("shows an Open Folder button in the empty state", () => {
      setupStore(makeState({ basePath: null }));
      renderWithTheme(<Sidebar />);

      expect(
        screen.getByRole("button", { name: /open folder/i })
      ).toBeInTheDocument();
    });

    it("calls openFolder when the Open Folder button is clicked", () => {
      const openFolder = vi.fn();
      setupStore(makeState({ basePath: null, openFolder }));
      renderWithTheme(<Sidebar />);

      fireEvent.click(screen.getByRole("button", { name: /open folder/i }));

      expect(openFolder).toHaveBeenCalledOnce();
    });
  });

  describe("when a folder is selected", () => {
    it("shows the search input", () => {
      setupStore(
        makeState({ basePath: "/docs", files: ["index.html", "about.html"] })
      );
      renderWithTheme(<Sidebar />);

      expect(
        screen.getByPlaceholderText("Search files…")
      ).toBeInTheDocument();
    });

    it("displays the total file count when no search is active", () => {
      setupStore(
        makeState({ basePath: "/docs", files: ["a.html", "b.html", "c.html"] })
      );
      renderWithTheme(<Sidebar />);

      expect(screen.getByText("3 files")).toBeInTheDocument();
    });

    it("displays a singular file count label for exactly one file", () => {
      setupStore(makeState({ basePath: "/docs", files: ["a.html"] }));
      renderWithTheme(<Sidebar />);

      expect(screen.getByText("1 file")).toBeInTheDocument();
    });

    it("shows all file names in the tree", () => {
      setupStore(
        makeState({ basePath: "/docs", files: ["index.html", "about.html"] })
      );
      renderWithTheme(<Sidebar />);

      expect(screen.getByText("index.html")).toBeInTheDocument();
      expect(screen.getByText("about.html")).toBeInTheDocument();
    });

    it("calls openFile with the correct path when a file is clicked", () => {
      const openFile = vi.fn();
      setupStore(
        makeState({ basePath: "/docs", files: ["index.html"], openFile })
      );
      renderWithTheme(<Sidebar />);

      fireEvent.click(screen.getByText("index.html"));

      expect(openFile).toHaveBeenCalledWith("index.html");
    });

    describe("search", () => {
      it("filters the displayed files to those matching the query", () => {
        setupStore(
          makeState({
            basePath: "/docs",
            files: ["index.html", "about.html", "contact.html"],
          })
        );
        renderWithTheme(<Sidebar />);

        fireEvent.change(screen.getByPlaceholderText("Search files…"), {
          target: { value: "about" },
        });

        expect(screen.getByText("about.html")).toBeInTheDocument();
        expect(screen.queryByText("index.html")).not.toBeInTheDocument();
        expect(screen.queryByText("contact.html")).not.toBeInTheDocument();
      });

      it("shows the filtered vs total count when a search is active", () => {
        setupStore(
          makeState({
            basePath: "/docs",
            files: ["index.html", "about.html", "contact.html"],
          })
        );
        renderWithTheme(<Sidebar />);

        fireEvent.change(screen.getByPlaceholderText("Search files…"), {
          target: { value: "about" },
        });

        expect(screen.getByText("1 of 3 files")).toBeInTheDocument();
      });

      it("performs case-insensitive matching", () => {
        setupStore(
          makeState({ basePath: "/docs", files: ["README.html", "index.html"] })
        );
        renderWithTheme(<Sidebar />);

        fireEvent.change(screen.getByPlaceholderText("Search files…"), {
          target: { value: "readme" },
        });

        expect(screen.getByText("README.html")).toBeInTheDocument();
        expect(screen.queryByText("index.html")).not.toBeInTheDocument();
      });

      it("shows a no-results message when no files match the query", () => {
        setupStore(
          makeState({ basePath: "/docs", files: ["index.html"] })
        );
        renderWithTheme(<Sidebar />);

        fireEvent.change(screen.getByPlaceholderText("Search files…"), {
          target: { value: "xyz" },
        });

        expect(screen.getByText(/no files match/i)).toBeInTheDocument();
      });

      it("shows a clear button when search text is entered", () => {
        setupStore(
          makeState({ basePath: "/docs", files: ["index.html"] })
        );
        renderWithTheme(<Sidebar />);

        fireEvent.change(screen.getByPlaceholderText("Search files…"), {
          target: { value: "abc" },
        });

        expect(
          screen.getByRole("button", { name: /clear search/i })
        ).toBeInTheDocument();
      });

      it("clears the search when the clear button is clicked", () => {
        setupStore(
          makeState({
            basePath: "/docs",
            files: ["index.html", "about.html"],
          })
        );
        renderWithTheme(<Sidebar />);

        const input = screen.getByPlaceholderText("Search files…");
        fireEvent.change(input, { target: { value: "about" } });
        fireEvent.click(screen.getByRole("button", { name: /clear search/i }));

        expect(
          (input as HTMLInputElement).value
        ).toBe("");
        expect(screen.getByText("index.html")).toBeInTheDocument();
      });
    });
  });
});
