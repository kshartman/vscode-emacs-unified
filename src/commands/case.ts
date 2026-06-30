import { Position, Range, Selection, TextEditor } from "vscode";
import { EmacsCommand } from ".";
import { revealPrimaryActive } from "./helpers/reveal";
import { findNextWordEnd } from "./helpers/wordOperations";
import { getWordSeparators, shouldRespectSubwordMode } from "./helpers/wordSeparators";
import { IEmacsController } from "../emulator";

async function transformWordInternal(
  emacsController: IEmacsController,
  textEditor: TextEditor,
  prefixArgument: number | undefined,
  transformer: (text: string) => string,
): Promise<void> {
  emacsController.exitMarkMode();

  const repeat = prefixArgument === undefined ? 1 : prefixArgument;
  if (repeat <= 0) {
    return;
  }

  const doc = textEditor.document;
  const wordSeparators = getWordSeparators(doc);
  const subwordMode = shouldRespectSubwordMode(doc);

  // Emacs case-word commands always advance across intervening whitespace and
  // line breaks to the next word, independent of `wordNavigationStyle` (which
  // only governs M-f/M-b movement). Delegating to forwardWord would inherit the
  // native VS Code behavior that stalls on trailing whitespace before a newline,
  // breaking continuous transformation (ISSUE-3).
  const oldPositions: Position[] = textEditor.selections.map((selection) => selection.active);
  const newPositions: Position[] = oldPositions.map((position) => {
    let active = position;
    for (let i = 0; i < repeat; i++) {
      active = findNextWordEnd(doc, wordSeparators, active, true, subwordMode);
    }
    return active;
  });

  const edits = oldPositions.map((oldPosition, i) => {
    const range = new Range(oldPosition, newPositions[i] as Position);
    return { range, newText: transformer(doc.getText(range)) };
  });

  await textEditor.edit((editBuilder) => {
    edits.forEach(({ range, newText }) => editBuilder.replace(range, newText));
  });

  // Advance the cursors to the end of each transformed word so repeated
  // invocations transform successive words (continuous transformation).
  textEditor.selections = newPositions.map((position) => new Selection(position, position));
  revealPrimaryActive(textEditor);
}

const titleBoundary = new RegExp("(^|[^\\p{L}\\p{N}']|((^|\\P{L})'))\\p{L}", "gmu"); // Ref: https://github.com/microsoft/vscode/blob/238adc8bc607dd294a57e24b37073fbd939aaca9/src/vs/editor/contrib/linesOperations/browser/linesOperations.ts#L1218

export class TransformToTitlecase extends EmacsCommand {
  public readonly id = "transformToTitlecase";
  public async run(textEditor: TextEditor, isInMarkMode: boolean, prefixArgument: number | undefined): Promise<void> {
    return transformWordInternal(this.emacsController, textEditor, prefixArgument, (text: string) => {
      return text.toLocaleLowerCase().replace(titleBoundary, (b) => b.toLocaleUpperCase()); // Ref: https://github.com/microsoft/vscode/blob/238adc8bc607dd294a57e24b37073fbd939aaca9/src/vs/editor/contrib/linesOperations/browser/linesOperations.ts#L1235-L1237
    });
  }
}

export class TransformToUppercase extends EmacsCommand {
  public readonly id = "transformToUppercase";
  public async run(textEditor: TextEditor, isInMarkMode: boolean, prefixArgument: number | undefined): Promise<void> {
    return transformWordInternal(
      this.emacsController,
      textEditor,
      prefixArgument,
      (text: string) => text.toLocaleUpperCase(), // Use toLocaleUpperCase as same as https://github.com/microsoft/vscode/blob/238adc8bc607dd294a57e24b37073fbd939aaca9/src/vs/editor/contrib/linesOperations/browser/linesOperations.ts#L1167
    );
  }
}

export class TransformToLowercase extends EmacsCommand {
  public readonly id = "transformToLowercase";
  public async run(textEditor: TextEditor, isInMarkMode: boolean, prefixArgument: number | undefined): Promise<void> {
    return transformWordInternal(
      this.emacsController,
      textEditor,
      prefixArgument,
      (text: string) => text.toLocaleLowerCase(), // Use toLocaleLowerCase as same as https://github.com/microsoft/vscode/blob/238adc8bc607dd294a57e24b37073fbd939aaca9/src/vs/editor/contrib/linesOperations/browser/linesOperations.ts#L1182
    );
  }
}
