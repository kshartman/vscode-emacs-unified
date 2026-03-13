# Changelog

## 1.1.0

### Added

- **`C-M-u`** — `backward-up-list`: move up/out one level of parentheses
- **`C-M-d`** — `down-list`: move forward and down into the next list

### Fixed

- **Paredit kill ring integration** (ISSUE-1) — `paredit-kill` (`C-S-k`) was correctly adding killed text to the kill ring all along; fixed test assertions that had incorrect expected values

## 1.0.0 — Emacs Unified

First release of Emacs Unified, a consolidation of multiple VS Code Emacs extensions into a single package.

### Based on vscode-emacs-mcx 0.109.1

All features from [vscode-emacs-mcx](https://github.com/whitphx/vscode-emacs-mcx) by Yuichiro Tsuchiya are included as the foundation.

### Added

- **Dired file browser** — browse, create, rename, copy, and delete files without leaving VS Code. Ported from [vscode-dired](https://github.com/shirou/vscode-dired) by WAKAYAMA Shirou, rewritten with async I/O and zero runtime dependencies.
  - `C-x C-d` opens dired
  - Full keybinding set: enter, go up, toggle dot files, mark/unmark, create dir/file, rename, copy, delete
  - Syntax highlighting for dired buffers
  - Symlink support
- **Standard Emacs keybindings** previously missing from mcx:
  - `C-x C-b` — list-buffers (show editors by most recently used)
  - `C-x C-d` — open dired
  - `C-M-\` — indent-region (format selection, or format document if no selection)
- **Smart tab indentation** improvements:
  - Offside-rule language support expanded from Python-only to Python, YAML, CoffeeScript, Haskell, Nim
  - Configurable via `emacs-mcx.tab.offsideRuleLanguages`
  - Fixed over-indent heuristic: only offers deeper indent when previous line opens a block
- **Error handling** — all command callbacks and event listeners wrapped with try-catch
- **`getDocumentId()` utility** — consistent document identity comparison replacing ad-hoc `uri.toString()` calls

### Changed

- **Replaced Winston logger** with VS Code's built-in `LogOutputChannel` — eliminates all runtime npm dependencies except `paredit-ts`
- **Replaced Mocha test runner** with `@vscode/test-cli` + `@vscode/test-electron` for integration tests and Vitest for unit tests
- **Bumped minimum VS Code version** to ^1.93.0 (September 2024)
- **Zero npm audit vulnerabilities** — npm overrides patch transitive dev dependency issues

### Removed

- Winston, winston-console-for-electron, winston-transport (runtime deps)
- Mocha, sinon, eslint-plugin-mocha (dev deps)
- stat-mode, mkdirp (were runtime deps in vscode-dired, replaced with native Node.js/VS Code APIs)

---

## Prior History

For changes before the fork, see the [vscode-emacs-mcx changelog](https://github.com/whitphx/vscode-emacs-mcx/blob/main/CHANGELOG.md).
