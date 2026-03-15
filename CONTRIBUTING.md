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
npm test              # VS Code integration tests
npm run test-gen-keys # keybinding generator unit tests (vitest)
npm run test:web      # web extension tests
```

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
