# Development of Emacs Unified

## Setup

Install dependencies.

```shell
npm install
```

Open this repository in VS Code.

```shell
code .
```

Go to the "Run and Debug" side panel:

- Run "Launch Extension" to test in VS Code
- Run "Extension Tests" for integration tests
- "Run Web Extension in VS Code" for web extension development

## Build

```shell
npm run webpack:dev    # development build
npm run webpack:prod   # production build
```

## Lint and format

```shell
npm run check:eslint    # check lint errors
npm run check:prettier  # check formatting
npm run fix:eslint      # auto-fix lint errors
npm run fix:prettier    # auto-fix formatting
```

Both run automatically via pre-commit hooks (husky + lint-staged).

## Tests

```shell
npm run test-gen-keys  # unit tests (vitest): keybinding generator + pure logic, no VS Code
npm run test:headless  # unit tests + non-clipboard integration tests, fully headless (xvfb)
npm test               # full VS Code integration suite (core + clipboard labels)
npm run test:core      # integration tests except the kill-ring/yank clipboard suites (headless)
npm run test:clipboard # only the kill-ring/yank clipboard suites (see note)
npm run test:web       # web extension tests
```

The integration suite runs a real VS Code instance, so it needs a display. The
kill-ring/yank tests additionally exercise VS Code's **native clipboard paste** —
an async OS-clipboard round-trip that flakes without a real, stable clipboard.
The suite is split (`core` / `clipboard` labels in `.vscode-test.mjs`) so the
everyday path is fully headless and reliable:

- **`test:core`** runs everything except the clipboard tests. It's stable under a
  bare headless X server (`xvfb`), so **`test:headless` (unit + core) is the
  windowless, always-green everyday command.**
- **`test:clipboard`** runs the clipboard tests via
  `scripts/run-integration-tests.sh`, which uses the WSLg display (`:0`) so they
  hit the real Windows clipboard. They use mocha `retries: 2` to absorb residual
  flake. Because they share the real clipboard and window focus, **leave the
  mouse and keyboard alone while they run** (and VS Code windows will be visible).
  Requires WSLg (recent WSL2 / Windows 11). On a native desktop OS the real
  clipboard means `npm test` works directly with no special handling.

## Keybinding generation

Keybindings are defined in `keybindings/*.json`, **not** directly in `package.json`.

To regenerate after editing:

```shell
npm run gen-keys
```

Commit both the `keybindings/*.json` changes and the auto-updated `package.json`.

CI checks for keybinding drift — if you forget to run gen-keys, the lint-and-build workflow will fail.

### Extended keybinding syntax

**`keys`, `whens`** — define multiple key combinations and/or when conditions for one command:

```json
{
  "keys": ["right", "ctrl+f"],
  "command": "emacs-mcx.forwardChar",
  "whens": ["editorTextFocus", "terminalFocus"]
}
```

**`meta` key** — `"meta"` in key fields expands to multiple keybindings (`alt`, `cmd`, `ctrl+[`, `escape`), each gated by the corresponding `config.emacs-mcx.useMetaPrefix*` setting.

**`inheritWhenFromDefault`** — copies the `when` condition from VS Code's default keybinding for the same command.

**Comments** — JSON comments are supported in keybinding files.

## How to add a new command

1. Create a command class extending `EmacsCommand` in `src/commands/*.ts`
2. Register it in the `commands` array in `EmacsEmulator` constructor (`src/emulator.ts`)
3. Add `bindEmulatorCommand("commandId")` in `src/extension.ts`
4. Add keybinding in `keybindings/*.json`
5. Run `npm run gen-keys`
6. Add tests

## Behavior alignment policy

When implementing an Emacs command where VS Code has equivalent behavior, prefer matching VS Code's defaults so the extension feels native. Offer an Emacs-like variant behind a configuration option; default the option to VS Code behavior.

Examples:

- Char motion: default to VS Code selection collapse, opt-in Emacs-like pre-clear (`emacs-mcx.clearSelectionBeforeCharMove`)
- Word navigation: default to VS Code word boundaries (`emacs-mcx.wordNavigationStyle = "vscode"`)
- Line movement: default to VS Code behavior (`emacs-mcx.moveBeginningOfLineBehavior = "vscode"`)

## Release

Releases are automated via GitHub Actions. The workflow:

1. Bump `version` in `package.json`
2. Update `CHANGELOG.md`
3. Run `npm run gen-keys` and commit everything
4. Push to master
5. Create a GitHub release:

```shell
gh release create v1.x.x --title "v1.x.x" --notes "what changed"
```

The `publish.yml` workflow automatically builds and publishes to the VS Code Marketplace.

CI (`lint-and-build`) must pass before the publish workflow runs. Master branch is protected — force pushes are blocked.
