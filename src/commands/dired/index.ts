import * as vscode from "vscode";
import * as path from "path";
import * as os from "os";
import { DiredProvider } from "./provider";
import { Logger } from "../../logger";

const logger = Logger.get("dired");

export function registerDired(context: vscode.ExtensionContext): void {
  const config = vscode.workspace.getConfiguration("dired");
  const fixedWindow = config.get<boolean>("fixed_window", false);
  const askDir = config.get<boolean>("ask_directory", true);

  const provider = new DiredProvider(fixedWindow);

  context.subscriptions.push(
    provider,
    vscode.workspace.registerTextDocumentContentProvider(DiredProvider.scheme, provider),
  );

  // Track dired context for keybinding when clauses
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      const isDired = editor?.document.uri.scheme === DiredProvider.scheme;
      void vscode.commands.executeCommand("setContext", "dired.open", isDired);
      if (isDired && editor) {
        editor.options = { cursorStyle: vscode.TextEditorCursorStyle.Block };
      }
    }),
  );

  const register = (id: string, fn: (...args: unknown[]) => unknown) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(id, async (...args: unknown[]) => {
        try {
          await fn(...args);
        } catch (error) {
          logger.error(`Command ${id} failed: ${String(error)}`);
        }
      }),
    );
  };

  register("extension.dired.open", async () => {
    let dir = getStartingDirectory();
    if (askDir) {
      const input = await vscode.window.showInputBox({
        value: dir,
        valueSelection: [dir.length, dir.length],
        prompt: "Open dired in directory",
      });
      if (!input) {
        return;
      }
      dir = input;
    }
    await provider.openDir(dir);
  });

  register("extension.dired.enter", () => provider.enter());
  register("extension.dired.toggleDotFiles", () => provider.toggleDotFiles());
  register("extension.dired.goUpDir", () => provider.goUpDir());
  register("extension.dired.refresh", () => provider.reload());
  register("extension.dired.select", () => provider.select());
  register("extension.dired.unselect", () => provider.unselect());
  register("extension.dired.close", () => vscode.commands.executeCommand("workbench.action.closeActiveEditor"));

  register("extension.dired.createDir", async () => {
    const name = await vscode.window.showInputBox({ prompt: "Directory name" });
    if (name) {
      await provider.createDir(name);
    }
  });

  register("extension.dired.createFile", async () => {
    const name = await vscode.window.showInputBox({ prompt: "File name" });
    if (name) {
      await provider.createFile(name);
    }
  });

  register("extension.dired.rename", async () => {
    const name = await vscode.window.showInputBox({ prompt: "Rename to" });
    if (name) {
      await provider.rename(name);
    }
  });

  register("extension.dired.copy", async () => {
    const name = await vscode.window.showInputBox({ prompt: "Copy to" });
    if (name) {
      await provider.copy(name);
    }
  });

  register("extension.dired.delete", () => provider.delete());
}

function getStartingDirectory(): string {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    if (editor.document.uri.scheme === DiredProvider.scheme) {
      const line0 = editor.document.lineAt(0).text;
      return line0.endsWith(":") ? line0.slice(0, -1) : line0;
    }
    if (editor.document.uri.scheme === "file") {
      return path.dirname(editor.document.uri.fsPath);
    }
  }
  const folders = vscode.workspace.workspaceFolders;
  if (folders && folders.length > 0) {
    return folders[0]!.uri.fsPath;
  }
  return os.homedir();
}
