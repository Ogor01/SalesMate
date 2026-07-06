type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  userId?: string;
  context?: Record<string, unknown>;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || "info";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatLog(entry: LogEntry): string {
  return JSON.stringify({
    ...entry,
    environment: process.env.NODE_ENV || "development",
  });
}

function log(level: LogLevel, message: string, opts?: { userId?: string; context?: Record<string, unknown> }) {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    userId: opts?.userId,
    context: opts?.context,
  };

  const formatted = formatLog(entry);

  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "debug":
      console.debug(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  debug: (msg: string, opts?: { userId?: string; context?: Record<string, unknown> }) =>
    log("debug", msg, opts),
  info: (msg: string, opts?: { userId?: string; context?: Record<string, unknown> }) =>
    log("info", msg, opts),
  warn: (msg: string, opts?: { userId?: string; context?: Record<string, unknown> }) =>
    log("warn", msg, opts),
  error: (msg: string, opts?: { userId?: string; context?: Record<string, unknown>; error?: Error }) => {
    const ctx = { ...opts?.context };
    if (opts?.error) {
      ctx.errorMessage = opts.error.message;
      ctx.stack = opts.error.stack;
    }
    log("error", msg, { ...opts, context: ctx });
  },
};
