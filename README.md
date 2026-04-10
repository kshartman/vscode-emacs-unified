# Emacs Unified

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code%20Marketplace-v1.2.11-blue?logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=kshartman.emacs-unified)
[![GitHub Release](https://img.shields.io/github/v/release/kshartman/vscode-emacs-unified?label=GitHub%20Release&logo=github)](https://github.com/kshartman/vscode-emacs-unified/releases/latest)

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

Browse and manage files without leaving VS Code. Open with `C-x d`. See the keybinding reference below for all dired commands.

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

## Complete keybinding reference

All keybindings from the upstream [Awesome Emacs Keymap](https://github.com/whitphx/vscode-emacs-mcx) are included plus the additions listed above. The `Meta` key is `Alt` by default; configure via `emacs-mcx.useMetaPrefixEscape`, `emacs-mcx.useMetaPrefixCtrlLeftBracket`, or `emacs-mcx.useMetaPrefixMacCmd`.

<details>
<summary><strong>Movement</strong></summary>

| Key                      | Command                                                        | Prefix arg |
| ------------------------ | -------------------------------------------------------------- | :--------: |
| `C-f` / `C-b`            | forward-char / backward-char                                   |     ✓      |
| `C-n` / `C-p`            | next-line / previous-line                                      |     ✓      |
| `C-a` / `C-e`            | beginning-of-line / end-of-line                                |     ✓      |
| `M-f` / `M-b`            | forward-word / backward-word                                   |     ✓      |
| `C-<right>` / `C-<left>` | right-word / left-word                                         |     ✓      |
| `M-m`                    | back-to-indentation                                            |            |
| `C-v` / `M-v`            | scroll-up / scroll-down                                        |     ✓      |
| `M-{` / `M-}`            | backward-paragraph / forward-paragraph                         |     ✓      |
| `M-<` / `M->`            | beginning-of-buffer / end-of-buffer                            |            |
| `M-g g`                  | goto-line                                                      |     ✓      |
| `M-g n` / `M-g p`        | next-error / previous-error (diagnostics, then search results) |            |
| `C-l`                    | recenter-top-bottom                                            |            |

</details>

<details>
<summary><strong>Search</strong></summary>

| Key               | Command                                          |
| ----------------- | ------------------------------------------------ |
| `C-s` / `C-r`     | isearch-forward / isearch-backward               |
| `C-M-s` / `C-M-r` | isearch-forward-regexp / isearch-backward-regexp |
| `M-%`             | query-replace                                    |
| `C-M-%`           | query-replace-regexp                             |
| `C-M-n` / `C-M-p` | add selection to next/previous find match        |
| `M-s o`           | Quick Search (like occur)                        |

</details>

<details>
<summary><strong>Editing</strong></summary>

| Key                   | Command                                | Prefix arg |
| --------------------- | -------------------------------------- | :--------: |
| `C-d` / `C-h`         | delete forward / backward              |     ✓      |
| `M-\`                 | delete-horizontal-space                |     ✓      |
| `C-x C-o`             | delete-blank-lines                     |            |
| `C-t` / `C-x C-t`     | transpose-chars / transpose-lines      |     ✓      |
| `M-^`                 | delete-indentation                     |            |
| `M-d` / `M-Bksp`      | kill-word / backward-kill-word         |     ✓      |
| `M-z`                 | zap-to-char                            |     ✓      |
| `C-k`                 | kill-line                              |     ✓      |
| `C-S-Bksp`            | kill-whole-line                        |            |
| `C-w`                 | kill-region                            |            |
| `M-w`                 | kill-ring-save                         |            |
| `C-y`                 | yank                                   |     ✓      |
| `M-y`                 | yank-pop                               |     ✓      |
| `C-c y`               | browse kill ring                       |            |
| `C-o` / `C-j` / `C-m` | open-line / newline                    |     ✓      |
| `C-x h`               | select all                             |            |
| `C-/` / `C-_`         | undo                                   |            |
| `C-;`                 | toggle line comment                    |            |
| `M-;`                 | comment-dwim                           |            |
| `C-M-\`               | indent-region / format document        |            |
| `M-l` / `M-u` / `M-c` | lowercase / uppercase / titlecase word |            |

</details>

<details>
<summary><strong>Mark and region</strong></summary>

| Key           | Command                            |
| ------------- | ---------------------------------- |
| `C-SPC`       | set-mark-command                   |
| `C-SPC C-SPC` | set mark, push to ring, deactivate |
| `C-u C-SPC`   | pop mark ring                      |
| `C-x C-x`     | exchange-point-and-mark            |

</details>

<details>
<summary><strong>Sexp / ParEdit</strong></summary>

| Key                  | Command                        | Prefix arg |
| -------------------- | ------------------------------ | :--------: |
| `C-M-f` / `C-M-b`    | forward-sexp / backward-sexp   |     ✓      |
| `C-M-u` / `C-M-d`    | backward-up-list / down-list   |            |
| `C-M-@`              | mark-sexp                      |     ✓      |
| `C-M-k` / `C-M-Bksp` | kill-sexp / backward-kill-sexp |     ✓      |
| `C-S-k`              | paredit-kill                   |     ✓      |

Powered by [paredit-ts](https://github.com/kshartman/paredit-ts).

</details>

<details>
<summary><strong>Registers and rectangles</strong></summary>

| Key             | Command                    |
| --------------- | -------------------------- |
| `C-x r s` _r_   | copy-to-register           |
| `C-x r i` _r_   | insert-register            |
| `C-x r SPC` _r_ | point-to-register          |
| `C-x r j` _r_   | jump-to-register           |
| `C-x r k`       | kill-rectangle             |
| `C-x r M-w`     | copy-rectangle-as-kill     |
| `C-x r d`       | delete-rectangle           |
| `C-x r y`       | yank-rectangle             |
| `C-x r o`       | open-rectangle             |
| `C-x r c`       | clear-rectangle            |
| `C-x r t`       | string-rectangle           |
| `C-x r r` _r_   | copy-rectangle-to-register |
| `C-x SPC`       | rectangle-mark-mode        |

</details>

<details>
<summary><strong>Files, buffers, and windows</strong></summary>

| Key                      | Command                       |
| ------------------------ | ----------------------------- |
| `C-x C-f`                | find-file (Quick Open)        |
| `C-x C-s`                | save-buffer                   |
| `C-x C-w`                | write-file (Save As)          |
| `C-x s`                  | save-some-buffers             |
| `C-x C-n`                | new window                    |
| `C-x b`                  | switch-to-buffer              |
| `C-x C-b`                | list-buffers (MRU)            |
| `C-x k`                  | kill-buffer                   |
| `C-x 0`                  | delete-window                 |
| `C-x 1`                  | delete-other-windows          |
| `C-x 2` / `C-x 3`        | split below / right           |
| `C-x 4`                  | toggle split layout           |
| `C-x o`                  | other-window                  |
| `C-x LEFT` / `C-x RIGHT` | previous-buffer / next-buffer |

</details>

<details>
<summary><strong>Dired (file browser)</strong></summary>

Open with `C-x d`.

| Key             | Command                      |
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

</details>

<details>
<summary><strong>Other</strong></summary>

| Key             | Command            |
| --------------- | ------------------ |
| `C-g` / `ESC`   | quit               |
| `M-x`           | command palette    |
| `C-M-SPC`       | toggle sidebar     |
| `C-x z`         | toggle Zen Mode    |
| `C-x C-c`       | close window       |
| `C-u`           | universal-argument |
| `M-<digit>`     | digit-argument     |
| `M--`           | negative-argument  |
| `M-.`           | find definitions   |
| `M-,`           | go back            |
| `C-M-,`         | go forward         |
| `M-?`           | find references    |
| `C-M-i` / `M-/` | trigger suggest    |

</details>

## Settings reference

Most `emacs-mcx.*` settings from [Awesome Emacs Keymap](https://github.com/whitphx/vscode-emacs-mcx#extension-settings) are supported. See the [upstream documentation](https://github.com/whitphx/vscode-emacs-mcx#extension-settings) for inherited configuration options, `when` clause contexts, and the prefix argument API.

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

## Install

- **VS Code Marketplace**: Search "Emacs Unified" in Extensions, or `code --install-extension kshartman.emacs-unified`
- **Open VSX**: [open-vsx.org/extension/kshartman/emacs-unified](https://open-vsx.org/extension/kshartman/emacs-unified)
- **GitHub Release** (VSIX): Download from [latest release](https://github.com/kshartman/vscode-emacs-unified/releases/latest) and `code --install-extension emacs-unified.vsix`

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup, build commands, and release workflow.
