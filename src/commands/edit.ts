import * as vscode from "vscode";
import { Position, Range, Selection, TextEditor } from "vscode";
import { EmacsCommand } from ".";
import { makeParallel } from "./helpers/parallel";
import { makeSelectionsEmpty } from "./helpers/selection";
import { revealPrimaryActive } from "./helpers/reveal";
import { delay } from "../utils";
import { Configuration } from "../configuration/configuration";
import { Logger } from "../logger";

const logger = Logger.get("EditCommands");

export class DeleteBackwardChar extends EmacsCommand {
  public readonly id = "deleteBackwardChar";

  public run(textEditor: TextEditor, isInMarkMode: boolean, prefixArgument: number | undefined): Thenable<unknown> {
    const repeat = prefixArgument === undefined ? 1 : prefixArgument;
    return makeParallel(repeat, () => vscode.commands.executeCommand("deleteLeft"));
  }
}

export class DeleteForwardChar extends EmacsCommand {
  public readonly id = "deleteForwardChar";

  public run(textEditor: TextEditor, isInMarkMode: boolean, prefixArgument: number | undefined): Thenable<void> {
    const repeat = prefixArgument === undefined ? 1 : prefixArgument;
    return makeParallel(repeat, () =>
      vscode.commands.executeCommand<void>("deleteRight"),
    ) as Thenable<unknown> as Thenable<void>;
  }
}

export class DeleteHorizontalSpace extends EmacsCommand {
  public readonly id = "deleteHorizontalSpace";

  public run(textEditor: TextEditor, isInMarkMode: boolean, prefixArgument: number | undefined): Thenable<void> {
    const onlyBefore = prefixArgument === undefined ? false : prefixArgument > 0;
    return textEditor
      .edit((editBuilder) => {
        textEditor.selections.forEach((selection) => {
          const line = selection.active.line;

          let from = selection.active.character;
          while (from > 0) {
            const char = textEditor.document.getText(new Range(line, from - 1, line, from));
            if (char !== " " && char !== "\t") {
              break;
            }
            from -= 1;
          }

          let to = selection.active.character;
          if (!onlyBefore) {
            const lineEnd = textEditor.document.lineAt(line).range.end.character;
            while (to < lineEnd) {
              const char = textEditor.document.getText(new Range(line, to, line, to + 1));
              if (char !== " " && char !== "\t") {
                break;
              }
              to += 1;
            }
          }

          editBuilder.delete(new Range(line, from, line, to));
        });
      })
      .then((success) => {
        if (!success) {
          logger.warn("deleteHorizontalSpace failed");
        }
      })
      .then(() => {
        makeSelectionsEmpty(textEditor);
      });
  }
}

export class NewLine extends EmacsCommand {
  public readonly id = "newLine";

