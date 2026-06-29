#!/usr/bin/env bash
set -euo pipefail

# Run the VS Code integration tests against the WSLg display (:0).
#
# The kill-ring/yank tests drive VS Code's native clipboard paste
# (`editor.action.clipboardPasteAction`), which reads the real OS clipboard.
# A bare headless X server (xvfb) has no clipboard backend, so the clipboard
# read-back races and those tests flake. WSLg's :0 display is backed by the
# real Windows clipboard, which is stable, so the tests run reliably there.
#
# Trade-off: VS Code test windows are visible on the Windows desktop while the
# suite runs (WSLg has no headless mode). Requires WSLg (Windows 11 / recent
# WSL2), which provides DISPLAY=:0.

ROOT="$(dirname "$(dirname "$(realpath "$0")")")"
cd "$ROOT"

DISPLAY="${WSLG_DISPLAY:-:0}"
export DISPLAY

if ! command -v xdpyinfo >/dev/null 2>&1 || ! xdpyinfo -display "$DISPLAY" >/dev/null 2>&1; then
  echo "error: X display '$DISPLAY' is not reachable. This script expects WSLg (DISPLAY=:0)." >&2
  exit 1
fi

exec npx vscode-test "$@"
