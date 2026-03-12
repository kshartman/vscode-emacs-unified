import * as vscode from "vscode";
import { Selection, TextEditor } from "vscode";
import { EmacsCommand } from ".";
import { makeParallel } from "./helpers/parallel";

// Languages where indentation is syntactically significant and multiple indent
// levels can be valid.  Emacs cycles through possible levels on repeated Tab.
const DEFAULT_OFFSIDE_RULE_LANGUAGE_IDS = ["python", "yaml", "coffeescript", "haskell", "nim"];

// Per-language patterns that indicate the previous line opens a new block,
// meaning one additional indent level is valid.
const BLOCK_OPENER_PATTERNS: Record<string, RegExp> = {
  python: /:\s*(#.*)?$/,
  yaml: /:\s*(#.*)?$/,
  coffeescript: /(->|=>)\s*(#.*)?$/,
  haskell: /(where|do|of|let|in)\s*(--.*)?$/,
  nim: /:\s*(#.*)?$/,
};

function getOffsideRuleLanguageIds(): Set<string> {
  const config = vscode.workspace.getConfiguration("emacs-mcx");
  const userList = config.get<string[]>("tab.offsideRuleLanguages");
  if (userList) {
    return new Set(userList);
  }
  return new Set(DEFAULT_OFFSIDE_RULE_LANGUAGE_IDS);
}

function previousLineOpensBlock(lineText: string, languageId: string): boolean {
  const pattern = BLOCK_OPENER_PATTERNS[languageId];
  if (pattern) {
    return pattern.test(lineText);
  }
  // For unknown offside-rule languages, assume the line opens a block if it
  // ends with a colon (common convention).
  return /:\s*$/.test(lineText);
}

export class TabToTabStop extends EmacsCommand {
  public readonly id = "tabToTabStop";

  private latestTextEditor: TextEditor | undefined;
  private latestSelections: readonly vscode.Selection[] = [];
  private latestIndentLevels: readonly (number | undefined)[] = [];

  public async run(
    textEditor: TextEditor,
    isInMarkMode: boolean,
    prefixArgument: number | undefined,
  ): Promise<unknown> {
    const languageId = textEditor.document.languageId;

    if (getOffsideRuleLanguageIds().has(languageId)) {
      return this.runInOffsideRuleLanguage(textEditor);
    }

    // For brace-delimited languages (C, C++, C#, JS, TS, bash, JSON, etc.),
    // VS Code's reindent computes the one correct indent level — matching Emacs
    // behavior for these modes.
    //
    // A single call of `editor.action.reindentselectedlines`
    // only affects a first selection which has a not indented line.
    // So we need to call it as many times as the number of selections.
    return makeParallel(textEditor.selections.length, () =>
      vscode.commands.executeCommand("editor.action.reindentselectedlines"),
    ).then(() => {
      // Emacs cursor behavior: if the cursor was in leading whitespace, move it
      // to the first non-whitespace character.  If past the indentation, leave
      // it where it is (just collapse the selection).
      textEditor.selections = textEditor.selections.map((selection) => {
        const indentHeadChar = textEditor.document.lineAt(selection.active.line).firstNonWhitespaceCharacterIndex;
        if (selection.active.character > indentHeadChar) {
          return new Selection(selection.active, selection.active);
        }
        const indentHeadPos = new vscode.Position(selection.active.line, indentHeadChar);
        return new Selection(indentHeadPos, indentHeadPos);
      });
      this.emacsController.exitMarkMode();
    });
  }

  private async runInOffsideRuleLanguage(textEditor: TextEditor): Promise<void> {
    const tabSize = textEditor.options.tabSize as number;
    const insertSpaces = textEditor.options.insertSpaces as boolean;
    const languageId = textEditor.document.languageId;

    const singleIndentSize = insertSpaces ? tabSize : 1;

    const indentOps = textEditor.selections.map((selection, i) => {
      let prevNonEmptyLine: vscode.TextLine | undefined;
      for (let j = selection.active.line - 1; j >= 0; j--) {
        const line = textEditor.document.lineAt(j);
        if (line.isEmptyOrWhitespace) {
          continue;
        }
        prevNonEmptyLine = line;
        break;
      }

      const prevLineIndentChars = prevNonEmptyLine?.firstNonWhitespaceCharacterIndex;
      const prevIndentLevel = prevLineIndentChars != null ? Math.floor(prevLineIndentChars / tabSize) : 0;

      // Only offer one level deeper than the previous line if it opens a block.
      // Otherwise, the deepest valid level is the same as the previous line.
      const opensBlock = prevNonEmptyLine != null && previousLineOpensBlock(prevNonEmptyLine.text, languageId);
      const maxIndentLevel = opensBlock ? prevIndentLevel + 1 : prevIndentLevel;

      // Cycling: on the first press go to max, then decrement on each
      // subsequent press until 0, then wrap back to max.
      const prevCycleLevel = this.latestIndentLevels[i];
      const newIndentLevel =
        prevCycleLevel != null && 0 < prevCycleLevel && prevCycleLevel <= maxIndentLevel
          ? prevCycleLevel - 1
          : maxIndentLevel;

      const newIndentChars = newIndentLevel * singleIndentSize;

      const thisLine = textEditor.document.lineAt(selection.active.line);
      const charsOffsetAfterIndent = Math.max(
        selection.active.character - thisLine.firstNonWhitespaceCharacterIndex,
        0,
      );

      return {
        line: selection.active.line,
        newIndentLevel,
        newIndentChars,
        newCursorChars: newIndentChars + charsOffsetAfterIndent,
      };
    });

    // Update the indents
    const indentChar = insertSpaces ? " " : "\t";
    await textEditor.edit((editBuilder) => {
      indentOps.forEach((indentOp) => {
        const line = textEditor.document.lineAt(indentOp.line);
        const lineHead = line.range.start;
        const charsToInsertOrDelete = indentOp.newIndentChars - line.firstNonWhitespaceCharacterIndex;
        if (charsToInsertOrDelete >= 0) {
          editBuilder.insert(lineHead, indentChar.repeat(charsToInsertOrDelete));
        } else {
          editBuilder.delete(new vscode.Range(lineHead, new vscode.Position(indentOp.line, -charsToInsertOrDelete)));
        }
      });
    });
    // Update the cursor positions
    textEditor.selections = indentOps.map((indentOp) => {
      const active = new vscode.Position(indentOp.line, indentOp.newCursorChars);
      return new vscode.Selection(active, active);
    });

    this.latestIndentLevels = indentOps.map((indentOp) => indentOp.newIndentLevel);
    this.latestTextEditor = textEditor;
    this.latestSelections = textEditor.selections;

    this.emacsController.exitMarkMode();
  }

  public onDidInterruptTextEditor(): void {
    const interruptedBySelfCursorMove =
      this.latestTextEditor === vscode.window.activeTextEditor &&
      this.latestSelections.every((latestSelection, i) => {
        const activeSelection = vscode.window.activeTextEditor?.selections[i];
        return activeSelection && latestSelection.isEqual(activeSelection);
      });
    if (!interruptedBySelfCursorMove) {
      this.latestIndentLevels = [];
    }
  }
}
