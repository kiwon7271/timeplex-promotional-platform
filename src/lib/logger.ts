type LogContext = Record<string, unknown>;

const formatContext = (context?: LogContext) =>
  context && Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : "";

/** 중앙 로깅 — console 기반 */
export const log = {
  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[debug] ${message}${formatContext(context)}`);
    }
  },
  info: (message: string, context?: LogContext) => {
    console.info(`[info] ${message}${formatContext(context)}`);
  },
  warn: (message: string, context?: LogContext) => {
    console.warn(`[warn] ${message}${formatContext(context)}`);
  },
  error: (message: string, error?: unknown, context?: LogContext) => {
    const detail =
      error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error;
    console.error(`[error] ${message}${formatContext({ ...context, error: detail })}`);
  },
};

export const captureRouteError = (route: string, error: unknown, context?: LogContext) => {
  log.error(`Route handler error: ${route}`, error, context);
};

export const captureWebhookError = (channel: string, error: unknown, context?: LogContext) => {
  log.error(`Webhook error: ${channel}`, error, context);
};

export const captureJobError = (jobName: string, error: unknown, context?: LogContext) => {
  log.error(`Job error: ${jobName}`, error, context);
};
