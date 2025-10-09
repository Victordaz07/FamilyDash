/**
 * 📝 Logger Service - FamilyDash
 * Servicio profesional de logging con niveles y tracking
 */

// Determinar si estamos en desarrollo
const __DEV__ = process.env.NODE_ENV !== 'production';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  data?: any;
  stack?: string;
}

class LoggerService {
  private static instance: LoggerService;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000; // Máximo de logs en memoria
  private enableConsole: boolean = __DEV__;
  private enableTracking: boolean = !__DEV__; // Enviar a servicio externo en producción

  private constructor() {}

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  /**
   * Log de debug (solo en desarrollo)
   */
  public debug(message: string, data?: any): void {
    if (__DEV__) {
      this.log(LogLevel.DEBUG, message, data);
    }
  }

  /**
   * Log informativo
   */
  public info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log de advertencia
   */
  public warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log de error
   */
  public error(message: string, error?: any): void {
    const stack = error?.stack || new Error().stack;
    this.log(LogLevel.ERROR, message, error, stack);

    // En producción, enviar a servicio de tracking (Sentry, etc.)
    if (this.enableTracking) {
      this.sendToTrackingService(LogLevel.ERROR, message, error, stack);
    }
  }

  /**
   * Log de error fatal
   */
  public fatal(message: string, error?: any): void {
    const stack = error?.stack || new Error().stack;
    this.log(LogLevel.FATAL, message, error, stack);

    // Siempre enviar errores fatales
    if (this.enableTracking) {
      this.sendToTrackingService(LogLevel.FATAL, message, error, stack);
    }
  }

  /**
   * Log genérico
   */
  private log(level: LogLevel, message: string, data?: any, stack?: string): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      data,
      stack,
    };

    // Guardar en memoria
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Eliminar el más antiguo
    }

    // Mostrar en consola si está habilitado
    if (this.enableConsole) {
      this.logToConsole(entry);
    }
  }

  /**
   * Mostrar log en consola con formato
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${entry.level}] [${timestamp}]`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.log(`${prefix} ${entry.message}`, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ${entry.message}`, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${entry.message}`, entry.data || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(`${prefix} ${entry.message}`, entry.data || '');
        if (entry.stack) {
          console.error('Stack trace:', entry.stack);
        }
        break;
    }
  }

  /**
   * Enviar a servicio de tracking externo (Sentry, etc.)
   */
  private sendToTrackingService(
    level: LogLevel,
    message: string,
    data?: any,
    stack?: string
  ): void {
    // TODO: Integrar con Sentry, LogRocket, o servicio similar
    // Por ahora, solo guardamos local
    console.error('[TRACKING]', { level, message, data, stack });
  }

  /**
   * Obtener logs recientes
   */
  public getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Obtener logs por nivel
   */
  public getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Limpiar logs antiguos
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * Exportar logs para debugging
   */
  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Configurar opciones del logger
   */
  public configure(options: {
    enableConsole?: boolean;
    enableTracking?: boolean;
    maxLogs?: number;
  }): void {
    if (options.enableConsole !== undefined) {
      this.enableConsole = options.enableConsole;
    }
    if (options.enableTracking !== undefined) {
      this.enableTracking = options.enableTracking;
    }
    if (options.maxLogs !== undefined) {
      this.maxLogs = options.maxLogs;
    }
  }
}

// Exportar instancia singleton
const Logger = LoggerService.getInstance();
export default Logger;

// Exportar métodos directamente para conveniencia
export const log = {
  debug: (message: string, data?: any) => Logger.debug(message, data),
  info: (message: string, data?: any) => Logger.info(message, data),
  warn: (message: string, data?: any) => Logger.warn(message, data),
  error: (message: string, error?: any) => Logger.error(message, error),
  fatal: (message: string, error?: any) => Logger.fatal(message, error),
};
