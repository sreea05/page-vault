import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock all Tauri API modules so they can be controlled in each test file.
// The actual implementations rely on native Tauri internals that are not
// available in the jsdom environment.
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
  convertFileSrc: vi.fn((path: string) => `pagevault://localhost/${path}`),
}));

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn(),
}));

vi.mock("@tauri-apps/api/path", () => ({
  join: vi.fn((...parts: string[]) => parts.join("/")),
}));
