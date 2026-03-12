import type { IConfiguration } from "../../configuration/iconfiguration";
import type { ILogger } from "../common/logger";

const LOG_PRIORITIES = ["error", "warn", "info", "verbose", "debug"] as const;

function logPriorityIndex(level: string): number {
  return (LOG_PRIORITIES as readonly string[]).indexOf(level);
}

/**
 * Browser logger implementation using console methods.
 * Mirrors the node LoggerImpl interface for platform consistency.
 */
class BrowserLogger implements ILogger {
  private readonly prefix: string;
  private configuration: IConfiguration | undefined;
  private priorityThreshold = -1;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  public error(errorMessage: string): void {
    this.log("error", errorMessage);
  }

  public debug(debugMessage: string): void {
    this.log("debug", debugMessage);
  }

  public warn(warnMessage: string): void {
    this.log("warn", warnMessage);
  }

  public verbose(verboseMessage: string): void {
    this.log("verbose", verboseMessage);
  }

  public configChanged(configuration: IConfiguration): void {
    this.configuration = configuration;
    this.priorityThreshold = logPriorityIndex(configuration.debug.loggingLevelForConsole);
  }

  private log(level: string, message: string): void {
    if (this.configuration?.debug.silent) {
      return;
    }

    const priority = logPriorityIndex(level);
    if (this.priorityThreshold >= 0 && priority >= 0 && priority > this.priorityThreshold) {
      return;
    }

    const formatted = `${this.prefix}: ${message}`;
    switch (level) {
      case "error":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "info":
        console.log(formatted);
        break;
      case "verbose":
      case "debug":
        console.debug(formatted);
        break;
      default:
        console.log(formatted);
        break;
    }
  }
}

export class LoggerImpl {
  static get(prefix: string): ILogger {
    return new BrowserLogger(prefix);
  }
}
