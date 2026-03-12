# Repository Guidelines

This file provides guidance for AI coding agents working with this repository. See `CONTRIBUTING.md` for the full contributor guide (setup, debugging in VS Code, lint/test commands, release flow); if anything here conflicts, defer to `CONTRIBUTING.md`.

## Project Overview

Emacs Unified is a VS Code extension that consolidates several Emacs emulation extensions into a single package. It is forked from [vscode-emacs-mcx](https://github.com/whitphx/vscode-emacs-mcx) by Yuichiro Tsuchiya (whitphx) and absorbs functionality from [vscode-dired](https://github.com/shirou/vscode-dired) by WAKAYAMA Shirou.

The extension provides comprehensive Emacs keybindings and operations: multi-cursor support, kill-ring with clipboard integration, mark-mode, mark-ring, prefix arguments, sexp/paredit operations, registers, rectangles, and a dired file browser. It works as both a desktop and web extension.

## Project Goals

- **Type safety**: Strict TypeScript — no `any` types where avoidable, `noImplicitReturns`, `noUnusedParameters`
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

- `npm run test` - VS Code integration tests via @vscode/test-cli (config: `.vscode-test.mjs`, mocha TDD style)
- `npm run test-gen-keys` - Keybinding generator tests via vitest (config: `vitest.config.ts`)
- `npm run test:web` - Web extension tests

### Lint

- `npm run check:eslint` / `npm run fix:eslint`
- `npm run check:prettier` / `npm run fix:prettier`

### Keybinding Generation

- `npm run gen-keys` - Generate keybindings from `keybindings/*.json` into package.json
- **CRITICAL: Never edit package.json keybindings directly** — edit `keybindings/*.json` then run gen-keys

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
