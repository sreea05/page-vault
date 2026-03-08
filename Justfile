# Page Vault – developer task runner
# Install just: https://just.systems/man/en/

# Show available recipes
default:
    @just --list

# ─── Frontend ─────────────────────────────────────────────────────────────────

# Install npm dependencies
install:
    npm install

# Start the Vite dev server (frontend only, no Tauri)
dev-web:
    npm run dev

# Type-check and build the frontend for production
build-web:
    npm run build

# Preview the production frontend build
preview:
    npm run preview

# Run the test suite once
test:
    npm test

# Run tests in watch mode
test-watch:
    npm run test:watch

# Run tests and generate a coverage report
coverage:
    npm run test:coverage

# ─── Tauri (desktop) ──────────────────────────────────────────────────────────

# Start the full Tauri desktop app in debug mode (hot-reload)
dev:
    npm run tauri dev

# Build the Tauri desktop app in debug mode
build-debug:
    npm run tauri build -- --debug

# Build the Tauri desktop app in release mode
build:
    npm run tauri build

# ─── Rust backend ─────────────────────────────────────────────────────────────

# Check that the Rust backend compiles without producing binaries
check-rust:
    cd src-tauri && cargo check

# Run Rust unit tests
test-rust:
    cd src-tauri && cargo test

# Lint the Rust backend with Clippy
lint-rust:
    cd src-tauri && cargo clippy -- -D warnings

# Format the Rust backend source files
fmt-rust:
    cd src-tauri && cargo fmt

# ─── Aggregate ────────────────────────────────────────────────────────────────

# Install dependencies then run all checks and tests
ci: install test check-rust test-rust lint-rust
