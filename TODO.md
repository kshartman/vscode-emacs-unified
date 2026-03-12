# TODO

## Bugs

- [ ] **ISSUE-1**: Paredit kill does not add killed text to the kill ring — `C-y` after `paredit-kill` should yank it back
- [ ] **ISSUE-3**: Case conversion (`upcase-word` / `downcase-word`) fails when word has trailing whitespace before newline

## Feature Gaps

- [ ] **ISSUE-2**: `copy-to-register` joins multi-cursor selections into one string instead of storing them separately (like kill-yank does)

## Packaging

- [ ] Write CHANGELOG for 1.0.0
- [ ] Set up VS Marketplace publisher account
- [ ] Build and publish with `vsce`
- [ ] Comprehensive README review — screenshots, marketplace description

## Future

- [ ] Consider esbuild over webpack for faster builds
- [ ] Explore `noImplicitReturns` and `noUnusedParameters` stricter TypeScript settings
