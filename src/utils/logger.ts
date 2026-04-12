export type LogLevel = 'info' | 'warn' | 'error' | 'critical';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
}

class SynapseLogger {
  private static instance: SynapseLogger;
  private isProd = import.meta.env.PROD;

  private constructor() {}

  public static getInstance(): SynapseLogger {
    if (!SynapseLogger.instance) {
      SynapseLogger.instance = new SynapseLogger();
    }
    return SynapseLogger.instance;
  }

  private formatMessage(entry: LogEntry): string {
    return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString()
    };

    const formattedMessage = this.formatMessage(entry);
    const logArgs = context ? [formattedMessage, context] : [formattedMessage];

    switch (level) {
      case 'info':
        if (!this.isProd) console.info(...logArgs);
        break;
      case 'warn':
        if (!this.isProd) console.warn(...logArgs);
        break;
      case 'error':
        console.error(...logArgs);
        break;
      case 'critical':
        console.error('[CRITICAL_FAILURE]', ...logArgs);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('synapse-critical', { detail: entry }));
        }
        break;
    }
  }

  public info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  public warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  public error(message: string, context?: Record<string, any>) {
    this.log('error', message, context);
  }

  public critical(message: string, context?: Record<string, any>) {
    this.log('critical', message, context);
  }
}

export const logger = SynapseLogger.getInstance();
