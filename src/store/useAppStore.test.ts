import { describe, it, expect, beforeEach, vi } from "vitest";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { join } from "@tauri-apps/api/path";
import { useAppStore } from "./useAppStore";

const mockInvoke = vi.mocked(invoke);
const mockOpen = vi.mocked(open);
const mockJoin = vi.mocked(join);
const mockConvertFileSrc = vi.mocked(convertFileSrc);

describe("useAppStore", () => {
  beforeEach(() => {
    useAppStore.setState({
      basePath: null,
      files: [],
      tabs: [],
      activeTab: null,
      darkMode: true,
      loading: false,
    });
    localStorage.clear();
    vi.clearAllMocks();
    mockConvertFileSrc.mockImplementation(
      (path: string) => `pagevault://localhost/${path}`
    );
    mockJoin.mockImplementation(async (...parts: string[]) => parts.join("/"));
  });

  describe("initialize", () => {
    it("restores the last opened folder and its files on startup", async () => {
      localStorage.setItem("lastFolder", "/home/user/docs");
      mockInvoke.mockResolvedValue(["a.html", "b.html"]);

      await useAppStore.getState().initialize();

      expect(useAppStore.getState().basePath).toBe("/home/user/docs");
      expect(useAppStore.getState().files).toEqual(["a.html", "b.html"]);
    });

    it("stays idle when no folder was previously saved", async () => {
      await useAppStore.getState().initialize();

      expect(useAppStore.getState().basePath).toBeNull();
      expect(mockInvoke).not.toHaveBeenCalled();
    });
  });

  describe("openFolder", () => {
    it("sets the basePath and persists it to localStorage", async () => {
      mockOpen.mockResolvedValue("/home/user/vault");
      mockInvoke.mockResolvedValue([]);

      await useAppStore.getState().openFolder();

      expect(useAppStore.getState().basePath).toBe("/home/user/vault");
      expect(localStorage.getItem("lastFolder")).toBe("/home/user/vault");
    });

    it("clears existing tabs when a new folder is opened", async () => {
      useAppStore.setState({
        tabs: [{ id: "old.html", title: "old.html", filePath: "x" }],
        activeTab: "old.html",
      });
      mockOpen.mockResolvedValue("/new-folder");
      mockInvoke.mockResolvedValue([]);

      await useAppStore.getState().openFolder();

      expect(useAppStore.getState().tabs).toEqual([]);
      expect(useAppStore.getState().activeTab).toBeNull();
    });

    it("does nothing when the folder dialog is cancelled", async () => {
      mockOpen.mockResolvedValue(null);

      await useAppStore.getState().openFolder();

      expect(useAppStore.getState().basePath).toBeNull();
      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("does nothing when the dialog returns multiple paths", async () => {
      mockOpen.mockResolvedValue(["/a", "/b"]);

      await useAppStore.getState().openFolder();

      expect(useAppStore.getState().basePath).toBeNull();
    });

    it("loads files from the newly selected folder", async () => {
      mockOpen.mockResolvedValue("/home/user/vault");
      mockInvoke.mockResolvedValue(["index.html"]);

      await useAppStore.getState().openFolder();

      expect(mockInvoke).toHaveBeenCalledWith("get_html_files", {
        basePath: "/home/user/vault",
      });
    });
  });

  describe("loadFiles", () => {
    it("fetches HTML files from the backend for the current folder", async () => {
      useAppStore.setState({ basePath: "/docs" });
      mockInvoke.mockResolvedValue(["index.html", "sub/page.html"]);

      await useAppStore.getState().loadFiles();

      expect(mockInvoke).toHaveBeenCalledWith("get_html_files", {
        basePath: "/docs",
      });
      expect(useAppStore.getState().files).toEqual([
        "index.html",
        "sub/page.html",
      ]);
    });

    it("sets loading to true while fetching and resets it to false on success", async () => {
      useAppStore.setState({ basePath: "/docs" });
      let wasLoading = false;
      mockInvoke.mockImplementation(async () => {
        wasLoading = useAppStore.getState().loading;
        return [];
      });

      await useAppStore.getState().loadFiles();

      expect(wasLoading).toBe(true);
      expect(useAppStore.getState().loading).toBe(false);
    });

    it("resets loading to false when the fetch fails", async () => {
      useAppStore.setState({ basePath: "/docs" });
      mockInvoke.mockRejectedValue(new Error("IPC error"));

      await expect(useAppStore.getState().loadFiles()).rejects.toThrow(
        "IPC error"
      );
      expect(useAppStore.getState().loading).toBe(false);
    });

    it("does nothing when no basePath is set", async () => {
      await useAppStore.getState().loadFiles();

      expect(mockInvoke).not.toHaveBeenCalled();
    });
  });

  describe("openFile", () => {
    it("adds a new tab and makes it active", async () => {
      useAppStore.setState({ basePath: "/docs" });
      mockJoin.mockResolvedValue("/docs/index.html");
      mockConvertFileSrc.mockReturnValue(
        "pagevault://localhost/docs/index.html"
      );

      await useAppStore.getState().openFile("index.html");

      const { tabs, activeTab } = useAppStore.getState();
      expect(tabs).toHaveLength(1);
      expect(tabs[0]).toEqual({
        id: "index.html",
        title: "index.html",
        filePath: "pagevault://localhost/docs/index.html",
      });
      expect(activeTab).toBe("index.html");
    });

    it("focuses the existing tab instead of creating a duplicate", async () => {
      useAppStore.setState({
        basePath: "/docs",
        tabs: [{ id: "a.html", title: "a.html", filePath: "pagevault://a" }],
        activeTab: null,
      });

      await useAppStore.getState().openFile("a.html");

      expect(useAppStore.getState().tabs).toHaveLength(1);
      expect(useAppStore.getState().activeTab).toBe("a.html");
      expect(mockJoin).not.toHaveBeenCalled();
    });

    it("derives the display title from the file name at the end of the path", async () => {
      useAppStore.setState({ basePath: "/docs" });
      mockJoin.mockResolvedValue("/docs/deep/nested/report.html");
      mockConvertFileSrc.mockReturnValue("pagevault://x");

      await useAppStore.getState().openFile("deep/nested/report.html");

      expect(useAppStore.getState().tabs[0].title).toBe("report.html");
    });

    it("does nothing when no basePath is set", async () => {
      await useAppStore.getState().openFile("index.html");

      expect(useAppStore.getState().tabs).toHaveLength(0);
    });
  });

  describe("closeTab", () => {
    it("removes the specified tab from the list", () => {
      useAppStore.setState({
        tabs: [
          { id: "a.html", title: "a.html", filePath: "" },
          { id: "b.html", title: "b.html", filePath: "" },
        ],
        activeTab: "b.html",
      });

      useAppStore.getState().closeTab("a.html");

      const { tabs } = useAppStore.getState();
      expect(tabs).toHaveLength(1);
      expect(tabs[0].id).toBe("b.html");
    });

    it("automatically focuses another tab when the active tab is closed", () => {
      useAppStore.setState({
        tabs: [
          { id: "a.html", title: "a.html", filePath: "" },
          { id: "b.html", title: "b.html", filePath: "" },
        ],
        activeTab: "a.html",
      });

      useAppStore.getState().closeTab("a.html");

      expect(useAppStore.getState().activeTab).toBe("b.html");
    });

    it("sets activeTab to null when the last tab is closed", () => {
      useAppStore.setState({
        tabs: [{ id: "a.html", title: "a.html", filePath: "" }],
        activeTab: "a.html",
      });

      useAppStore.getState().closeTab("a.html");

      expect(useAppStore.getState().tabs).toHaveLength(0);
      expect(useAppStore.getState().activeTab).toBeNull();
    });

    it("preserves the active tab when a different tab is closed", () => {
      useAppStore.setState({
        tabs: [
          { id: "a.html", title: "a.html", filePath: "" },
          { id: "b.html", title: "b.html", filePath: "" },
        ],
        activeTab: "b.html",
      });

      useAppStore.getState().closeTab("a.html");

      expect(useAppStore.getState().activeTab).toBe("b.html");
    });
  });

  describe("setActiveTab", () => {
    it("switches to the specified tab", () => {
      useAppStore.setState({ activeTab: null });

      useAppStore.getState().setActiveTab("page.html");

      expect(useAppStore.getState().activeTab).toBe("page.html");
    });

    it("accepts null to deselect all tabs", () => {
      useAppStore.setState({ activeTab: "page.html" });

      useAppStore.getState().setActiveTab(null);

      expect(useAppStore.getState().activeTab).toBeNull();
    });
  });

  describe("toggleDarkMode", () => {
    it("switches dark mode off and persists the preference", () => {
      useAppStore.setState({ darkMode: true });

      useAppStore.getState().toggleDarkMode();

      expect(useAppStore.getState().darkMode).toBe(false);
      expect(localStorage.getItem("darkMode")).toBe("false");
    });

    it("switches dark mode on and persists the preference", () => {
      useAppStore.setState({ darkMode: false });

      useAppStore.getState().toggleDarkMode();

      expect(useAppStore.getState().darkMode).toBe(true);
      expect(localStorage.getItem("darkMode")).toBe("true");
    });
  });
});
