# Emacs Unified

**Comprehensive Emacs emulation for Visual Studio Code**

A single extension that consolidates the best Emacs emulation for VS Code into one package — no need to install multiple extensions that overlap, conflict, or accumulate supply-chain risk.

## Compatibility Note

Emacs Unified retains the upstream `emacs-mcx` namespace ([Awesome Emacs Keymap](https://marketplace.visualstudio.com/items?itemName=tuttieee.emacs-mcx)) for all command IDs and configuration keys. This means your existing `emacs-mcx.*` settings carry over seamlessly, but **Emacs Unified and Awesome Emacs Keymap cannot be installed at the same time** — they will collide on command IDs and keybindings. Uninstall one before installing the other.

## Features

- Emacs-like cursor movements and editing commands
- Customizable meta key assignment (`alt`, `ESC`, `ctrl+[`, or `command` on macOS)
- Shift-selection with movement commands
- Search behavior like Emacs' isearch
- Multi-cursor support throughout
- Kill-ring integrated with the system clipboard
- Mark-ring
- Prefix argument (`C-u`)
- Rectangle commands and registers
- Sexp operations with ParEdit commands
- **Dired file browser** — browse and manage files without leaving VS Code
- Smart tab indentation — reindent for brace languages, indent cycling for Python/YAML
- Available both in Desktop and [Web](https://code.visualstudio.com/api/extension-guides/web-extensions)

## Attribution

This extension is built on the work of several authors:

- **[vscode-emacs-mcx](https://github.com/whitphx/vscode-emacs-mcx)** by Yuichiro Tsuchiya (whitphx) — the foundation providing 63+ commands, 1200+ keybindings, and the core architecture
- **[vscode-dired](https://github.com/shirou/vscode-dired)** by WAKAYAMA Shirou — the dired file browser
- **[vscode-emacs-friendly](https://github.com/SebastianZaha/vscode-emacs-friendly)** by Sebastian Zaha — keybinding design inspiration
- **[Emacs Keymap](https://github.com/hiro-sun/vscode-emacs)** by hiro-sun — the original VS Code Emacs extension

See [LICENSE](./LICENSE) for full license details.

## FAQ/Tips

### The cursor cannot be moved on the find widget as the widget closes with movement keys.

It's an intended design that simulates the original Emacs' behavior.
You can disable it with `emacs-mcx.cursorMoveOnFindWidget` option described below.

### i-search (`C-s`) is initialized with the currently selected string and the previous search is removed.

Setting `editor.find.seedSearchStringFromSelection` as `"never"` can change this behavior.
It makes the find widget work similarly to Emacs.

### I want to customize the META key (`ESC`, `ctrl+[`, `alt`, or Command key on macOS).

You can configure the key to be used as a META prefix with the following settings.

- `emacs-mcx.useMetaPrefixAlt` (`true` by default)
- `emacs-mcx.useMetaPrefixEscape`
- `emacs-mcx.useMetaPrefixCtrlLeftBracket`
- `emacs-mcx.useMetaPrefixMacCmd`

Read [the extension settings section](#extension-settings) below for more details.

### I want to use keyboard macro

Check out [Keyboard Macro Beta](https://marketplace.visualstudio.com/items?itemName=tshino.kb-macro) by [tshino](https://github.com/tshino).

## Extension Settings

This extension has custom settings with the prefix `emacs-mcx`.
(See [this page](https://code.visualstudio.com/docs/getstarted/settings#_settings-editor) to know how to change settings.)

### `emacs-mcx.moveBeginningOfLineBehavior`

Determines the behavior of the `move-beginning-of-line` command.
If set as `'vscode'`, it works as VS Code's native `Home` key behavior.
If set as `'emacs'`, it works as the original Emacs' `move-beginning-of-line`.

### `emacs-mcx.moveEndOfLineBehavior`

Determines the behavior of the `move-end-of-line` command.
If set as `'vscode'`, it works as VS Code's native `End` key behavior.
If set as `'emacs'`, it works as the original Emacs' `move-end-of-line`.

### `emacs-mcx.scrollUpCommandBehavior`

Determines the behavior of the `scroll-up-command` command.
If set as `'vscode'`, it works as VS Code's native `Page Down` key behavior.
If set as `'emacs'`, it works as the original Emacs' `scroll-up-command`.

### `emacs-mcx.scrollDownCommandBehavior`

Determines the behavior of the `scroll-down-command` command.
If set as `'vscode'`, it works as VS Code's native `Page Up` key behavior.
If set as `'emacs'`, it works as the original Emacs' `scroll-down-command`.

### `emacs-mcx.wordNavigationStyle`

Determines the behavior of word navigation and word killing commands such as `forward-word`, `backward-word`, `kill-word`, and `backward-kill-word`.
If set as `'vscode'` (default), they work as VS Code's native word navigation.
If set as `'emacs'`, they follow Emacs-like word boundary detection.

### `emacs-mcx.keepCursorInVisibleRange`

If set as true, the cursor is kept in the visible range when scrolling up or down like Emacs.

### `emacs-mcx.emacsLikeTab`

If set as true, `tab` key works as the Emacs' `tab-to-tab-stop` command.

For brace-delimited languages (C, JS, TS, etc.), tab delegates to VS Code's built-in reindent.
For offside-rule languages (Python, YAML, CoffeeScript, Haskell, Nim), tab cycles through valid indent levels — including one level deeper when the previous line opens a block.

### `emacs-mcx.tab.offsideRuleLanguages`

An array of language IDs that use indent-based scoping. Default: `["python", "yaml", "coffeescript", "haskell", "nim"]`. Only applies when `emacs-mcx.emacsLikeTab` is enabled.

### `emacs-mcx.useMetaPrefixEscape`

If set as true, Escape key works as the Meta prefix like original Emacs.
If set as false, Escape key works as cancel, the VS Code's native behavior.
For example, if set as true, `M-f` (forward-word) can be issued by both `alt+f` and `escape f`.

The only exception is the commands which begin with `M-g` (`M-g g`, `M-g n`, `M-g p`).
It is because VS Code can handle only up to two key strokes as the key bindings.
So, as the special case, `Escape g` works as follows.

| Command    | Desc                           |
| ---------- | ------------------------------ |
| `Escape g` | Jump to line (command palette) |

### `emacs-mcx.useMetaPrefixCtrlLeftBracket`

If set as true, `ctrl+[` works as the Meta prefix like original Emacs.

### `emacs-mcx.useMetaPrefixAlt`

If set as true, `alt` key (`option` key on macOS) works as the Meta prefix.

### `emacs-mcx.useMetaPrefixMacCmd`

If set as true, Command key works as the Meta prefix on macOS.
This option only works on macOS.

### `emacs-mcx.killRingMax`

Configures the maximum number of kill ring entries.
The default is 60.

### `emacs-mcx.killWholeLine`

This simulates the original Emacs' [`kill-whole-line` variable](https://www.gnu.org/software/emacs/manual/html_node/emacs/Killing-by-Lines.html).
The default is false.

### `emacs-mcx.cursorMoveOnFindWidget`

If set to true, cursor move commands of this extension such as `C-f` and `C-b` are disabled when the find widget is focused, to allow the widget to keep open and the cursor to move on it.

### `emacs-mcx.enableOverridingTypeCommand`

Prefix arguments do not work on character inputs with IMEs by default and you can set this config to `true` in order to enable it.
Note that this config makes use of VS Code API's `type` command under the hood and can cause problems in some cases.

- If you are using IME, text input may sometimes fail.
- If another extension that also uses the `type` command is installed, an error occurs (See https://github.com/Microsoft/vscode/issues/13441).

### `emacs-mcx.enableDigitArgument`

Indicates whether `M-<digit>` (the `emacs-mcx.digitArgument` command) is enabled.
Set `false` when `M-<digit>` conflicts with some other necessary commands.

### `emacs-mcx.shiftSelectMode`

Toggle Shift Selection (Emacs `shift-select-mode`). When `true`, holding Shift while running movement commands starts mark mode to extend the selection; the default is `false` to avoid `ctrl+shift+p` conflicts with the Command Palette on Windows/Linux.

### `emacs-mcx.lineMoveVisual`

When true, line-move moves point by visual lines (same as Emacs variable `line-move-visual`).

### `emacs-mcx.paredit.parentheses`

Key-value pairs of parentheses to be used in the ParEdit commands like the following example.

```json
{
  "[": "]",
  "(": ")",
  "{": "}"
}
```

The parentheses pairs are inherited from a default configuration and merged in order: Default > User-defined global config > User-defined per-language. Each finer-grained config can override individual pair definitions from its parent.
You can also override the default pairs or disable them by setting `null` as the value. For example:

```json
"emacs-mcx.paredit.parentheses": {
  "<": ">",  // New pair
  "{": null,  // Override to disable
}
```

### `emacs-mcx.subwordMode`

When true, word-oriented move and edit commands, including M-f, M-b, M-d will
recognize subwords (same as the Emacs variable `subword-mode`).
It can also be set as per-language flag, for example:

```json
"[go]": {
  "emacs-mcx.subwordMode": true
}
```

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

### `emacs-mcx.debug.*`

Configurations for debugging.

### Dired Settings

| Setting               | Type    | Default | Description                                    |
| --------------------- | ------- | ------- | ---------------------------------------------- |
| `dired.fixed_window`  | boolean | `false` | Reuse the same editor tab for dired navigation |
| `dired.ask_directory` | boolean | `true`  | Prompt for directory when opening dired        |

## 'when' Clause Context

This extension provides some contexts that you can refer to in `"when"` clauses of your `keybindings.json`.

### `emacs-mcx.inMarkMode`

_boolean_ — Indicates whether mark-mode is enabled.

### `emacs-mcx.acceptingArgument`

_boolean_ — Indicates the editor is accepting argument input following `C-u`.

### `emacs-mcx.prefixArgumentExists` (experimental)

_boolean_ — Indicates if a prefix argument exists.

### `emacs-mcx.prefixArgument` (experimental)

_number | undefined_ — The currently input prefix argument.

### `dired.open`

_boolean_ — Indicates whether a dired buffer is active. Use this to scope keybindings to dired buffers.

## Keybindings

Alt key is mapped to the Meta prefix (`M`) by default and you can configure for Escape, `ctrl+[`, or Command key (macOS only) to work as it with the settings above.

### Move Commands

| Command                                      | Prefix argument | Desc                                                                                                   |
| -------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------ |
| `C-f`                                        | ✓               | Move forward (forward-char)                                                                            |
| `C-b`                                        | ✓               | Move backward (backward-char)                                                                          |
| `C-n`                                        | ✓               | Move to the next line (next-line)                                                                      |
| `C-p`                                        | ✓               | Move to the previous line (previous-line)                                                              |
| `C-a`                                        | ✓               | Move to the beginning of line (move-beginning-of-line)                                                 |
| `C-e`                                        | ✓               | Move to the end of line (move-end-of-line)                                                             |
| `M-f`                                        | ✓               | Move forward by one word unit (forward-word)                                                           |
| `M-b`                                        | ✓               | Move backward by one word unit (backward-word)                                                         |
| `C-<right>`, `M-<right>`                     | ✓               | This command (right-word) behaves like `M-f`                                                           |
| `C-<left>`, `M-<left>`                       | ✓               | This command (left-word) behaves like `M-b`                                                            |
| `M-m`                                        |                 | Move (forward or back) to the first non-whitespace character on the current line (back-to-indentation) |
| `C-v`                                        | ✓               | Scroll down by one screen unit (scroll-up-command)                                                     |
| `M-v`                                        | ✓               | Scroll up by one screen unit (scroll-down-command)                                                     |
| `M-S-[` (`M-{` with US keyboard), `C-<up>`   | ✓               | Move back to previous paragraph beginning (backward-paragraph)                                         |
| `M-S-]` (`M-}` with US keyboard), `C-<down>` | ✓               | Move forward to next paragraph end (forward-paragraph)                                                 |
| `M-S-,` (`M-<` with US keyboard)             |                 | Move to the top of the buffer (beginning-of-buffer)                                                    |
| `M-S-.` (`M->` with US keyboard)             |                 | Move to the end of the buffer (end-of-buffer)                                                          |
| `M-g g` (`M-g M-g`)                          | ✓               | Read a number n and move point to the beginning of line number n (goto-line)                           |
| `M-g n` (`M-g M-n`, `` C-x ` ``)             |                 | Next error/match: jump to next diagnostic, or next search result if none (next-error)                  |
| `M-g p` (`M-g M-p`)                          |                 | Previous error/match: jump to previous diagnostic, or previous search result if none (previous-error)  |
| `C-l`                                        |                 | Center screen on current line (recenter-top-bottom)                                                    |

### Search Commands

| Command                              | Desc                                                                                                                  |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `C-s`                                | Incremental search forward (isearch-forward).                                                                         |
| `C-r`                                | Incremental search backward (isearch-backward).                                                                       |
| `C-M-s`                              | Begin incremental regexp search (isearch-forward-regexp).                                                             |
| `C-M-r`                              | Begin reverse incremental regexp search (isearch-backward-regexp).                                                    |
| `M-S-5` (`M-%` with US keyboard)     | Replace (query-replace)                                                                                               |
| `C-M-S-5` (`C-M-%` with US keyboard) | Replace with regexp (query-replace-regexp)                                                                            |
| `C-M-n`                              | Add selection to next find match                                                                                      |
| `C-M-p`                              | Add selection to previous find match                                                                                  |
| `M-s o`                              | Open [Quick Search](https://code.visualstudio.com/updates/v1_89#_quick-search), which is like Emacs' `occur` command. |
| `M-c`                                | Toggles the case sensitivity of the find widget.                                                                      |

### Edit Commands

| Command                                          | Prefix argument | Desc                                                                                                |
| ------------------------------------------------ | --------------- | --------------------------------------------------------------------------------------------------- |
| `C-d`                                            | ✓               | Delete right (DEL)                                                                                  |
| `C-h`                                            | ✓               | Delete left (BACKSPACE)                                                                             |
| `M-\`                                            | ✓               | Delete spaces and tabs around point (delete-horizontal-space)                                       |
| `C-x C-o`                                        |                 | Delete blank lines around (delete-blank-lines)                                                      |
| `C-t`                                            | ✓               | Transpose characters (transpose-chars)                                                              |
| `C-x C-t`                                        | ✓               | Transpose lines (transpose-lines)                                                                   |
| `M-S-6` (`M-^` with US keyboard)                 |                 | Join two lines cleanly (delete-indentation)                                                         |
| `M-d`                                            | ✓               | Kill the next word (kill-word)                                                                      |
| `M-Bksp`                                         | ✓               | Kill one word backwards (backward-kill-word)                                                        |
| `M-z`                                            | ✓               | Kill up to and including the given character (zap-to-char)                                          |
| `C-k`                                            | ✓               | Kill rest of line or one or more lines (kill-line)                                                  |
| `C-S-Bksp`                                       |                 | Kill an entire line at once (kill-whole-line)                                                       |
| `C-w`                                            |                 | Kill the region (kill-region)                                                                       |
| `M-w`                                            |                 | Copy the region into the kill ring (kill-ring-save)                                                 |
| `C-y`                                            | ✓               | Yank the last kill into the buffer (yank)                                                           |
| `M-y`                                            | ✓               | Replace just-yanked text with earlier kill (yank-pop)                                               |
| `C-c y`                                          |                 | Browse kill ring                                                                                    |
| `C-o`                                            |                 | Open line                                                                                           |
| `C-j`                                            | ✓               | New line                                                                                            |
| `C-m`                                            | ✓               | New line                                                                                            |
| `C-x h`                                          |                 | Select All                                                                                          |
| `C-x u`, `C-/`, `C-S--` (`C-_` with US keyboard) |                 | Undo                                                                                                |
| `C-;`                                            |                 | Toggle line comment                                                                                 |
| `M-;`                                            |                 | Comment-dwim: toggle region comment, insert/align end-of-line comment, or realign comment-only line |
| `C-M-\`                                          |                 | Format selection (indent-region), or format document if no selection                                |
| `C-x C-l` (`M-l`)                                |                 | Convert to lower case                                                                               |
| `C-x C-u` (`M-u`)                                |                 | Convert to upper case                                                                               |
| `M-c`                                            |                 | Convert to title case                                                                               |

### Mark Commands

| Command                                   | Desc                                                                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `C-SPC`, `C-S-2` (`C-@` with US keyboard) | Set the mark at point, and activate it (set-mark-command).                                                   |
| `C-SPC C-SPC`                             | Set the mark, pushing it onto the mark ring, without activating it.                                          |
| `C-u C-SPC`                               | Move point to where the mark was, and restore the mark from the ring of former marks.                        |
| `C-x C-x`                                 | Set the mark at point, and activate it; then move point where the mark used to be (exchange-point-and-mark). |

See [this page](https://www.gnu.org/software/emacs/manual/html_node/emacs/Setting-Mark.html) and [this page](https://www.gnu.org/software/emacs/manual/html_node/emacs/Mark-Ring.html) about the mark and the mark ring.

### Intellisense

| Command                        | Desc                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `C-M-i`, `M-TAB`, `M-/`, `C-'` | Trigger suggest. These keybindings call `editor.action.triggerSuggest`, alternating Emacs' `completion-at-point` or `dabbrev-expand` |

### Text Registers

| Command       | Desc                                              |
| ------------- | ------------------------------------------------- |
| `C-x r s `_r_ | Copy region into register _r_ (copy-to-register). |
| `C-x r i `_r_ | Insert text from register _r_ (insert-register).  |

See [this page](https://www.gnu.org/software/emacs/manual/html_node/emacs/Text-Registers.html) about the text registers.

### Position Registers

| Command         | Desc                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------ |
| `C-x r SPC `_r_ | Record the position of point and the current buffer in register _r_ (`point-to-register`). |
| `C-x r j `_r_   | Jump to the position and buffer saved in register _r_ (`jump-to-register`).                |

### Rectangles

| Command     | Desc                                                                                                      |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| `C-x r k`   | Kill the text of the region-rectangle, saving its contents as the last killed rectangle (kill-rectangle). |
| `C-x r M-w` | Save the text of the region-rectangle as the last killed rectangle (copy-rectangle-as-kill).              |
| `C-x r d`   | Delete the text of the region-rectangle (delete-rectangle).                                               |
| `C-x r y`   | Yank the last killed rectangle with its upper left corner at point (yank-rectangle).                      |
| `C-x r p`   | Replace last kill ring to each line of rectangle if the kill ring top only contains one line.             |
| `C-x r o`   | Insert blank space to fill the space of the region-rectangle (open-rectangle).                            |
| `C-x r c`   | Clear the region-rectangle by replacing all of its contents with spaces (clear-rectangle).                |
| `C-x r t`   | Replace rectangle contents with string on each line (string-rectangle).                                   |
| `C-x SPC`   | Toggle Rectangle Mark mode (rectangle-mark-mode).                                                         |

#### Rectangle Registers

| Command       | Desc                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `C-x r r `_r_ | Copy the region-rectangle into register _r_ (`copy-rectangle-to-register`). With prefix argument, delete it as well. |
| `C-x r i `_r_ | Insert the rectangle stored in register _r_ (if it contains a rectangle) (`insert-register`).                        |

### File Commands

| Command   | Desc                                                                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `C-x C-f` | QuickOpen a file (find-file). Uses VS Code's [quick file navigation](https://code.visualstudio.com/docs/editor/editingevolved#_quick-file-navigation) as the closest analog to Emacs' minibuffer find. |
| `C-x C-s` | Save (save-buffer)                                                                                                                                                                                     |
| `C-x C-w` | Save as (write-file)                                                                                                                                                                                   |
| `C-x s`   | Save all files (save-some-buffers)                                                                                                                                                                     |
| `C-x C-n` | Open new window                                                                                                                                                                                        |

### Tab / Buffer Commands

| Command     | Desc                                                       |
| ----------- | ---------------------------------------------------------- |
| `C-x b`     | Switch to another open buffer (switch-to-buffer)           |
| `C-x C-b`   | List all open buffers by most recently used (list-buffers) |
| `C-x k`     | Close current tab / buffer (kill-buffer)                   |
| `C-x 0`     | Close the current editor group (delete-window)             |
| `C-x 1`     | Close editors in other groups (delete-other-windows)       |
| `C-x 2`     | Split editor below (split-window-below)                    |
| `C-x 3`     | Split editor right (split-window-right)                    |
| `C-x 4`     | Toggle split layout (vertical to horizontal)               |
| `C-x o`     | Focus another editor group (other-window)                  |
| `C-x LEFT`  | Select the previous tab (previous-buffer)                  |
| `C-x RIGHT` | Select the next tab (next-buffer)                          |

### Dired (File Browser)

Open dired with `C-x d` (or run the command `extension.dired.open`). Dired shows a directory listing similar to Emacs dired mode.

| Command | Desc                          |
| ------- | ----------------------------- |
| `RET`   | Open file or enter directory  |
| `^`     | Go up to parent directory     |
| `.`     | Toggle display of dot files   |
| `g`     | Refresh the directory listing |
| `m`     | Mark/select the file at point |
| `u`     | Unmark the file at point      |
| `+`     | Create a new directory        |
| `C-x f` | Create a new file             |
| `R`     | Rename the file at point      |
| `C`     | Copy the file at point        |
| `D`     | Delete the file at point      |
| `q`     | Close the dired buffer        |

### Prefix Argument

See https://www.gnu.org/software/emacs/manual/html_node/emacs/Arguments.html for detail.

| Command      | Desc               |
| ------------ | ------------------ |
| `C-u`        | universal-argument |
| `M-<number>` | digit-argument     |
| `M--`        | negative-argument  |

### Sexp

| Command                              | Prefix argument | Desc                                                                                       |
| ------------------------------------ | --------------- | ------------------------------------------------------------------------------------------ |
| `C-M-f`                              | ✓               | Move forward over a balanced expression (forward-sexp)                                     |
| `C-M-b`                              | ✓               | Move backward over a balanced expression (backward-sexp)                                   |
| `C-M-S-2` (`C-M-@` with US keyboard) | ✓               | Set mark after end of following balanced expression (mark-sexp). This does not move point. |
| `C-M-k`                              | ✓               | Kill balanced expression forward (kill-sexp)                                               |
| `C-M-Bksp`                           | ✓               | Kill balanced expression backward (backward-kill-sexp)                                     |
| `C-S-k`                              | ✓               | Kill a line as if with `kill-line`, but respecting delimiters (paredit-kill)               |

Sexp operations are powered by [paredit-ts](https://github.com/kshartman/paredit-ts).

### Looking Up Identifiers

| Command                          | Desc                                                                              |
| -------------------------------- | --------------------------------------------------------------------------------- |
| `M-.`                            | Find definitions (xref-find-definitions). Bound to VS Code's "Go to Definition".  |
| `M-,`                            | Go back (xref-go-back). Bound to VS Code's "Go Back".                             |
| `C-M-,`                          | Go forward (xref-go-forward). Bound to VS Code's "Go Forward".                    |
| `M-S-/` (`M-?` with US keyboard) | Find references (xref-find-references). Bound to VS Code's "Find All References". |

### Other Commands

| Command       | Desc                        |
| ------------- | --------------------------- |
| `C-g` (`ESC`) | Quit                        |
| `ESC ESC ESC` | Quit (keyboard-escape-quit) |
| `M-x`         | Open command palette        |
| `C-M-SPC`     | Toggle SideBar visibility   |
| `C-x z`       | Toggle Zen Mode             |
| `C-x C-c`     | Close window                |

## Other Commands/APIs

### `emacs-mcx.executeCommandWithPrefixArgument`

This command calls another command with the prefix argument.
This is mainly for extension developers who want to make extensions collaborative with this extension's prefix argument.

For example, if you define the keybinding below,

- `C-x e` will call the command `foo` with the argument `{}`.
- `C-u C-x e` will call the command `foo` with the argument `{ prefixArgument: 4 }`.

```json
{
  "key": "ctrl+x e",
  "command": "emacs-mcx.executeCommandWithPrefixArgument",
  "args": {
    "command": "foo"
  }
}
```

You can pass arguments to the target command:

```json
{
  "key": "ctrl+x e",
  "command": "emacs-mcx.executeCommandWithPrefixArgument",
  "args": {
    "command": "foo",
    "args": {
      "baz": 42
    }
  }
}
```

You can change the key name of the prefix argument:

```json
{
  "key": "ctrl+x e",
  "command": "emacs-mcx.executeCommandWithPrefixArgument",
  "args": {
    "command": "foo",
    "prefixArgumentKey": "repeat"
  }
}
```

### Overriding the Prefix Argument

When you define a keybinding for `emacs-mcx.*` commands, you can override the prefix argument by specifying `prefixArgument` in the keybinding's arguments.

```json
{
  "key": "alt+shift+y",
  "command": "emacs-mcx.yankPop",
  "args": {
    "prefixArgument": -1
  }
}
```

## Conflicts with Default Key Bindings

- `ctrl+d`: editor.action.addSelectionToNextFindMatch — **Use `ctrl+alt+n` instead**
- `ctrl+g`: workbench.action.gotoLine — **Use `alt+g g` instead**
- `ctrl+b`: workbench.action.toggleSidebarVisibility — **Use `ctrl+alt+space` instead**
- `ctrl+j`: workbench.action.togglePanel — **Use `ctrl+x j` instead**
- `ctrl+space`: toggleSuggestionDetails — **Use `ctrl+'` instead**
- `ctrl+x`: editor.action.clipboardCutAction — **Use `ctrl+w` instead**
- `ctrl+v`: editor.action.clipboardPasteAction — **Use `ctrl+y` instead**
- `ctrl+k`: various editor actions
- `ctrl+k z`: workbench.action.toggleZenMode — **Use `ctrl+x z` instead**
- `ctrl+y`: redo
- `ctrl+m`: editor.action.toggleTabFocusMode
- `ctrl+/`: editor.action.commentLine — **Use `ctrl+;` instead**
- `ctrl+p` & `ctrl+e`: workbench.action.quickOpen — **Use `ctrl+x ctrl+f` instead**
- `ctrl+o`: workbench.action.files.openFileFolder

## Contributions/Development

Your contributions are very welcome!

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) about development of this extension.
