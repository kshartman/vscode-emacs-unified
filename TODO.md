# TODO

## Bugs

- [x] ~~**ISSUE-1**: Paredit kill does not add killed text to the kill ring~~ — was working; test assertions were wrong
- [x] ~~**ISSUE-3**: Case conversion (`upcase-word` / `downcase-word`) fails when word has trailing whitespace before newline~~ — fixed in 1.3.0 (case ops cross trailing whitespace/newlines via `findNextWordEnd`)

## Feature Gaps

- [x] ~~**ISSUE-2**: `copy-to-register` joins multi-cursor selections into one string~~ — fixed in 1.3.0 (stores one text per selection, inserts per-cursor when counts match)
- [ ] **ISSUE-4**: Rectangle commands differ from Emacs on empty selections — deferred: only the fully-degenerate empty region (point==mark) no-ops; a zero-width multi-line region already works. Negligible edge case, "correct" behavior undecided.
- [x] ~~**ISSUE-5**: `C-u M-;` should kill the comment on the line (comment-kill)~~ — fixed in 1.3.0 (prefix arg runs comment-kill, saving the comment to the kill ring)

## Upstream Watch

Upstream reviewed 2026-06 (fork diverged 2026-03-12). Cherry-picked into 1.2.12:

- [x] **#2898** — fix flaky kill-yank / `newLine` prefix-arg tests (`newLine` `waitForDocumentToSettle` + kill-yank test resilience)

Cherry-picked into 1.3.0:

- [x] **#2819** yank-pop undo stability (`document.version` delta instead of a manual change counter)
- [x] **#2816** subword-mode underscore handling (`_` treated as a separator via `[\W_]`)

Merged upstream, **deferred** — keybinding `when`-clause changes that our automated suite can't verify behaviorally; need manual cross-platform testing (find/replace widgets, webviews, Windows, terminal) in a real VS Code:

- [ ] **#2869** clipboard shortcuts (C-w/M-w/C-y) in find/search widgets and webviews
- [ ] **#2871** exclude `inlineEditIsVisible` from `tabToTabStop` when clause

**Decided against** (don't revisit): **#2818** `cycle-spacing` and **#2804** `just-one-space` (both M-SPC) — we use `M-\` (delete-horizontal-space) for this, and `Alt+Space` is stolen by Windows.

Skip (N/A to this fork): vendored paredit.js relative-import fix (we use `paredit-ts`), upstream-only CI (Takumi Guard, Aikido, macOS pin). (TypeScript 6 was done independently — see Deferred dependency majors below.)

## Future

- [ ] Consider esbuild over webpack for faster builds
- [ ] Explore `noUnusedParameters` stricter TypeScript setting (`noImplicitReturns` already enabled)

### Deferred dependency majors

Routine dev-dep + GitHub Action bumps were applied; these majors needed a deliberate pass (Dependabot PRs were closed):

- [x] **TypeScript 6** — done with no deprecations. Root cause was TS 6 dropping automatic `@types` inclusion (every program — `tsc`, `ts-loader`, `typescript-estree` — now needs an explicit `types` field), not a module-resolution mechanics problem. Fix: removed the deprecated `moduleResolution: "node10"` (kept `module: "commonjs"` for CJS test/bundle output) and added `"types": ["node", "mocha", "webpack-env"]` to the main tsconfig; switched `keybinding-generator/tsconfig.json` off the deprecated `moduleResolution: "Node"` to `"Bundler"` with `"types": ["node", "vitest/globals"]`; and changed all `assert` imports to `node:assert` (the bare specifier resolved to the untyped `assert` polyfill under the projectService). No `ignoreDeprecations` shim. Verified: tsc 0, both webpack builds, eslint, prettier, vitest 36/36, integration 552/552.
- [ ] **cspell 10** — requires Node ≥ 22.18.0; the project pins `.nvmrc` `lts/*` and dev env is on 22.17.1, so `npm run cspell` won't even start. Bump the local/dev Node baseline first, then upgrade.
