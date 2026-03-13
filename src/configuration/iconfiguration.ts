export interface IDebugConfiguration {
  /**
   * Boolean indicating whether all logs should be suppressed
   * This value overrides both `loggingLevelForAlert` and `loggingLevelForConsole`
   */
  silent: boolean;

  /**
   * Maximum level of messages to show as VS Code information message
   * Supported values: ['error', 'warn', 'info', 'verbose', 'debug', 'silly']
   */
  loggingLevelForAlert: string;

  /**
   * Maximum level of messages to log to console.
   * Supported values: ['error', 'warn', 'info', 'verbose', 'debug', 'silly']
   */
  loggingLevelForConsole: string;
}

export interface IConfiguration {
  killRingMax: number;
  markRingMax: number;

  /**
   * Same to kill-whole-line variable in Emacs.
   */
  killWholeLine: boolean;

  /**
   * Simulate strictly the original emacs's cursor movements or preserve VSCode's native ones
   */
  strictEmacsMove: boolean;

  /**
   * Clear selections before forwardChar/backwardChar when mark mode is off (Emacs-like) or keep VS Code's default collapse behavior
   */
  clearSelectionBeforeCharMove: boolean;

  /**
   * Enable Shift Selection behavior on movement commands
   */
  shiftSelectMode: boolean;

  enableOverridingTypeCommand: boolean;

  /**
   * When true, line-move moves point by visual lines (same as an Emacs variable line-move-visual).
   */
  lineMoveVisual: boolean;

  moveBeginningOfLineBehavior: "vscode" | "emacs";
  moveEndOfLineBehavior: "vscode" | "emacs";
  scrollUpCommandBehavior: "vscode" | "emacs";
  scrollDownCommandBehavior: "vscode" | "emacs";
  wordNavigationStyle: "vscode" | "emacs";

  /**
   * Column at which comment-dwim inserts end-of-line comments.
   */
  commentColumn: number;

  /**
   * Map of languageId → comment delimiter.
   * Accepts a string (line comment) or {start, end} (block comment).
   * Overrides/extends the built-in defaults.
   */
  commentSyntax: Record<string, string | { start: string; end: string }>;

  /**
   * Extension debugging settings
   */
  debug: IDebugConfiguration;
}
