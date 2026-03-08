import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { join } from "@tauri-apps/api/path";

export type TabData = {
  id: string;
  title: string;
  filePath: string;
};

type AppState = {
  basePath: string | null;
  files: string[];
  tabs: TabData[];
  activeTab: string | null;
  darkMode: boolean;
  loading: boolean;

  initialize: () => Promise<void>;
  openFolder: () => Promise<void>;
  loadFiles: () => Promise<void>;
  openFile: (file: string) => Promise<void>;
  closeTab: (id: string) => void;
  setActiveTab: (id: string | null) => void;
  toggleDarkMode: () => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  basePath: null,
  files: [],
  tabs: [],
  activeTab: null,
  darkMode: localStorage.getItem("darkMode") !== "false",
  loading: false,

  /* ---------------- INIT ---------------- */

  initialize: async () => {
    const saved = localStorage.getItem("lastFolder");
    if (saved) {
      set({ basePath: saved });
      await get().loadFiles();
    }
  },

  /* ---------------- OPEN FOLDER ---------------- */

  openFolder: async () => {
    const folder = await open({
      directory: true,
      multiple: false,
    });

    if (!folder || Array.isArray(folder)) return;

    localStorage.setItem("lastFolder", folder);

    set({
      basePath: folder,
      tabs: [],
      activeTab: null,
      files: [],
    });

    await get().loadFiles();
  },

  /* ---------------- LOAD FILES ---------------- */

  loadFiles: async () => {
    const { basePath } = get();
    if (!basePath) return;

    set({ loading: true });
    try {
      const files = await invoke<string[]>("get_html_files", { basePath });
      set({ files });
    } finally {
      set({ loading: false });
    }
  },

  /* ---------------- OPEN FILE ---------------- */

  openFile: async (file: string) => {
    const { basePath, tabs } = get();
    if (!basePath) return;

    // If the tab is already open, just focus it — no file I/O needed.
    if (tabs.find((t) => t.id === file)) {
      set({ activeTab: file });
      return;
    }

    // Build the absolute path and convert it to a pagevault:// URL.
    // The custom URI scheme protocol registered in Rust serves the file directly
    // from the filesystem, so no file content is ever sent through the IPC channel.
    const fullPath = await join(basePath, file);
    const filePath = convertFileSrc(fullPath, "pagevault");

    set((state) => ({
      tabs: [
        ...state.tabs,
        { id: file, title: file.split(/[/\\]/).pop()!, filePath },
      ],
      activeTab: file,
    }));
  },

  /* ---------------- CLOSE TAB ---------------- */

  closeTab: (id: string) => {
    const { tabs, activeTab } = get();
    const updated = tabs.filter((t) => t.id !== id);

    set({
      tabs: updated,
      activeTab:
        activeTab === id
          ? updated.length
            ? updated[0].id
            : null
          : activeTab,
    });
  },

  setActiveTab: (id) => set({ activeTab: id }),

  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      localStorage.setItem("darkMode", String(next));
      return { darkMode: next };
    }),
}));
