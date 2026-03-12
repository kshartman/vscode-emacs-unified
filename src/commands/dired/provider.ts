import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { FileItem } from "./file-item";

export class DiredProvider implements vscode.TextDocumentContentProvider, vscode.Disposable {
  static readonly scheme = "dired";

  private readonly _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  readonly onDidChange = this._onDidChange.event;

  private _showDotFiles = true;
  private _bufferLines: string[] = [];
  private _fixedWindow: boolean;

  constructor(fixedWindow: boolean) {
    this._fixedWindow = fixedWindow;
  }

  dispose(): void {
    this._onDidChange.dispose();
  }

  /** The directory shown in the current dired buffer (read from line 0). */
  get dirname(): string | undefined {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.uri.scheme !== DiredProvider.scheme) {
      return undefined;
    }
    const line0 = editor.document.lineAt(0).text;
    return line0.endsWith(":") ? line0.slice(0, -1) : line0;
  }

  // --- TextDocumentContentProvider ---

  provideTextDocumentContent(): string {
    return this._bufferLines.join("\n");
  }

  // --- Public commands ---

  async openDir(dirPath: string): Promise<void> {
    const resolved = path.resolve(dirPath);
    await this.buildBuffer(resolved);
    const uri = vscode.Uri.parse(`${DiredProvider.scheme}://${resolved}`);
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, { preview: this._fixedWindow, viewColumn: vscode.ViewColumn.Active });
    await vscode.languages.setTextDocumentLanguage(doc, "dired");
  }

  enter(): void {
    const file = this.getFileAtCursor();
    if (!file) {
      return;
    }
    const uri = file.uri;
    if (!uri) {
      return;
    }
    if (uri.scheme === DiredProvider.scheme) {
      void this.openDir(file.fullPath);
    } else {
      void this.showFile(uri);
    }
  }

  async showFile(uri: vscode.Uri): Promise<void> {
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.Active });
  }

  toggleDotFiles(): void {
    this._showDotFiles = !this._showDotFiles;
    void this.reload();
  }

  async reload(): Promise<void> {
    const dir = this.dirname;
    if (!dir) {
      return;
    }
    await this.buildBuffer(dir);
    this._onDidChange.fire(vscode.Uri.parse(`${DiredProvider.scheme}://${dir}`));
  }

  goUpDir(): void {
    const dir = this.dirname;
    if (!dir || dir === "/" || dir === path.parse(dir).root) {
      return;
    }
    void this.openDir(path.dirname(dir));
  }

  async createDir(name: string): Promise<void> {
    const dir = this.dirname;
    if (!dir) {
      return;
    }
    await fs.promises.mkdir(path.join(dir, name), { recursive: true });
    await this.reload();
  }

  async createFile(filePath: string): Promise<void> {
    const resolved = path.isAbsolute(filePath) ? filePath : path.join(this.dirname ?? "", filePath);
    await fs.promises.mkdir(path.dirname(resolved), { recursive: true });
    // Create the file only if it doesn't exist
    const handle = await fs.promises.open(resolved, "a");
    await handle.close();
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(resolved));
    await vscode.window.showTextDocument(doc, { preview: false });
    await this.reload();
  }

  async rename(newName: string): Promise<void> {
    const file = this.getFileAtCursor();
    const dir = this.dirname;
    if (!file || !dir) {
      return;
    }
    const oldPath = file.fullPath;
    const newPath = path.join(dir, newName);
    await fs.promises.rename(oldPath, newPath);
    await this.reload();
    vscode.window.setStatusBarMessage(`Renamed ${file.fileName} → ${newName}`, 3000);
  }

  async copy(newName: string): Promise<void> {
    const file = this.getFileAtCursor();
    const dir = this.dirname;
    if (!file || !dir) {
      return;
    }
    const src = file.fullPath;
    const dest = path.join(dir, newName);
    await fs.promises.copyFile(src, dest);
    await this.reload();
    vscode.window.setStatusBarMessage(`Copied ${file.fileName} → ${newName}`, 3000);
  }

  async delete(): Promise<void> {
    const file = this.getFileAtCursor();
    const dir = this.dirname;
    if (!file || !dir) {
      return;
    }
    const fullPath = file.fullPath;
    const confirm = await vscode.window.showWarningMessage(`Delete ${file.fileName}?`, { modal: true }, "Yes");
    if (confirm !== "Yes") {
      return;
    }
    if (file.isDirectory) {
      await fs.promises.rm(fullPath, { recursive: true });
    } else {
      await fs.promises.unlink(fullPath);
    }
    await this.reload();
    vscode.window.setStatusBarMessage(`Deleted ${fullPath}`, 3000);
  }

  select(): void {
    this.toggleSelection(true);
  }

  unselect(): void {
    this.toggleSelection(false);
  }

  // --- Internals ---

  private getFileAtCursor(): FileItem | null {
    const editor = vscode.window.activeTextEditor;
    const dir = this.dirname;
    if (!editor || !dir) {
      return null;
    }
    const line = editor.selection.active.line;
    if (line < 1) {
      return null; // line 0 is the header
    }
    return FileItem.parseLine(dir, editor.document.lineAt(line).text);
  }

  private async buildBuffer(dirname: string): Promise<void> {
    let entries: string[];
    try {
      entries = await fs.promises.readdir(dirname);
    } catch (err) {
      void vscode.window.showErrorMessage(`Could not read ${dirname}: ${String(err)}`);
      return;
    }

    const allNames = [".", "..", ...entries];
    const items: FileItem[] = [];
    for (const name of allNames) {
      const fullPath = path.join(dirname, name);
      try {
        const lstats = await fs.promises.lstat(fullPath);
        const stats = lstats.isSymbolicLink() ? await fs.promises.stat(fullPath).catch(() => lstats) : lstats;
        items.push(FileItem.create(dirname, name, stats, lstats));
      } catch {
        // Skip files we can't stat (broken symlinks, permission errors)
      }
    }

    const filtered = items.filter((item) => {
      if (item.fileName === "." || item.fileName === "..") {
        return true;
      }
      if (!this._showDotFiles && item.fileName.startsWith(".")) {
        return false;
      }
      return true;
    });

    this._bufferLines = [dirname + ":", ...filtered.map((f) => f.line())];
  }

  private toggleSelection(value: boolean): void {
    const editor = vscode.window.activeTextEditor;
    const dir = this.dirname;
    if (!editor || !dir) {
      return;
    }

    const doc = editor.document;
    this._bufferLines = [];
    for (let i = 0; i < doc.lineCount; i++) {
      this._bufferLines.push(doc.lineAt(i).text);
    }

    let start: number;
    let end: number;

    if (editor.selection.isEmpty) {
      const cursor = editor.selection.active.line;
      if (cursor === 0) {
        // Header line: select all
        start = 1;
        end = doc.lineCount;
      } else {
        start = cursor;
        end = cursor + 1;
        void vscode.commands.executeCommand("cursorMove", { to: "down", by: "line" });
      }
    } else {
      start = editor.selection.start.line;
      end = editor.selection.end.line;
    }

    for (let i = start; i < end; i++) {
      const line = this._bufferLines[i];
      if (line === undefined) {
        continue;
      }
      const file = FileItem.parseLine(dir, line);
      if (file.fileName === "." || file.fileName === "..") {
        continue;
      }
      file.selected = value;
      this._bufferLines[i] = file.line();
    }

    this._onDidChange.fire(vscode.Uri.parse(`${DiredProvider.scheme}://${dir}`));
  }
}
