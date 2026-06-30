import assert from "node:assert";
import { TextEditor } from "vscode";
import { EmacsEmulator } from "../../../emulator";
import { KillRing } from "../../../kill-yank/kill-ring";
import { assertTextEqual, cleanUpWorkspace, setEmptyCursors, setupWorkspace, createEmulator } from "../utils";

suite("commentDwim with prefix argument (comment-kill, ISSUE-5)", () => {
  let activeTextEditor: TextEditor;
  let killRing: KillRing;
  let emulator: EmacsEmulator;

  teardown(cleanUpWorkspace);

  test("C-u M-; kills the comment on the line and saves it to the kill ring", async () => {
    activeTextEditor = await setupWorkspace("const x = 1; // comment", { language: "javascript" });
    killRing = new KillRing();
    emulator = createEmulator(activeTextEditor, killRing);

    setEmptyCursors(activeTextEditor, [0, 0]);
    await emulator.universalArgument(); // C-u
    await emulator.runCommand("commentDwim"); // M-;

    // Comment (and the whitespace before it) is removed, code is preserved.
    assertTextEqual(activeTextEditor, "const x = 1;");
    // The killed comment is on the kill ring.
    assert.strictEqual(killRing.getTop()?.asString(), " // comment");
  });

  test("C-u M-; on a comment-only line kills the comment, keeping indentation", async () => {
    activeTextEditor = await setupWorkspace("  // lonely", { language: "javascript" });
    killRing = new KillRing();
    emulator = createEmulator(activeTextEditor, killRing);

    setEmptyCursors(activeTextEditor, [0, 0]);
    await emulator.universalArgument();
    await emulator.runCommand("commentDwim");

    assertTextEqual(activeTextEditor, "  ");
    assert.strictEqual(killRing.getTop()?.asString(), "// lonely");
  });

  test("C-u M-; on a line with no comment is a no-op", async () => {
    activeTextEditor = await setupWorkspace("const x = 1;", { language: "javascript" });
    killRing = new KillRing();
    emulator = createEmulator(activeTextEditor, killRing);

    setEmptyCursors(activeTextEditor, [0, 0]);
    await emulator.universalArgument();
    await emulator.runCommand("commentDwim");

    assertTextEqual(activeTextEditor, "const x = 1;");
    assert.strictEqual(killRing.getTop(), undefined);
  });
});
