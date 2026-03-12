import * as vscode from "vscode";
import type { IConfiguration } from "../../configuration/iconfiguration";
import type { ILogger } from "../common/logger";

const LOG_PRIORITIES = ["error", "warn", "info", "verbose", "debug"] as const;
type LogLevel = (typeof LOG_PRIORITIES)[number];

function logPriorityIndex(level: string): number {
  return LOG_PRIORITIES.indexOf(level as LogLevel);
}

/**
 * Logger backed by VS Code's built-in LogOutputChannel.
 * Replaces the former Winston-based implementation, eliminating all runtime npm dependencies.
 */
class NodeLogger implements ILogger {
  private readonly prefix: string;
  private configuration: IConfiguration | undefined;

  private static outputChannel: vscode.LogOutputChannel | undefined;

  static getOutputChannel(): vscode.LogOutputChannel {
    if (!NodeLogger.outputChannel) {
      NodeLogger.outputChannel = vscode.window.createOutputChannel("Emacs Keymap", { log: true });
    }
    return NodeLogger.outputChannel;
  }

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  public error(errorMessage: string): void {
    NodeLogger.getOutputChannel().error(`${this.prefix}: ${errorMessage}`);
    this.showAlert("error", errorMessage);
  }

  public debug(debugMessage: string): void {
    NodeLogger.getOutputChannel().debug(`${this.prefix}: ${debugMessage}`);
  }

  public warn(warnMessage: string): void {
    NodeLogger.getOutputChannel().warn(`${this.prefix}: ${warnMessage}`);
    this.showAlert("warn", warnMessage);
  }

  public verbose(verboseMessage: string): void {
    NodeLogger.getOutputChannel().trace(`${this.prefix}: ${verboseMessage}`);
  }

  public configChanged(configuration: IConfiguration): void {
    this.configuration = configuration;
  }

  private showAlert(level: LogLevel, message: string): void {
    if (this.configuration?.debug.silent) {
      return;
    }

    const alertThreshold = logPriorityIndex(this.configuration?.debug.loggingLevelForAlert ?? "error");
    const messagePriority = logPriorityIndex(level);
    if (alertThreshold < 0 || messagePriority < 0 || messagePriority > alertThreshold) {
      return;
    }

    const fullMessage = `${this.prefix}: ${message}`;
    if (level === "error") {
      void vscode.window.showErrorMessage(fullMessage);
    } else if (level === "warn") {
      void vscode.window.showWarningMessage(fullMessage);
    }
  }
}

export class LoggerImpl {
  static get(prefix: string): ILogger {
    return new NodeLogger(prefix);
  }

  static dispose(): void {
    NodeLogger.getOutputChannel().dispose();
  }
}