  public async run(textEditor: TextEditor, isInMarkMode: boolean, prefixArgument: number | undefined): Promise<void> {
    this.emacsController.exitMarkMode();

    textEditor.selections = textEditor.selections.map((selection) => new Selection(selection.active, selection.active));

    const repeat = prefixArgument === undefined ? 1 : prefixArgument;

    if (repeat <= 0) {
      return;
    }
    if (repeat === 1) {
      return vscode.commands.executeCommand<void>("default:type", { text: "\n" });
    }

    // We don't use a combination of `createParallel` and `vscode.commands.executeCommand("default:type", { text: "\n" })`
    // here because it doesn't work well with undo/redo pushing multiple edits into the undo stack.
    // Instead, we use `textEditor.edit` to push a single edit into the undo stack.
    // To do so, we first call the `default:type` command twice to insert two new lines
    // and record the inserted texts.
    // Then undo these two edits and call `textEditor.edit` to insert the repeated texts at once.

    const initCursorsAtEndOfLine = textEditor.selections.map((selection) => {
      return selection.active.isEqual(textEditor.document.lineAt(selection.active.line).range.end);
    });

    await vscode.commands.executeCommand<void>("default:type", { text: "\n" });
    await delay(33); // Wait for code completion to finish. The value is ad-hoc.
    await vscode.commands.executeCommand<void>("default:type", { text: "\n" });

    // The first inserted lines can be affected by the second ones.
    // We need to capture its final content after the second insertion to achieve the desired result.
    const firstInsertedTexts = textEditor.selections.map((selection) => {
      const from = textEditor.document.lineAt(selection.active.line - 2).range.end;
      const to = textEditor.document.lineAt(selection.active.line - 1).range.end;
      return textEditor.document.getText(new Range(from, to));
    });
    const secondInsertedTexts = textEditor.selections.map((selection) => {
      const from = textEditor.document.lineAt(selection.active.line - 1).range.end;
      const to = textEditor.document.lineAt(selection.active.line - 0).range.end;
      return textEditor.document.getText(new Range(from, to));
    });

    // Trailing new lines can be inserted for example
    // when the cursor is inside a multi-line comment in JS like below.
    // /**| */
    // ↓
    // /**
    //  * |
    //  */
    // The `trailingNewLinesInserted` flag list represents whether such trailing new lines are inserted or not.
    // `trailingLineTexts` contains the texts of such trailing new lines.
    const trailingNewLinesInserted = textEditor.selections.map((selection, index) => {
      const initCursorAtEndOfLine = initCursorsAtEndOfLine[index];
      if (initCursorAtEndOfLine == null || initCursorAtEndOfLine === true) {
        return false;
      }
      const cursorAtEndOfLine = selection.active.isEqual(textEditor.document.lineAt(selection.active.line).range.end);
      return cursorAtEndOfLine;
    });
    const trailingLineTexts = textEditor.selections.map((selection, index) => {
      const trailingNewLineInserted = trailingNewLinesInserted[index];
      if (trailingNewLineInserted == null || trailingNewLineInserted === false) {
        return "";
      }
      const nextLineStart = textEditor.document.lineAt(selection.active.line + 1).range.start;
      return textEditor.document.getText(new Range(selection.active, nextLineStart));
    });

    await vscode.commands.executeCommand<void>("undo");
    await vscode.commands.executeCommand<void>("undo");

    await textEditor.edit((editBuilder) => {
      textEditor.selections.forEach((selection, index) => {
        const firstInsertedLineText = firstInsertedTexts[index];
        const secondInsertedLineText = secondInsertedTexts[index];
        const trailingLineText = trailingLineTexts[index];
        if (firstInsertedLineText == null) {
          throw new Error("firstInsertedLineText is null");
        }
        if (secondInsertedLineText == null) {
          throw new Error("secondInsertedLineText is null");
        }
        if (trailingLineText == null) {
          throw new Error("trailingLineText is null");
        }
        editBuilder.insert(
          selection.active,
          firstInsertedLineText.repeat(repeat - 1) + secondInsertedLineText + trailingLineText,
        );
      });
    });
    textEditor.selections = textEditor.selections.map((selection, index) => {
      const trailingNewLineInserted = trailingNewLinesInserted[index];
      if (trailingNewLineInserted) {
        const newActive = textEditor.document.lineAt(selection.active.line - 1).range.end;
        return new Selection(newActive, newActive);
      }
      return selection;
    });

    revealPrimaryActive(textEditor);
  }
}

/**
 * Comment syntax: start delimiter and end delimiter.
 * Line-comment languages have an empty `end`.
 */
interface CommentSyntax {
  start: string;
  end: string;
}

/**
 * Default comment delimiters per language, matching Emacs major-mode defaults.
 * Users can override/extend via `emacs-mcx.commentSyntax`.
 *
 * NOTE: C uses block comments (/* ... * /) matching cc-mode's default.
 * C++ and most other brace languages use line comments (//).
 */
