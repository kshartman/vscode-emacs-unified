# Known Issues

Tracked issues in the codebase are marked with `// ISSUE-<number>` comments.

## ISSUE-1: Paredit kill does not integrate with kill ring

Killed text from `paredit-kill` is not added to the kill ring, so it cannot be yanked back with `C-y`. The kill itself works correctly — the text is deleted respecting sexp boundaries — but the kill ring integration is missing.

**Files:** `src/test/suite/commands/paredit.test.ts`

## ISSUE-2: Register copy-to-register does not handle multi-cursor

When multiple cursors are active, `copy-to-register` (`C-x r s`) joins all selections into a single string rather than storing them as separate regions (the way kill-yank commands do). Inserting from the register then pastes the concatenated text at all cursor positions.

**Files:** `src/commands/registers.ts`

## ISSUE-3: Case conversion fails with trailing whitespace

`upcase-word` / `downcase-word` produce incorrect results when the word is followed by trailing whitespace before a newline (e.g., `"aaa \nbbb"`). The test cases for this edge case are currently disabled.

**Files:** `src/test/suite/commands/case.test.ts`

## ISSUE-4: Rectangle commands differ from Emacs on empty selections

Rectangle kill (`C-x r k`) and rectangle delete (`C-x r d`) behave differently from GNU Emacs when the selections are empty. The current behavior is functional but not Emacs-faithful.

**Files:** `src/test/suite/commands/rectangle.test.ts`
