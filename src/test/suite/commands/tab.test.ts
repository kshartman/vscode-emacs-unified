import * as vscode from "vscode";
import { EmacsEmulator } from "../../../emulator";
import {
  assertTextEqual,
  cleanUpWorkspace,
  setEmptyCursors,
  assertCursorsEqual,
  setupWorkspace,
  createEmulator,
} from "../utils";

suite("TabToTabStop with a free-form language", () => {
  const language = "javascript";
  const tabSize = 2;

  let activeTextEditor: vscode.TextEditor;
  let emulator: EmacsEmulator;

  suite("new indent", () => {
    const initialText = `function() {
console.log("hello");
}`;
    setup(async () => {
      activeTextEditor = await setupWorkspace(initialText, { language });
      activeTextEditor.options.tabSize = tabSize;
      emulator = createEmulator(activeTextEditor);
    });

    teardown(cleanUpWorkspace);

    test("reindent works when the cursor is at the line where it should", async () => {
      setEmptyCursors(activeTextEditor, [1, 0]);
      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `function() {
  console.log("hello");
}`,
      );
      assertCursorsEqual(activeTextEditor, [1, 2]);
    });

    test("reindent doesn't work when the cursor is at the line where it shouldn't", async () => {
      setEmptyCursors(activeTextEditor, [0, 0]);
      await emulator.runCommand("tabToTabStop");
      assertTextEqual(activeTextEditor, initialText);
      assertCursorsEqual(activeTextEditor, [0, 0]);
    });
  });

  suite("reindent existing lines", () => {
    const initialText = `function() {
      console.log("hello");
}`;

    setup(async () => {
      activeTextEditor = await setupWorkspace(initialText, { language });
      activeTextEditor.options.tabSize = tabSize;
      emulator = createEmulator(activeTextEditor);
    });

    teardown(cleanUpWorkspace);

    test("reindent works and the cursor is moved to the indent head when the cursor was at the beginning fo the line", async () => {
      setEmptyCursors(activeTextEditor, [1, 0]);
      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `function() {
  console.log("hello");
}`,
      );
      assertCursorsEqual(activeTextEditor, [1, 2]);
    });

    test("reindent works and the cursor is not moved when the cursor was after the indent head", async () => {
      setEmptyCursors(activeTextEditor, [1, 8]);
      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `function() {
  console.log("hello");
}`,
      );
      assertCursorsEqual(activeTextEditor, [1, 4]);
    });
  });

  suite("reindent already correctly indent lines", () => {
    const initialText = `function() {
  console.log("hello");
}`;

    setup(async () => {
      activeTextEditor = await setupWorkspace(initialText, { language });
      activeTextEditor.options.tabSize = tabSize;
      emulator = createEmulator(activeTextEditor);
    });

    teardown(cleanUpWorkspace);

    test("reindent does nothing and the cursor is moved to the indent head when the cursor was at the beginning fo the line", async () => {
      setEmptyCursors(activeTextEditor, [1, 0]);
      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `function() {
  console.log("hello");
}`,
      );
      assertCursorsEqual(activeTextEditor, [1, 2]);
    });

    test("reindent does nothing and the cursor is not moved when the cursor was after the indent head", async () => {
      setEmptyCursors(activeTextEditor, [1, 4]);
      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `function() {
  console.log("hello");
}`,
      );
      assertCursorsEqual(activeTextEditor, [1, 4]);
    });
  });

  suite("multi line", () => {
    const initialText = `function() {
console.log("hello");
console.log("hello");
console.log("hello");
}`;

    setup(async () => {
      activeTextEditor = await setupWorkspace(initialText, { language });
      activeTextEditor.options.tabSize = tabSize;
      emulator = createEmulator(activeTextEditor);
    });

    teardown(cleanUpWorkspace);

    test("reindent works on the selected lines", async () => {
      activeTextEditor.selections = [new vscode.Selection(1, 0, 2, 1)];
      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `function() {
  console.log("hello");
  console.log("hello");
console.log("hello");
}`,
      );
      assertCursorsEqual(activeTextEditor, [2, 3]);
    });

    test("reindent works with multi cursors", async () => {
      setEmptyCursors(activeTextEditor, [1, 0], [2, 0]);
      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `function() {
  console.log("hello");
  console.log("hello");
console.log("hello");
}`,
      );
      assertCursorsEqual(activeTextEditor, [1, 2], [2, 2]);
    });
  });
});