const DEFAULT_COMMENT_SYNTAX: Record<string, CommentSyntax> = {
  // Block-comment languages (non-empty comment-end)
  c: { start: "/*", end: "*/" },
  css: { start: "/*", end: "*/" },

  // Line-comment languages: // style
  cpp: { start: "//", end: "" },
  csharp: { start: "//", end: "" },
  go: { start: "//", end: "" },
  java: { start: "//", end: "" },
  javascript: { start: "//", end: "" },
  javascriptreact: { start: "//", end: "" },
  jsonc: { start: "//", end: "" },
  kotlin: { start: "//", end: "" },
  less: { start: "//", end: "" },
  objc: { start: "//", end: "" },
  php: { start: "//", end: "" },
  rust: { start: "//", end: "" },
  sass: { start: "//", end: "" },
  scala: { start: "//", end: "" },
  scss: { start: "//", end: "" },
  swift: { start: "//", end: "" },
  typescript: { start: "//", end: "" },
  typescriptreact: { start: "//", end: "" },
  zig: { start: "//", end: "" },
  fsharp: { start: "//", end: "" },

  // Line-comment languages: # style
  bash: { start: "#", end: "" },
  coffeescript: { start: "#", end: "" },
  dockerfile: { start: "#", end: "" },
  elixir: { start: "#", end: "" },
  makefile: { start: "#", end: "" },
  perl: { start: "#", end: "" },
  powershell: { start: "#", end: "" },
  python: { start: "#", end: "" },
  r: { start: "#", end: "" },
  ruby: { start: "#", end: "" },
  shellscript: { start: "#", end: "" },
  yaml: { start: "#", end: "" },
  toml: { start: "#", end: "" },

  // Line-comment languages: other styles
  clojure: { start: ";;", end: "" },
  lisp: { start: ";;", end: "" },
  scheme: { start: ";;", end: "" },
  erlang: { start: "%", end: "" },
  haskell: { start: "--", end: "" },
  lua: { start: "--", end: "" },
  sql: { start: "--", end: "" },
  ada: { start: "--", end: "" },
  vb: { start: "'", end: "" },
  latex: { start: "%", end: "" },
  tex: { start: "%", end: "" },
  ini: { start: ";", end: "" },
};

/**
 * Normalize a user-provided comment syntax entry.
 * Accepts either a plain string (line comment) or {start, end} object.
 */
function normalizeCommentSyntax(entry: string | { start: string; end: string }): CommentSyntax {
  if (typeof entry === "string") {
    return { start: entry, end: "" };
  }
  return { start: entry.start, end: entry.end ?? "" };
}

/**
 * Resolve the comment syntax for a language, checking user overrides first.
 */
function resolveCommentSyntax(langId: string): CommentSyntax | undefined {
  const userSyntax = Configuration.instance.commentSyntax;
  const userEntry = userSyntax[langId];
  if (userEntry != null) {
    return normalizeCommentSyntax(userEntry as string | { start: string; end: string });
  }
  return DEFAULT_COMMENT_SYNTAX[langId];
}

/**
 * Emacs `comment-dwim` (Do What I Mean).
 *
 * Behavior by case:
 *   1. Region active           → toggle comment (comment/uncomment region)
 *   2. Blank line              → indent to code level, insert comment, cursor inside
 *   3. Code line, no comment   → append comment at comment-column (or 1 space past code)
 *   4. Code line + comment     → move cursor into the existing comment
 *   5. Comment-only line       → realign comment to code indentation level
 *
 * TODO: C-u M-; (comment-kill) — kill comment on line to kill ring (ISSUE-5)
 */
export class CommentDwim extends EmacsCommand {
  public readonly id = "commentDwim";

