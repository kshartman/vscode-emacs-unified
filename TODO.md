# TODO

## Bugs

- [x] ~~**ISSUE-1**: Paredit kill does not add killed text to the kill ring~~ — was working; test assertions were wrong
- [ ] **ISSUE-3**: Case conversion (`upcase-word` / `downcase-word`) fails when word has trailing whitespace before newline

## Feature Gaps

- [ ] **ISSUE-2**: `copy-to-register` joins multi-cursor selections into one string instead of storing them separately (like kill-yank does)
- [ ] **ISSUE-4**: Rectangle commands differ from Emacs on empty selections
- [ ] **ISSUE-5**: `C-u M-;` should kill the comment on the line (comment-kill) — currently prefix argument is ignored

## Upstream Watch

Upstream reviewed 2026-06 (fork diverged 2026-03-12). Cherry-picked into 1.2.12:

- [x] **#2898** — fix flaky kill-yank / `newLine` prefix-arg tests (`newLine` `waitForDocumentToSettle` + kill-yank test resilience)

Merged upstream, worth incorporating but **deferred** (own effort; keybinding parts need the `gen-keys` workflow, not a raw cherry-pick):

- [ ] **#2816** subword-mode underscore handling, **#2819** yank-pop undo stability (`document.version`), **#2869** clipboard shortcuts in find/search widgets, **#2871** exclude `inlineEditIsVisible` from `tabToTabStop` — bug fixes.

**Decided against** (don't revisit): **#2818** `cycle-spacing` and **#2804** `just-one-space` (both M-SPC) — we use `M-\` (delete-horizontal-space) for this, and `Alt+Space` is stolen by Windows.

Skip (N/A to this fork): TypeScript 6 bump, vendored paredit.js relative-import fix (we use `paredit-ts`), upstream-only CI (Takumi Guard, Aikido, macOS pin).

## Future

- [ ] Consider esbuild over webpack for faster builds
- [ ] Explore `noUnusedParameters` stricter TypeScript setting (`noImplicitReturns` already enabled)

### Deferred dependency majors

Routine dev-dep + GitHub Action bumps were applied; these two majors need a deliberate pass (Dependabot PRs were closed):

- [ ] **TypeScript 6** — surfaces "cannot find name `suite`/`test`/`mocha`/`__WebpackModuleApi`" in the test files: TS 6 changed ambient `@types` auto-discovery. Needs a tsconfig `types` migration (upstream did this in their "Dev/typescript 6" commit). Don't bump without fixing tsconfig + re-verifying the full build/tests.
- [ ] **cspell 10** — requires Node ≥ 22.18.0; the project pins `.nvmrc` `lts/*` and dev env is on 22.17.1, so `npm run cspell` won't even start. Bump the local/dev Node baseline first, then upgrade.