suite("TabToTabStop with a offside-rule language", () => {
  const language = "python";
  const tabSize = 4;

  let activeTextEditor: vscode.TextEditor;
  let emulator: EmacsEmulator;

  suite("new indent", () => {
    const initialText = `def f():
print("hello")`;
    setup(async () => {
      activeTextEditor = await setupWorkspace(initialText, { language });
      activeTextEditor.options.tabSize = tabSize;
      emulator = createEmulator(activeTextEditor);
    });

    teardown(cleanUpWorkspace);

    test("reindent works when the cursor is at the line where it should, then it repeats possible indentations", async () => {
      setEmptyCursors(activeTextEditor, [1, 0]);
      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `def f():
    print("hello")`,
      );
      assertCursorsEqual(activeTextEditor, [1, 4]);

      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `def f():
print("hello")`,
      );
      assertCursorsEqual(activeTextEditor, [1, 0]);

      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `def f():
    print("hello")`,
      );
      assertCursorsEqual(activeTextEditor, [1, 4]);
    });

    test("reindent doesn't work when the cursor is at the line where it shouldn't, and it's the same when repeated", async () => {
      setEmptyCursors(activeTextEditor, [0, 0]);
      await emulator.runCommand("tabToTabStop");
      assertTextEqual(activeTextEditor, initialText);
      assertCursorsEqual(activeTextEditor, [0, 0]);

      setEmptyCursors(activeTextEditor, [0, 0]);
      await emulator.runCommand("tabToTabStop");
      assertTextEqual(activeTextEditor, initialText);
      assertCursorsEqual(activeTextEditor, [0, 0]);
    });
  });

  suite("reindent existing lines", () => {
    const initialText = `def f():
        print("hello")`;

    setup(async () => {
      activeTextEditor = await setupWorkspace(initialText, { language });
      activeTextEditor.options.tabSize = tabSize;
      emulator = createEmulator(activeTextEditor);
    });

    teardown(cleanUpWorkspace);

    test("reindent works and the cursor is moved to the indent head when the cursor was at the beginning fo the line, then it repeats possible indentations", async () => {
      setEmptyCursors(activeTextEditor, [1, 0]);
      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `def f():
    print("hello")`,
      );
      assertCursorsEqual(activeTextEditor, [1, 4]);

      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `def f():
print("hello")`,
      );
      assertCursorsEqual(activeTextEditor, [1, 0]);

      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `def f():
    print("hello")`,
      );
      assertCursorsEqual(activeTextEditor, [1, 4]);
    });

    test("reindent works and the cursor is not moved when the cursor was after the indent head, then it repeats possible indentations", async () => {
      setEmptyCursors(activeTextEditor, [1, 12]);
      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `def f():
    print("hello")`,
      );
      assertCursorsEqual(activeTextEditor, [1, 8]);

      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `def f():
print("hello")`,
      );
      assertCursorsEqual(activeTextEditor, [1, 4]);

      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `def f():
    print("hello")`,
      );
      assertCursorsEqual(activeTextEditor, [1, 8]);
    });
  });

  suite("nested blocks - no over-indent after non-block-opener", () => {
    const initialText = `def f():
    if True:
        pass
x`;

    setup(async () => {
      activeTextEditor = await setupWorkspace(initialText, { language });
      activeTextEditor.options.tabSize = tabSize;
      emulator = createEmulator(activeTextEditor);
    });

    teardown(cleanUpWorkspace);

    test("after 'pass' (no colon), max indent matches pass's level, not one deeper", async () => {
      // Previous non-empty line is "        pass" (indent=8, no colon).
      // Max indent should be level 2 (8 chars), not level 3 (12 chars).
      setEmptyCursors(activeTextEditor, [3, 0]);

      // First press: indent to max (level 2 = 8 chars)
      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `def f():
    if True:
        pass
        x`,
      );
      assertCursorsEqual(activeTextEditor, [3, 8]);

      // Second press: level 1 = 4 chars
      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `def f():
    if True:
        pass
    x`,
      );
      assertCursorsEqual(activeTextEditor, [3, 4]);

      // Third press: level 0 = 0 chars
      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `def f():
    if True:
        pass
x`,
      );
      assertCursorsEqual(activeTextEditor, [3, 0]);

      // Fourth press: cycle back to max (level 2 = 8 chars)
      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `def f():
    if True:
        pass
        x`,
      );
      assertCursorsEqual(activeTextEditor, [3, 8]);
    });

    test("after block opener (colon), max indent is one deeper", async () => {
      // Previous non-empty line is "    if True:" (indent=4, has colon).
      // Max indent should be level 2 (8 chars).
      setEmptyCursors(activeTextEditor, [2, 0]);

      await emulator.runCommand("tabToTabStop");
      assertTextEqual(
        activeTextEditor,
        `def f():
    if True:
        pass
x`,
      );
      assertCursorsEqual(activeTextEditor, [2, 8]);
    });
  });
});