  public async run(textEditor: TextEditor, isInMarkMode: boolean, prefixArgument: number | undefined): Promise<void> {
    this.emacsController.exitMarkMode();

    // Case 1: Region active → toggle comment
    if (textEditor.selections.some((s) => !s.isEmpty)) {
      await vscode.commands.executeCommand("editor.action.commentLine");
      return;
    }

    const langId = textEditor.document.languageId;
    const syntax = resolveCommentSyntax(langId);

    // Unknown language → fall back to VS Code's built-in toggle
    if (!syntax) {
      await vscode.commands.executeCommand("editor.action.commentLine");
      return;
    }

    const commentColumn = Configuration.instance.commentColumn;
    const marker = syntax.start; // e.g. "//" or "/*"
    const doc = textEditor.document;
    const tabSize = Number(textEditor.options.tabSize) || 4;

    // Categorize each cursor line
    const lineInfos = textEditor.selections.map((sel) => {
      const line = doc.lineAt(sel.active.line);
      return categorizeLine(line, marker, doc, tabSize);
    });

    // Apply edits
    await textEditor.edit((editBuilder) => {
      for (let i = 0; i < textEditor.selections.length; i++) {
        const info = lineInfos[i]!;
        const line = doc.lineAt(textEditor.selections[i]!.active.line);

        switch (info.type) {
          case "blank":
            // Insert comment at code indentation level
            editBuilder.replace(line.range, formatBlankLineComment(info.indent, syntax));
            break;

          case "code-only":
            // Append comment at comment-column (or 1 space past code)
            appendEndOfLineComment(editBuilder, line, syntax, commentColumn);
            break;

          case "comment-only":
            // Realign: move comment to code indentation level
            realignCommentOnlyLine(editBuilder, line, info);
            break;

          case "code-and-comment":
            // No edit needed — just move cursor (below)
            break;
        }
      }
    });

    // Position cursors inside the comment text
    textEditor.selections = textEditor.selections.map((sel) => {
      const line = doc.lineAt(sel.active.line);
      const pos = findCursorPositionInComment(line.text, marker, syntax.end);
      if (pos !== -1) {
        const p = new Position(line.lineNumber, pos);
        return new Selection(p, p);
      }
      return sel;
    });
  }
}

// ── Line categorization ────────────────────────────────────────────

interface BlankLine {
  type: "blank";
  indent: string;
}
interface CodeOnlyLine {
  type: "code-only";
}
interface CommentOnlyLine {
  type: "comment-only";
  commentPos: number;
  indent: string;
}
interface CodeAndCommentLine {
  type: "code-and-comment";
  commentPos: number;
}
type LineInfo = BlankLine | CodeOnlyLine | CommentOnlyLine | CodeAndCommentLine;

function categorizeLine(line: vscode.TextLine, marker: string, doc: vscode.TextDocument, tabSize: number): LineInfo {
  const text = line.text;

  // Blank line (whitespace only)
  if (text.trim().length === 0) {
    const indent = guessIndentation(line.lineNumber, doc, tabSize);
    return { type: "blank", indent };
  }

  // Search for comment marker outside strings
  const commentPos = findCommentStart(text, marker);

  if (commentPos === -1) {
    return { type: "code-only" };
  }

  // Is there code before the comment?
  const beforeComment = text.substring(0, commentPos).trim();
  if (beforeComment.length === 0) {
    // Comment-only line — compute desired indentation from context
    const indent = guessIndentation(line.lineNumber, doc, tabSize);
    return { type: "comment-only", commentPos, indent };
  }

  return { type: "code-and-comment", commentPos };
}

// ── Edit helpers ───────────────────────────────────────────────────

function formatBlankLineComment(indent: string, syntax: CommentSyntax): string {
  if (syntax.end) {
    // Block comment: indent/* | */
    return `${indent}${syntax.start} ${syntax.end}`;
  }
  // Line comment: indent// |
  return `${indent}${syntax.start} `;
}

