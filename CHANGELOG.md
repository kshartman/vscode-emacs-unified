# Changelog

## 1.2.6

### Changed

- **New icon** — distinct dark teal/gold design, replaces upstream GNU Emacs icon
- **Rewritten README** — leads with fork relationship, documents only new/changed features, links to upstream for inherited reference
- **Updated description** — explicitly identifies as a fork of Awesome Emacs Keymap

## 1.2.5

### Changed

- **Docs** — clarified Awesome Emacs Keymap name and marketplace link in compatibility note, updated CONTRIBUTING.md, README keybinding docs

## 1.2.4

### Changed

- **Dependencies** — bump `paredit-ts` to 1.0.1, `webpack-cli` to 7.0.0, `lint-staged` to 16.4.0
- **CI** — bump `actions/checkout` and `actions/setup-node` to v6 (fixes Node.js 20 deprecation)

## 1.2.3

### Changed

- **CI cleanup** — removed upstream workflows (changesets, post-build, update-keybindings), simplified to lint + build only
- **Auto-publish** — new GitHub Actions workflow publishes to VS Code Marketplace on release
- **Security** — patched `flatted` dev dependency vulnerability via npm override

## 1.2.2

### Fixed

- **`M-g n` / `M-g p`** — no longer opens the in-editor find widget when there are no diagnostics. Falls back to search sidebar results (`Ctrl+Shift+F`) instead.

## 1.2.1

### Added

- **`M-g n` / `M-g p` — unified `next-error` / `previous-error`** — jumps to next/previous diagnostic if the current file has any, otherwise navigates search sidebar results. Matches Emacs `next-error` behavior of navigating whatever error source is active.

## 1.2.0

### Added

- **`M-;` — `comment-dwim`** — proper Emacs comment-dwim implementation:
  - Region active → toggle comment/uncomment
  - Blank line → insert comment at code indentation level
  - Code line, no comment → append comment at `comment-column`
  - Code line with comment → move cursor into existing comment
  - Comment-only line → realign to code indentation
  - Block comment support: C mode uses `/* */` (matching cc-mode), C++ and most others use `//`
  - Built-in syntax for 40+ languages; user-extensible via `emacs-mcx.commentSyntax`
- **`emacs-mcx.commentColumn`** setting — column for end-of-line comments (default 32, matching Emacs)
- **`emacs-mcx.commentSyntax`** setting — override comment delimiters per language, supports both line (`"#"`) and block (`{"start": "/*", "end": "*/"}`) styles

### Fixed

- **Package description** — removed reference to dropped `multi-command` extension; added `paredit`

## 1.1.2

### Changed

- **Dired binding** — changed from `C-x C-d` to `C-x d` to match standard Emacs `dired` keybinding

## 1.1.1

### Fixed

- **Dired keybindings** — Enter, `q`, `^`, `g`, `m`, `u`, `d`, `r`, `c`, `.`, `+`, `C-x C-f` now work in dired buffers. Keybindings were registered in code but missing from package.json.

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
