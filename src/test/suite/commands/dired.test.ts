import assert from "assert";
import { FileItem } from "../../../commands/dired/file-item";

suite("Dired FileItem", () => {
  suite("line() formatting", () => {
    test("formats a regular file line", () => {
      const item = new FileItem(
        "/home",
        "test.txt",
        false,
        true,
        false,
        1234,
        new Date(2025, 0, 15, 9, 30),
        "-rwxr-xr-x",
        "user",
      );
      const line = item.line();
      // Selection marker (space = unselected)
      assert.strictEqual(line.charAt(0), " ");
      // Mode string
      assert.ok(line.includes("-rwxr-xr-x"));
      // Filename at the end
      assert.ok(line.endsWith("test.txt"));
      // Size
      assert.ok(line.includes("1234"));
    });

    test("formats a selected file with asterisk", () => {
      const item = new FileItem("/home", "selected.txt", false, true, false, 0, new Date(), "-rw-r--r--", "user", true);
      const line = item.line();
      assert.strictEqual(line.charAt(0), "*");
    });

    test("formats a directory", () => {
      const item = new FileItem("/home", "subdir", true, false, false, 4096, new Date(), "drwxr-xr-x", "user");
      const line = item.line();
      assert.ok(line.includes("drwxr-xr-x"));
      assert.ok(line.endsWith("subdir"));
    });

    test("formats a symlink", () => {
      const item = new FileItem("/home", "link", false, false, true, 10, new Date(), "lrwxrwxrwx", "user");
      const line = item.line();
      assert.ok(line.includes("lrwxrwxrwx"));
    });
  });

  suite("parseLine() round-trip", () => {
    test("round-trips a file item through line() and parseLine()", () => {
      const original = new FileItem(
        "/tmp",
        "hello.ts",
        false,
        true,
        false,
        9999,
        new Date(2025, 5, 1, 14, 0),
        "-rw-r--r--",
        "dev",
      );
      const line = original.line();
      const parsed = FileItem.parseLine("/tmp", line);

      assert.strictEqual(parsed.fileName, "hello.ts");
      assert.strictEqual(parsed.isFile, true);
      assert.strictEqual(parsed.isDirectory, false);
      assert.strictEqual(parsed.isSymlink, false);
      assert.strictEqual(parsed.modeStr, "-rw-r--r--");
      assert.strictEqual(parsed.owner, "dev");
      assert.strictEqual(parsed.size, 9999);
      assert.strictEqual(parsed.selected, false);
    });

    test("round-trips a selected directory", () => {
      const original = new FileItem("/tmp", "mydir", true, false, false, 4096, new Date(), "drwxr-xr-x", "root", true);
      const line = original.line();
      const parsed = FileItem.parseLine("/tmp", line);

      assert.strictEqual(parsed.fileName, "mydir");
      assert.strictEqual(parsed.isDirectory, true);
      assert.strictEqual(parsed.selected, true);
      assert.strictEqual(parsed.owner, "root");
    });

    test("preserves dirname from parseLine argument, not from line text", () => {
      const item = new FileItem("/original", "file.txt", false, true, false, 0, new Date(), "-rw-------", "user");
      const line = item.line();
      const parsed = FileItem.parseLine("/different", line);
      assert.strictEqual(parsed.dirname, "/different");
      assert.strictEqual(parsed.fullPath, "/different/file.txt");
    });
  });

  suite("uri property", () => {
    test("returns dired:// URI for directories", () => {
      const item = new FileItem("/home", "subdir", true, false, false, 4096, new Date(), "drwxr-xr-x", "user");
      const uri = item.uri;
      assert.ok(uri);
      assert.strictEqual(uri.scheme, "dired");
    });

    test("returns file:// URI for regular files", () => {
      const item = new FileItem("/home", "test.txt", false, true, false, 100, new Date(), "-rw-r--r--", "user");
      const uri = item.uri;
      assert.ok(uri);
      assert.strictEqual(uri.scheme, "file");
    });

    test("returns file:// URI for symlinks", () => {
      const item = new FileItem("/home", "link", false, false, true, 10, new Date(), "lrwxrwxrwx", "user");
      const uri = item.uri;
      assert.ok(uri);
      assert.strictEqual(uri.scheme, "file");
    });
  });
});
