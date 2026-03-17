# Emacs Unified

**A consolidation fork of [Awesome Emacs Keymap](https://marketplace.visualstudio.com/items?itemName=tuttieee.emacs-mcx) (vscode-emacs-mcx) that adds new commands and absorbs related extensions into a single package.**

Emacs Unified is a fork of [vscode-emacs-mcx](https://github.com/whitphx/vscode-emacs-mcx) by Yuichiro Tsuchiya. It inherits all of the upstream functionality and adds new features, bug fixes, and absorbed extensions that were previously separate installs.

## Why fork?

Running vanilla Emacs keybindings in VS Code previously required installing multiple extensions that overlapped, conflicted, or accumulated supply-chain risk. Emacs Unified consolidates them:

| Previously separate extension                                                          | Status in Emacs Unified                                     |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [Awesome Emacs Keymap](https://github.com/whitphx/vscode-emacs-mcx) (vscode-emacs-mcx) | **Base** — all 63+ commands and 1200+ keybindings inherited |
| [vscode-dired](https://github.com/shirou/vscode-dired)                                 | **Absorbed** — rewritten with async I/O, zero runtime deps  |
| vscode-emacs-tab                                                                       | **Dropped** — upstream's `TabToTabStop` is superior         |
| vscode-emacs-indent                                                                    | **Dropped** — redundant                                     |
| vscode-emacs-delete-horizontal-space                                                   | **Dropped** — upstream already has `deleteHorizontalSpace`  |
| vscode-json-pretty-printer                                                             | **Dropped** — VS Code has built-in JSON formatting          |

## What's new (beyond upstream)

These features are **not in Awesome Emacs Keymap** and are original to Emacs Unified:

### `M-;` comment-dwim

A faithful implementation of Emacs' `comment-dwim` with five behaviors depending on context:

- **Region active** — toggle comment/uncomment
- **Blank line** — insert comment at code indentation level (not column 0)
- **Code line, no comment** — append comment at `comment-column`
- **Code line with existing comment** — move cursor into the comment
- **Comment-only line** — realign to code indentation

Block comment support: C mode uses `/* */` (matching cc-mode), C++ and most others use `//`. Built-in syntax for 40+ languages, user-extensible via `emacs-mcx.commentSyntax`.

### `M-g n` / `M-g p` unified next-error

Emacs-like `next-error` / `previous-error` that checks for diagnostics first, then falls back to search sidebar results — just like Emacs navigates whatever error source is active.

### Dired file browser

Browse and manage files without leaving VS Code. Open with `C-x d`.

| Command         | Desc                         |
| --------------- | ---------------------------- |
| `RET`           | Open file or enter directory |
| `^`             | Go up to parent directory    |
| `.`             | Toggle dot files             |
| `g`             | Refresh                      |
| `m` / `u`       | Mark / unmark                |
| `+`             | Create directory             |
| `C-x f`         | Create file                  |
| `R` / `C` / `D` | Rename / copy / delete       |
| `q`             | Close dired                  |

### Additional keybindings

| Binding   | Command                                            |
| --------- | -------------------------------------------------- |
| `C-M-u`   | `backward-up-list` — move up/out one paren level   |
| `C-M-d`   | `down-list` — move forward and down into next list |
| `C-x d`   | Open dired (standard Emacs binding)                |
| `C-x C-b` | List buffers by most recently used                 |
| `C-M-\`   | Format selection / document (`indent-region`)      |

### Other improvements

- **Zero runtime npm dependencies** (except [paredit-ts](https://github.com/kshartman/paredit-ts)) — replaced Winston logger with VS Code's built-in `LogOutputChannel`
- **Sexp operations powered by [paredit-ts](https://github.com/kshartman/paredit-ts)** — a TypeScript rewrite of paredit.js
- **Zero `npm audit` vulnerabilities**
- **Works as both desktop and [web extension](https://code.visualstudio.com/api/extension-guides/web-extensions)**

## Compatibility with Awesome Emacs Keymap

Emacs Unified retains the `emacs-mcx` configuration namespace so your existing `emacs-mcx.*` settings carry over without changes. However, **Emacs Unified and Awesome Emacs Keymap cannot be installed at the same time** — they share command IDs and keybindings. Uninstall one before installing the other.

## New settings (Emacs Unified only)

### `emacs-mcx.commentColumn`

Column at which `comment-dwim` (`M-;`) inserts end-of-line comments. Default is 32, matching Emacs' default `comment-column`.

### `emacs-mcx.commentSyntax`

Map of VS Code language ID to comment delimiter. Overrides or extends the built-in defaults (40+ languages). A plain string means a line comment; an object with `start`/`end` means a block comment.

```json
"emacs-mcx.commentSyntax": {
  "python": "#",
  "c": { "start": "/*", "end": "*/" }
}
```

## Inherited settings and keybindings

All settings and keybindings from [Awesome Emacs Keymap](https://github.com/whitphx/vscode-emacs-mcx#extension-settings) are supported. See the [upstream README](https://github.com/whitphx/vscode-emacs-mcx#readme) for the complete reference of inherited commands, keybinding tables, configuration options, `when` clause contexts, and the prefix argument API.

### Dired settings

| Setting               | Type    | Default | Description                                    |
| --------------------- | ------- | ------- | ---------------------------------------------- |
| `dired.fixed_window`  | boolean | `false` | Reuse the same editor tab for dired navigation |
| `dired.ask_directory` | boolean | `true`  | Prompt for directory when opening dired        |

## Attribution

This extension is built on the work of several authors:

- **[vscode-emacs-mcx](https://github.com/whitphx/vscode-emacs-mcx)** by Yuichiro Tsuchiya (whitphx) — MIT license, the foundation
- **[vscode-dired](https://github.com/shirou/vscode-dired)** by WAKAYAMA Shirou — Apache 2.0, the dired file browser
- **[vscode-emacs-friendly](https://github.com/SebastianZaha/vscode-emacs-friendly)** by Sebastian Zaha — Apache 2.0, keybinding design inspiration
- **[Emacs Keymap](https://github.com/hiro-sun/vscode-emacs)** by hiro-sun — the original VS Code Emacs extension

See [LICENSE](./LICENSE) for full details.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup, build commands, and release workflow.
