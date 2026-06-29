# Repository Guidelines

This file provides guidance for AI coding agents working with this repository. See `CONTRIBUTING.md` for the full contributor guide (setup, debugging in VS Code, lint/test commands, release flow); if anything here conflicts, defer to `CONTRIBUTING.md`.

## Project Overview

Emacs Unified is a VS Code extension that consolidates several Emacs emulation extensions into a single package. It is forked from [vscode-emacs-mcx](https://github.com/whitphx/vscode-emacs-mcx) by Yuichiro Tsuchiya (whitphx) and absorbs functionality from [vscode-dired](https://github.com/shirou/vscode-dired) by WAKAYAMA Shirou.

The extension provides comprehensive Emacs keybindings and operations: multi-cursor support, kill-ring with clipboard integration, mark-mode, mark-ring, prefix arguments, sexp/paredit operations, registers, rectangles, and a dired file browser. It works as both a desktop and web extension.

## Project Goals

- **Type safety**: Strict TypeScript — no `any` types where avoidable, `noImplicitReturns` enabled (future: `noUnusedParameters`)
- **Minimal dependencies**: Zero runtime npm deps beyond `paredit-ts`. No supply chain duplication. All new/modified code should avoid introducing dependencies
- **Test coverage**: All new and modified code gets tests. Integration tests via @vscode/test-cli for VS Code API interactions, vitest for pure logic
- **Emacs fidelity**: Correct Emacs behavior out of the box, especially for key languages (C, C++, C#, bash, JS, TS, JSON, YAML, Python). Default to VS Code-like behavior where Emacs and VS Code diverge; offer Emacs-like variants behind configuration options
- **Clean architecture**: Consistent error handling, modern ES2022+ idioms, `vscode.Disposable` patterns, no deprecated VS Code APIs

## Development Commands

### Build

- `npm run webpack:dev` - Development build
- `npm run webpack:prod` - Production build
- `npm run test-compile` - TypeScript compilation with tsc-alias

### Test

- `npm run test-gen-keys` - Unit tests via vitest (keybinding generator + pure logic; no VS Code). Config: `vitest.config.ts`
- `npm run test` - Full VS Code integration suite via @vscode/test-cli (config: `.vscode-test.mjs`, mocha TDD). Two labels: `core` and `clipboard`
- `npm run test:headless` - Unit + `core` integration tests, fully headless on xvfb (no windows, no clipboard flake) — the everyday path
- `npm run test:core` - Integration tests except the kill-ring/yank clipboard suites (headless xvfb)
- `npm run test:clipboard` - Only the kill-ring/yank clipboard suites, via `scripts/run-integration-tests.sh` on WSLg `:0` (real clipboard, `retries: 2`)
- `npm run test:web` - Web extension tests

**Clipboard tests need a real clipboard.** The kill-ring/yank tests use VS Code's native clipboard paste (an async OS-clipboard round-trip), which flakes under bare xvfb. They run on `:0` (real Windows clipboard via WSLg) and are retry-wrapped; everything else is stable headless. See CONTRIBUTING.md.

### Lint

- `npm run check:eslint` / `npm run fix:eslint`
- `npm run check:prettier` / `npm run fix:prettier`

### Keybinding Generation

- `npm run gen-keys` - Generate keybindings from `keybindings/*.json` into package.json
- **CRITICAL: Never edit package.json keybindings directly** — edit `keybindings/*.json` then run gen-keys
- `gen-keys` weaves in VS Code's default keybindings (so e.g. `C-g` cancels whatever `Escape` cancels) from a **vendored** snapshot in `keybinding-generator/default-keybindings/` — committed, not fetched, so generation is deterministic/offline and the release gate can't drift-break
- `npm run refresh-vsc-defaults` - deliberately re-download that snapshot (then gen-keys + review + test + commit). Do this when bumping `engines.vscode`, not in CI. See CONTRIBUTING.md

## Architecture

### Core Components

- **EmacsEmulator** (`src/emulator.ts`) - Central controller, one instance per text editor
- **Extension entry** (`src/extension.ts`) - Creates shared state (KillRing, Minibuffer, Registers), registers commands, manages emulator lifecycle
- **Commands** (`src/commands/`) - Each extends `EmacsCommand`, registered in `EmacsCommandRegistry`
- **Kill-Ring** (`src/kill-yank/`) - Clipboard-integrated kill ring, shared across all emulators
- **Dired** (`src/commands/dired/`) - File browser using `TextDocumentContentProvider` with `dired://` URI scheme

### Project Structure

- `src/` - TypeScript sources
  - `src/commands/` - Command implementations by category (move, edit, kill, paredit, dired, etc.)
  - `src/kill-yank/` - Kill-ring and yank functionality
  - `src/configuration/` - Extension configuration management
  - `src/test/` - VS Code integration tests (mocha TDD: `suite`/`test`/`setup`/`teardown`)
- `keybindings/` - Source keybinding definitions (NOT package.json directly)
- `keybinding-generator/` - CLI that writes keybindings into package.json
- `build/` - Bundler configs
- `vendor/` - Vendorized deps (currently unused)
- `dist/` - Built artifacts (regenerated, don't edit)

## Adding New Commands

1. Create command class in `src/commands/` (extends `EmacsCommand`)
2. Register in `EmacsCommandRegistry` within `EmacsEmulator` constructor
3. Add to `src/extension.ts` via `bindEmulatorCommand(name)` or `registerEmulatorCommand(...)`
4. Add keybinding to `keybindings/*.json` (NOT package.json)
5. Run `npm run gen-keys`

## Key Design Decisions

- **`emacs-mcx` namespace retained** — all command IDs (`emacs-mcx.*`) and configuration keys (`emacs-mcx.*`) keep the upstream namespace for settings compatibility with vscode-emacs-mcx. This means **Emacs Unified and vscode-emacs-mcx cannot be installed simultaneously** — they will collide on command IDs and keybindings. Users must uninstall one before installing the other.
- **Zero runtime npm dependencies** except `paredit-ts` — logging uses VS Code's built-in `LogOutputChannel`, no Winston
- **Engine requirement**: VS Code ^1.93.0
- **Activation**: `onStartupFinished` (single activation event)
- **Behavior alignment**: Default to VS Code-like behavior; offer Emacs-like variants behind configuration options
- **Tab indentation**: Brace languages delegate to VS Code reindent; offside-rule languages (Python, YAML, etc.) cycle through valid indent levels. Configurable via `emacs-mcx.tab.offsideRuleLanguages`
- **Document identity**: Use `getDocumentId()` utility (`src/utils.ts`) for consistent document comparison

## Coding Style

- Prettier + ESLint are the source of truth (2-space indent, trailing commas, semicolons)
- PascalCase for command classes, camelCase for `id` fields
- `emacs-mcx.*` prefix for keybinding names and configuration
- Prefer `vscode.Disposable` patterns for resource cleanup
- All command callbacks and event listeners wrapped with try-catch error handling

## Dependencies

- **Runtime**: `paredit-ts` (sexp operations)
- **Dev**: `@vscode/test-cli` + `@vscode/test-electron` (integration tests), `vitest` (unit tests), webpack (bundling), TypeScript, ESLint, Prettier
- npm `overrides` patch transitive vulnerabilities in dev dependencies (0 audit issues)

## Attribution

This project builds on work by multiple authors. See `LICENSE` for full details:

- [vscode-emacs-mcx](https://github.com/whitphx/vscode-emacs-mcx) by Yuichiro Tsuchiya — MIT
- [vscode-dired](https://github.com/shirou/vscode-dired) by WAKAYAMA Shirou — Apache 2.0
- [VS Code](https://github.com/microsoft/vscode) by Microsoft — MIT (files in `src/vs/`)
- [VSCodeVim](https://github.com/VSCodeVim/Vim) — MIT
- [vscode-emacs-friendly](https://github.com/SebastianZaha/vscode-emacs-friendly) by Sebastian Zaha — Apache 2.0
