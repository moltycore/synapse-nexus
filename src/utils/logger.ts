export type LogLevel = 'info' | 'warn' | 'error' | 'critical';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
}

class SynapseLogger {
  private static instance: SynapseLogger;

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

    switch (level) {
      case 'info':
        console.info(formattedMessage, context || '');
        break;
      case 'warn':
        console.warn(formattedMessage, context || '');
        break;
      case 'error':
      case 'critical':
        console.error(formattedMessage, context || '');
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
