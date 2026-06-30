# Deferred keybinding ports — #2869 & #2871 (Windows handoff)

Self-contained work order for the two upstream keybinding fixes deferred from the
1.3.0 release. They were deferred because they change keybinding `when`-clause
**behavior**, which our automated suite cannot verify — only `gen-keys` generation,
the generator unit tests, and the package.json diff gate are automated. The actual
behavior (clipboard in find/replace widgets, webviews, terminal, the main editor's
kill-ring, Windows specifics) must be **manually verified in a real VS Code**, ideally
on Windows.

Reminder of this repo's keybinding workflow: **edit `keybindings/*.json`, then run
`npm run gen-keys`** to regenerate the `contributes.keybindings` block in `package.json`.
Never edit package.json keybindings by hand. See CONTRIBUTING.md.

## Prerequisites (on the Windows machine)

- [ ] `git pull` (or clone) — brings everything at/after v1.3.0.
- [ ] `npm install`
- [ ] (Optional, for reference diffs) add the upstream remote — it is **local config**, not part of a clone:
      `git remote add upstream-whitphx https://github.com/whitphx/vscode-emacs-mcx.git` then
      `git fetch upstream-whitphx`. Reference commits: **#2869 = `ed5936c`**, **#2871 = `615d7a6`**.
- [ ] Work on an `ai/keybinding-ports` (or feature) branch, not directly on `master`.

---

## #2871 — exclude `inlineEditIsVisible` from `tabToTabStop` (do this first; trivial)

**Why:** Tab is intercepted by Emacs-like tab handling even when VS Code's Next Edit
Suggestions (e.g. Copilot NES) shows an inline edit, blocking acceptance. Add
`!inlineEditIsVisible` so Tab falls through to the inline-edit accept action.

**Change — `keybindings/move-edit.json`**, the `emacs-mcx.tabToTabStop` binding
(`"keys": ["ctrl+i", "tab"]`). Our current `when` is identical to upstream's "before",
so just insert `&& !inlineEditIsVisible` right after `!inlineSuggestionVisible`:

```
"when": "config.emacs-mcx.emacsLikeTab && editorTextFocus && !editorReadonly && !inlineSuggestionVisible && !inlineEditIsVisible && !editorHoverFocused && !editorTabMovesFocus && !suggestWidgetVisible && !inSnippetMode && !editorTabCompletion && !editorParameterHintsVisible"
```

- [ ] Make the edit.
- [ ] `npm run gen-keys` — should change only the one `tabToTabStop` entry in package.json.
- [ ] `npm run check:eslint && npm run check:prettier && npm run test-gen-keys`
- [ ] Manual: with Copilot NES (or any inline-edit provider) showing an inline edit,
      `Tab` accepts it. With no inline edit, `Tab` still does Emacs `tabToTabStop`.
- [ ] Commit: `fix: exclude inlineEditIsVisible from tabToTabStop (#2871)`.

---

## #2869 — clipboard shortcuts (C-w / M-w / C-y) in find/search widgets & webviews

