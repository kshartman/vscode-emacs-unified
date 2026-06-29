// Refresh the vendored snapshot of VS Code's default keybindings.
//
// `gen-keys` reads these committed files (see ./default-keybindings/) instead of
// fetching live, so its output is deterministic and the release "Check
// keybinding diff" gate never breaks by surprise. Run this deliberately to pull
// newer defaults (e.g. when bumping the `engines.vscode` floor): it updates the
// snapshot, after which you run `npm run gen-keys`, review the package.json
// diff, run the tests, and commit. New VS Code Escape actions only gain `C-g`
// coverage once the snapshot is refreshed this way.
//
//   npm run refresh-vsc-defaults
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const PLATFORMS = ["linux", "windows", "macos"] as const;
const BASE = "https://raw.githubusercontent.com/codebling/vs-code-default-keybindings/refs/heads/master";
const outDir = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "default-keybindings");

fs.mkdirSync(outDir, { recursive: true });

for (const platform of PLATFORMS) {
  const src = `${BASE}/${platform}.keybindings.json`;
  console.log(`Fetching ${src} ...`);
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${src}: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  // Validate it parses (the file is JSON-with-comments).
  const stripJsonComments = (await import("strip-json-comments")).default;
  const parsed: unknown = JSON.parse(stripJsonComments(text));
  if (!Array.isArray(parsed)) {
    throw new Error(`Unexpected content from ${src}: not an array`);
  }
  const outPath = path.join(outDir, `${platform}.keybindings.json`);
  fs.writeFileSync(outPath, text);
  console.log(`  wrote ${outPath} (${parsed.length} bindings)`);
}

console.log("Done. Now run 'npm run gen-keys', review the package.json diff, run tests, and commit.");
