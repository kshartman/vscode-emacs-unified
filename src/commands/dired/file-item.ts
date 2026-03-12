import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

const SCHEME = "dired";

/** Format a Unix mode bitmask as an ls-style string like "drwxr-xr-x". */
function formatMode(mode: number, isDir: boolean, isSymlink: boolean): string {
  const typeChar = isSymlink ? "l" : isDir ? "d" : "-";
  const triplet = (shift: number): string => {
    const r = mode & (4 << shift) ? "r" : "-";
    const w = mode & (2 << shift) ? "w" : "-";
    const x = mode & (1 << shift) ? "x" : "-";
    return r + w + x;
  };
  return typeChar + triplet(6) + triplet(3) + triplet(0);
}

function pad(value: string | number, width: number, fill = " "): string {
  const s = String(value);
  return s.length >= width ? s : fill.repeat(width - s.length) + s;
}

function padRight(value: string, width: number): string {
  return value.length >= width ? value : value + " ".repeat(width - value.length);
}

/** Resolve uid to username. Best-effort — returns the uid as string on failure. */
function resolveUser(uid: number): string {
  try {
    return os.userInfo().username;
  } catch {
    return String(uid);
  }
}

export class FileItem {
  constructor(
    public readonly dirname: string,
    public readonly fileName: string,
    public readonly isDirectory: boolean,
    public readonly isFile: boolean,
    public readonly isSymlink: boolean,
    public readonly size: number,
    public readonly mtime: Date,
    public readonly modeStr: string,
    public readonly owner: string,
    public selected: boolean = false,
  ) {}

  static create(dirname: string, fileName: string, stats: fs.Stats, lstats?: fs.Stats): FileItem {
    const isSymlink = lstats?.isSymbolicLink() ?? false;
    const modeStr = formatMode(stats.mode & 0o777, stats.isDirectory(), isSymlink);
    const owner = resolveUser(stats.uid);
    return new FileItem(
      dirname,
      fileName,
      stats.isDirectory(),
      stats.isFile(),
      isSymlink,
      stats.size,
      stats.mtime,
      modeStr,
      owner,
    );
  }

  get fullPath(): string {
    return path.join(this.dirname, this.fileName);
  }

  get uri(): vscode.Uri | undefined {
    if (this.isDirectory) {
      return vscode.Uri.parse(`${SCHEME}://${this.fullPath}`);
    }
    if (this.isFile || this.isSymlink) {
      return vscode.Uri.file(this.fullPath);
    }
    return undefined;
  }

  /** Format as one line in the dired buffer. Fixed-width columns for parsing. */
  line(): string {
    const sel = this.selected ? "*" : " ";
    const user = padRight(this.owner, 8);
    const size = pad(this.size, 8);
    const m = this.mtime;
    const month = pad(m.getMonth() + 1, 2, "0");
    const day = pad(m.getDate(), 2, "0");
    const hour = pad(m.getHours(), 2, "0");
    const min = pad(m.getMinutes(), 2, "0");
    return `${sel} ${this.modeStr} ${user} ${size} ${month} ${day} ${hour}:${min} ${this.fileName}`;
  }

  /** Parse a dired buffer line back into a FileItem. */
  static parseLine(dirname: string, lineText: string): FileItem {
    const fileName = lineText.substring(43);
    const modeStr = lineText.substring(2, 12);
    const owner = lineText.substring(13, 21).trim();
    const size = parseInt(lineText.substring(22, 30), 10) || 0;
    const isDir = modeStr.charAt(0) === "d";
    const isSymlink = modeStr.charAt(0) === "l";
    const isFile = modeStr.charAt(0) === "-";
    const selected = lineText.charAt(0) === "*";
    return new FileItem(dirname, fileName, isDir, isFile, isSymlink, size, new Date(), modeStr, owner, selected);
  }
}
