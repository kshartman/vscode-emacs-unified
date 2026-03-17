# TODO

## Bugs

- [x] ~~**ISSUE-1**: Paredit kill does not add killed text to the kill ring~~ — was working; test assertions were wrong
- [ ] **ISSUE-3**: Case conversion (`upcase-word` / `downcase-word`) fails when word has trailing whitespace before newline

## Feature Gaps

- [ ] **ISSUE-2**: `copy-to-register` joins multi-cursor selections into one string instead of storing them separately (like kill-yank does)
- [ ] **ISSUE-4**: Rectangle commands differ from Emacs on empty selections
- [ ] **ISSUE-5**: `C-u M-;` should kill the comment on the line (comment-kill) — currently prefix argument is ignored

## Upstream Watch

- [ ] **Cherry-pick PR #2798**: `cycle-spacing` (M-SPC) — three-phase whitespace cycling (one-space → delete-all → restore). Draft by whitphx. Check status at session start: `gh pr view 2798 --repo whitphx/vscode-emacs-mcx`

## Future

- [ ] Consider esbuild over webpack for faster builds
- [ ] Explore `noUnusedParameters` stricter TypeScript setting (`noImplicitReturns` already enabled)
