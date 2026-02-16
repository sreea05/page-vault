# Page Vault

Page Vault helps you quickly visualize HTML pages you've downloaded to view offline. Point the app at a local folder, it will recursively locate `*.html` files and let you preview each page.

Key features
------------
- Browse a folder tree of HTML files discovered recursively
- Open files in tabs and preview rendered HTML
- Simple UI built with MUI

**Table of contents**
- Project status
- Getting started
- Development workflow
- Production Build
- Contributing
- License

---

**Project status**
- Small, focused tool. Frontend & backend commands are present and wired via Tauri.
- No tests are included currently.

---

**Getting started**
- Node.js (18+ recommended) and npm
- Rust toolchain (stable) + `cargo`
- Tauri prerequisites per your OS: see Tauri docs (Rust + lib/deps)

Install frontend dependencies:

```bash
npm install
```

---

**Development workflow**

Run the frontend dev server (Vite):

```bash
npm run dev
```

Run the Tauri dev environment (this will start the frontend dev server automatically per `tauri.conf.json`):

```bash
npm run tauri dev
```

---

**Production Build**

1. Build the frontend:

```bash
npm run build
```

2. Build the Tauri desktop bundle:

```bash
npm run tauri build
```

---

**Contributing**

- Feel free to open issues or PRs. Keep changes small and focused
- For UI changes, prefer using MUI components

---

**License**
- See the repository `LICENSE` file.
