import { defineConfig } from "@vscode/test-cli";

const baseMocha = {
  ui: "tdd",
  color: true,
  timeout: 10000,
};

// The suite is split so the everyday path can run fully headless on xvfb with
// zero flake and no on-screen windows:
//
//   - "core": every integration test EXCEPT the kill-ring/yank suites. These
//     don't touch the OS clipboard, so they're stable under a bare headless X
//     server (xvfb). The non-kill-yank directories are listed explicitly so
//     "core" and "clipboard" never overlap (glob has no negation).
//
//   - "clipboard": the kill-ring/yank tests, which drive VS Code's native
//     clipboard paste — an inherently async OS round-trip that races without a
//     clipboard manager. `retries: 2` re-runs only a test that actually fails
//     (a real regression still fails every attempt), absorbing the flake. Run
//     these against a real clipboard (WSLg :0 via scripts/run-integration-tests.sh)
//     or headless via xvfb where the retries do more of the work.
//
// `vscode-test` with no --label runs both (the full suite); the npm scripts
// select a label for the split.
export default defineConfig([
  {
    label: "core",
    files: [
      "out/test/suite/*.test.js",
      "out/test/suite/commands/*.test.js",
      "out/test/suite/commands/helpers/**/*.test.js",
      "out/test/suite/prefix-arguments/**/*.test.js",
    ],
    mocha: baseMocha,
  },
  {
    label: "clipboard",
    files: "out/test/suite/commands/kill-yank/**/*.test.js",
    mocha: { ...baseMocha, retries: 2 },
  },
]);
