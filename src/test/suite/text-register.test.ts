import * as vscode from "vscode";
import assert from "node:assert";
import { EmacsEmulator } from "../../emulator";
import {
  assertTextEqual,
  clearTextEditor,
  cleanUpWorkspace,
  assertCursorsEqual,
  setupWorkspace,
  setEmptyCursors,
  assertSelectionsEqual,
  createEmulator,
} from "./utils";

suite("Text registers", () => {
  const initialText = "0123456789\nabcdefghij\nABCDEFGHIJ";

  let activeTextEditor: vscode.TextEditor;
  let emulator: EmacsEmulator;

  setup(async () => {
    activeTextEditor = await setupWorkspace(initialText, { language: "javascript" });
    activeTextEditor.options.tabSize = 2;
    emulator = createEmulator(activeTextEditor);
  });

  teardown(cleanUpWorkspace);

  test("copy and paste", async () => {
    setEmptyCursors(activeTextEditor, [0, 2]);
    await emulator.setMarkCommand();
    await emulator.runCommand("nextLine");
    await emulator.runCommand("forwardChar");
    await emulator.runCommand("forwardChar");
    assertSelectionsEqual(activeTextEditor, [0, 2, 1, 4]);
    await emulator.runCommand("copyToRegister");
    await emulator.runCommand("registerNameCommand", "a");
    assertTextEqual(activeTextEditor, "0123456789\nabcdefghij\nABCDEFGHIJ");
    assertCursorsEqual(activeTextEditor, [1, 4]);
    assert.equal(emulator.isInMarkMode, false);

    // Empty string
    setEmptyCursors(activeTextEditor, [0, 2]);
    await emulator.setMarkCommand();
    await emulator.runCommand("copyToRegister");
    await emulator.runCommand("registerNameCommand", "b");
    assertTextEqual(activeTextEditor, "0123456789\nabcdefghij\nABCDEFGHIJ");
    assertCursorsEqual(activeTextEditor, [0, 2]);
    assert.equal(emulator.isInMarkMode, false);

    await clearTextEditor(activeTextEditor);

    await emulator.runCommand("insertRegister");
    await emulator.runCommand("registerNameCommand", "c");
    assertTextEqual(activeTextEditor, "");
    assertCursorsEqual(activeTextEditor, [0, 0]);

    await emulator.runCommand("insertRegister");
    await emulator.runCommand("registerNameCommand", "b");
    assertTextEqual(activeTextEditor, "");
    assertCursorsEqual(activeTextEditor, [0, 0]);

    await emulator.runCommand("insertRegister");
    await emulator.runCommand("registerNameCommand", "a");
    assertTextEqual(activeTextEditor, "23456789\nabcd");
    assertCursorsEqual(activeTextEditor, [1, 4]);
  });

  test("multi-cursor copy stores each selection separately and inserts per-cursor (ISSUE-2)", async () => {
    // Two cursors selecting different text: "012" on line 0, "abc" on line 1.
    activeTextEditor.selections = [new vscode.Selection(0, 0, 0, 3), new vscode.Selection(1, 0, 1, 3)];
    await emulator.runCommand("copyToRegister");
    await emulator.runCommand("registerNameCommand", "a");

    // Insert with the same number of cursors: each cursor receives its own text.
    await clearTextEditor(activeTextEditor);
    await activeTextEditor.edit((editBuilder) => editBuilder.insert(new vscode.Position(0, 0), "\n"));
    activeTextEditor.selections = [new vscode.Selection(0, 0, 0, 0), new vscode.Selection(1, 0, 1, 0)];
    await emulator.runCommand("insertRegister");
    await emulator.runCommand("registerNameCommand", "a");
    assertTextEqual(activeTextEditor, "012\nabc");

    // Insert with a single cursor: the combined text is inserted (fallback).
    await clearTextEditor(activeTextEditor);
    setEmptyCursors(activeTextEditor, [0, 0]);
    await emulator.runCommand("insertRegister");
    await emulator.runCommand("registerNameCommand", "a");
    assertTextEqual(activeTextEditor, "012abc");
  });

  test("copy with prefix argument that deletes region", async () => {
    setEmptyCursors(activeTextEditor, [0, 2]);
    await emulator.setMarkCommand();
    await emulator.runCommand("nextLine");
    await emulator.runCommand("forwardChar");
    await emulator.runCommand("forwardChar");
    assertSelectionsEqual(activeTextEditor, [0, 2, 1, 4]);
    await emulator.universalArgument(); // C-u
    await emulator.runCommand("copyToRegister");
    await emulator.runCommand("registerNameCommand", "a");
    assertTextEqual(activeTextEditor, "01efghij\nABCDEFGHIJ"); // cspell:disable-line
    assertCursorsEqual(activeTextEditor, [0, 2]);
    assert.equal(emulator.isInMarkMode, false);

    // Empty string
    setEmptyCursors(activeTextEditor, [0, 2]);
    await emulator.setMarkCommand();
    await emulator.universalArgument(); // C-u
    await emulator.runCommand("copyToRegister");
    await emulator.runCommand("registerNameCommand", "b");
    assertTextEqual(activeTextEditor, "01efghij\nABCDEFGHIJ"); // cspell:disable-line
    assertCursorsEqual(activeTextEditor, [0, 2]);
    assert.equal(emulator.isInMarkMode, false);

    // Insert
    setEmptyCursors(activeTextEditor, [0, 2]);
    await emulator.runCommand("insertRegister");
    await emulator.runCommand("registerNameCommand", "a");
    assertTextEqual(activeTextEditor, "0123456789\nabcdefghij\nABCDEFGHIJ");

    // Insert empty string
    setEmptyCursors(activeTextEditor, [0, 0]);
    await emulator.runCommand("insertRegister");
    await emulator.runCommand("registerNameCommand", "b");
    assertTextEqual(activeTextEditor, "0123456789\nabcdefghij\nABCDEFGHIJ");
  });

  test("copy and paste rectangle", async () => {
    setEmptyCursors(activeTextEditor, [0, 2]);
    await emulator.setMarkCommand();
    await emulator.runCommand("nextLine");
    await emulator.runCommand("forwardChar");
    await emulator.runCommand("forwardChar");
    assertSelectionsEqual(activeTextEditor, [0, 2, 1, 4]);
    await emulator.runCommand("copyRectangleToRegister");
    await emulator.runCommand("registerNameCommand", "a");
    assertTextEqual(activeTextEditor, "0123456789\nabcdefghij\nABCDEFGHIJ");
    assertCursorsEqual(activeTextEditor, [1, 4]);
    assert.equal(emulator.isInMarkMode, false);

    // Empty string
    setEmptyCursors(activeTextEditor, [0, 2]);
    await emulator.runCommand("copyRectangleToRegister");
    await emulator.runCommand("registerNameCommand", "b");
    assertTextEqual(activeTextEditor, "0123456789\nabcdefghij\nABCDEFGHIJ");
    assertCursorsEqual(activeTextEditor, [0, 2]);
    assert.equal(emulator.isInMarkMode, false);

    await clearTextEditor(activeTextEditor);

    await emulator.runCommand("insertRegister");
    await emulator.runCommand("registerNameCommand", "c");
    assertTextEqual(activeTextEditor, "");
    assertCursorsEqual(activeTextEditor, [0, 0]);

    await emulator.runCommand("insertRegister");
    await emulator.runCommand("registerNameCommand", "b");
    assertTextEqual(activeTextEditor, "");

    // Insert rectangle
    await emulator.runCommand("insertRegister");
    await emulator.runCommand("registerNameCommand", "a");
    assertTextEqual(activeTextEditor, "23\ncd");

    // Insert rectangle in an indented line
    setEmptyCursors(activeTextEditor, [1, 2]);
    await emulator.runCommand("insertRegister");
    await emulator.runCommand("registerNameCommand", "a");
    assertTextEqual(activeTextEditor, "23\ncd23\n  cd");
  });

  test("copy rectangle with prefix argument that deletes region", async () => {
    setEmptyCursors(activeTextEditor, [0, 2]);
    await emulator.setMarkCommand();
    await emulator.runCommand("nextLine");
    await emulator.runCommand("forwardChar");
    await emulator.runCommand("forwardChar");
    assertSelectionsEqual(activeTextEditor, [0, 2, 1, 4]);
    await emulator.universalArgument(); // C-u
    await emulator.runCommand("copyRectangleToRegister");
    await emulator.runCommand("registerNameCommand", "a");
    assertTextEqual(activeTextEditor, "01456789\nabefghij\nABCDEFGHIJ"); // cspell:disable-line
    assertCursorsEqual(activeTextEditor, [1, 2]); // Cursor is kept in the same line
    assert.equal(emulator.isInMarkMode, false);

    // Empty string
    setEmptyCursors(activeTextEditor, [0, 2]);
    await emulator.universalArgument(); // C-u
    await emulator.runCommand("copyRectangleToRegister");
    await emulator.runCommand("registerNameCommand", "b");
    assertTextEqual(activeTextEditor, "01456789\nabefghij\nABCDEFGHIJ"); // cspell:disable-line
    assertCursorsEqual(activeTextEditor, [0, 2]);
    assert.equal(emulator.isInMarkMode, false);

    await clearTextEditor(activeTextEditor);

    await emulator.runCommand("insertRegister");
    await emulator.runCommand("registerNameCommand", "c");
    assertTextEqual(activeTextEditor, "");
    assertCursorsEqual(activeTextEditor, [0, 0]);

    await emulator.runCommand("insertRegister");
    await emulator.runCommand("registerNameCommand", "b");
    assertTextEqual(activeTextEditor, "");

    // Insert rectangle
    await emulator.runCommand("insertRegister");
    await emulator.runCommand("registerNameCommand", "a");
    assertTextEqual(activeTextEditor, "23\ncd");

    // Insert rectangle in an indented line
    setEmptyCursors(activeTextEditor, [1, 2]);
    await emulator.runCommand("insertRegister");
    await emulator.runCommand("registerNameCommand", "a");
    assertTextEqual(activeTextEditor, "23\ncd23\n  cd");
  });
});