function appendEndOfLineComment(
  editBuilder: vscode.TextEditorEdit,
  line: vscode.TextLine,
  syntax: CommentSyntax,
  commentColumn: number,
): void {
  const text = line.text;
  const trimmedEnd = text.trimEnd().length;
  // Pad to comment-column, minimum 1 space past code
  const padTo = Math.max(commentColumn, trimmedEnd + 1);
  const padding = " ".repeat(padTo - trimmedEnd);

  let commentText: string;
  if (syntax.end) {
    commentText = `${padding}${syntax.start}  ${syntax.end}`;
  } else {
    commentText = `${padding}${syntax.start} `;
  }

  // Replace trailing whitespace + append comment
  const replaceRange = new Range(new Position(line.lineNumber, trimmedEnd), line.range.end);
  editBuilder.replace(replaceRange, commentText);
}

function realignCommentOnlyLine(
  editBuilder: vscode.TextEditorEdit,
  line: vscode.TextLine,
  info: CommentOnlyLine,
): void {
  const text = line.text;
  // Extract the comment content (everything from marker onward)
  const commentContent = text.substring(info.commentPos);
  // Rebuild with correct indentation
  const newText = info.indent + commentContent;

  if (newText !== text) {
    editBuilder.replace(line.range, newText);
  }
}

// ── Cursor positioning ─────────────────────────────────────────────

/**
 * Find the cursor position inside the comment text on a line.
 * Returns the column after "start " (with space), or between start and end for block comments.
 */
function findCursorPositionInComment(lineText: string, marker: string, commentEnd: string): number {
  const commentPos = findCommentStart(lineText, marker);
  if (commentPos === -1) return -1;

  const afterMarker = commentPos + marker.length;

  if (commentEnd) {
    // Block comment: position cursor after "start " and before " end"
    // For "/* | */", cursor goes between the spaces
    if (afterMarker < lineText.length && lineText[afterMarker] === " ") {
      return afterMarker + 1;
    }
    return afterMarker;
  }

  // Line comment: position after "start "
  if (afterMarker < lineText.length && lineText[afterMarker] === " ") {
    return afterMarker + 1;
  }
  return afterMarker;
}

// ── Indentation guessing ───────────────────────────────────────────

/**
 * Guess the indentation for a line based on surrounding context.
 * Uses the previous non-blank line's indentation as the baseline.
 */
function guessIndentation(lineNumber: number, doc: vscode.TextDocument, tabSize: number): string {
  // Look at the previous non-blank line
  for (let i = lineNumber - 1; i >= 0; i--) {
    const prevLine = doc.lineAt(i);
    const trimmed = prevLine.text.trimStart();
    if (trimmed.length === 0) continue;

    const indent = prevLine.text.substring(0, prevLine.text.length - trimmed.length);

    // If previous line ends with a block opener, add one indent level
    const trimmedEnd = prevLine.text.trimEnd();
    const lastChar = trimmedEnd[trimmedEnd.length - 1];
    if (lastChar === "{" || lastChar === ":" || lastChar === "(") {
      const usesTabs = indent.includes("\t");
      return indent + (usesTabs ? "\t" : " ".repeat(tabSize));
    }

    return indent;
  }

  return "";
}

// ── Comment detection ──────────────────────────────────────────────

/**
 * Find the start position of a comment marker in a line of text,
 * skipping occurrences inside string literals.
 */
function findCommentStart(lineText: string, marker: string): number {
  let inSingle = false;
  let inDouble = false;
  let inBacktick = false;

  for (let i = 0; i <= lineText.length - marker.length; i++) {
    const ch = lineText[i]!;
    const prev = i > 0 ? lineText[i - 1] : "";

    // Track string state (skip escaped quotes)
    if (ch === "'" && !inDouble && !inBacktick) {
      if (prev === "\\") continue;
      inSingle = !inSingle;
      continue;
    }
    if (ch === '"' && !inSingle && !inBacktick) {
      if (prev === "\\") continue;
      inDouble = !inDouble;
      continue;
    }
    if (ch === "`" && !inSingle && !inDouble) {
      inBacktick = !inBacktick;
      continue;
    }

    if (inSingle || inDouble || inBacktick) continue;

    if (lineText.startsWith(marker, i)) {
      return i;
    }
  }

  return -1;
}