**Why:** After upstream `when`-clause rewrites (#2670, #2748), `C-w` (cut), `M-w` (copy),
and `C-y` (paste) stopped firing in the native find/replace/search input widgets, and in
webview-backed views (Markdown preview, Simple Browser, Release Notes). `textInputFocus`
is not reliably set in those surfaces.

**Our generator supports `inheritWhenFromDefault`** (used in several keybinding files
already), so this port is mechanically feasible.

### Change 1 — `keybindings/move-edit.json` (clipboard bindings)

Our current state has, in order:

1. the editor kill bindings — `ctrl+w` → `emacs-mcx.killRegion`, `meta+w` →
   `emacs-mcx.killRingSave`, `ctrl+y` → `emacs-mcx.yank` (these come **first**), then
2. a later block of three `editor.action.clipboard{Cut,Copy,Paste}Action` bindings, each
   gated on `textInputFocus && !editorTextFocus && !terminalFocus && !isComposing`.

Upstream #2869 **moves the three clipboard bindings to BEFORE the editor kill bindings**
and **broadens** them. Net result, in this order:

- [ ] Insert these three **before** the `emacs-mcx.killRegion` (`ctrl+w`) binding —
      i.e. right after the `killWholeLine` binding:

```jsonc
// Clipboard cut/copy/paste route to VS Code's built-in clipboard commands, which are
// overridden internally for webviews (Markdown preview, Simple Browser, Release Notes)
// to operate on the DOM selection. Placed BEFORE the editor-specific emacs-mcx bindings
// (killRegion / killRingSave / yank) so VS Code's resolver picks the later editor entries
// in the main editor, preserving kill-ring behavior. See upstream #2824 / #2869.
{
  "key": "ctrl+w",
  "command": "editor.action.clipboardCutAction",
  "when": "!terminalFocus"
},
{
  "key": "meta+w",
  "command": "editor.action.clipboardCopyAction",
  "inheritWhenFromDefault": true
},
{
  "key": "ctrl+y",
  "command": "editor.action.clipboardPasteAction",
  "when": "(findInputFocussed || replaceInputFocussed || inputBoxFocus || patternExcludesInputBoxFocus || patternIncludesInputBoxFocus || searchInputBoxFocus || replaceInputBoxFocus || (textInputFocus && !editorTextFocus && !terminalFocus)) && !isComposing"
},
```

- [ ] **Delete the old later block** of three clipboard bindings (the ones gated on
      `textInputFocus && !editorTextFocus && !terminalFocus && !isComposing`), including
      their explanatory `#2748` comment.

### Change 2 — `keybindings/find.json` (Windows unbind list)

Our `find.json` has a combined `"keys"` array applied to two `"whens"`
(`isWindows && config.emacs-mcx.cursorMoveOnFindWidget && findInputFocussed && !isComposing`
and `isWindows && replaceInputFocussed && !isComposing`). That array currently unbinds
`ctrl+w` and `alt+w` (among others) in the find/replace widget on Windows, which blocks
the clipboard bindings above.

- [ ] Remove `"ctrl+w"` and `"alt+w"` from that `"keys"` array (keep `"alt+y"` and the
      rest). Add a short comment noting they're intentionally left bound so cut/copy work
      in the find/replace widget (ref upstream #2824).

> Note: our `find.json` uses the combined keys/whens structure, which differs from
> upstream's flat per-key list — adapt, don't copy upstream's hunk verbatim.

### Verify #2869

- [ ] `npm run gen-keys`, then `git diff package.json` — confirm only the intended
      keybinding entries changed.
- [ ] `npm run check:eslint && npm run check:prettier && npm run test-gen-keys`
- [ ] `npm run check keybinding diff` equivalent: re-run `gen-keys`, ensure no further diff.
- [ ] **Manual behavior matrix (the part automation can't do):**
  - [ ] Main editor: `C-w` kills region, `M-w` copies region, `C-y` yanks — kill-ring
        behavior unchanged (the editor bindings must still win).
  - [ ] Find widget (`C-s`/find): `C-w` cut, `M-w` copy, `C-y` paste work in the input.
  - [ ] Replace widget: same.
  - [ ] Search view input boxes: same.
  - [ ] Webviews (Markdown preview, Simple Browser, Release Notes): `C-w`/`M-w` operate on
        the DOM selection (note: `C-y` paste is **not** covered for webviews — expected).
  - [ ] Terminal: `C-w` is NOT hijacked (Emacs/shell `C-w` still works) — `!terminalFocus`.
  - [ ] **Windows specifically:** cut/copy now work in the find/replace widget.
  - [ ] (If available) Cursor Agent chat: native `cmd/ctrl+x` Cut still works (the #2748
        regression must not return).
- [ ] Commit: `fix: restore clipboard shortcuts in find/search widgets and webviews (#2869)`.

---

## After both land

- [ ] Update `TODO.md` (Upstream Watch): check off #2869 and #2871.
- [ ] Add a `CHANGELOG.md` entry and cut the next release (patch bump, e.g. 1.3.1) per the
      Release section in CONTRIBUTING.md.
- [ ] Delete this handoff doc (or mark it done).
