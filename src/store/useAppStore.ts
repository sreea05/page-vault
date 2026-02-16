import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

export type TabData = {
  id: string;
  title: string;
  content: string;
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

const fileCache = new Map<string, string>();

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

    const files = await invoke<string[]>("get_html_files", {
      basePath,
    });

    set({ files });
  },

  /* ---------------- OPEN FILE ---------------- */

  openFile: async (file: string) => {
    const { basePath, tabs } = get();
    if (!basePath) return;

    if (tabs.find((t) => t.id === file)) {
      set({ activeTab: file });
      return;
    }

    if (fileCache.has(file)) {
      const content = fileCache.get(file)!;
      set((state) => ({
        tabs: [
          ...state.tabs,
          { id: file, title: file.split(/[/\\]/).pop()!, content },
        ],
        activeTab: file,
      }));
      return;
    }

    set({ loading: true });

    const content = await invoke<string>("read_html_file", {
      basePath,
      relativePath: file,
    });

    fileCache.set(file, content);

    set((state) => ({
      tabs: [
        ...state.tabs,
        { id: file, title: file.split(/[/\\]/).pop()!, content },
      ],
      activeTab: file,
      loading: false,
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
