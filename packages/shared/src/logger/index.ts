import type { LogLevel, LogPretty } from './types';
import pino from 'pino';

interface CreateProxyLoggerOptions {
    level?: LogLevel;
    pretty?: LogPretty;
    prefix?: string;
}

export const createLogger = (options: CreateProxyLoggerOptions = {}) => {
    const { level = 'info', pretty = true, prefix = '' } = options;

    const baseLogger = pino({
        level,
        transport: pretty
            ? {
                  target: 'pino-pretty',
                  options: {
                      colorize: true,
                      translateTime: '[HH:MM:ss]',
                      ignore: 'pid,hostname',
                      singleLine: true,
                      levelFirst: false
                  }
              }
            : undefined,
        formatters: {
            level: label => {
                return { level: label.toUpperCase() };
            }
        },
        base: undefined
    });

    const handler: ProxyHandler<pino.Logger> = {
        get(target, property) {
            if (property === 'level' || property === 'child') {
                return target[property as keyof pino.Logger];
            }

            if (typeof target[property as keyof pino.Logger] === 'function') {
                return (...args: any[]) => {
                    if (typeof args[0] === 'string') {
                        args[0] = `${prefix ? `${prefix.toUpperCase()}: ` : ''}${args[0]}`;
                    }
                    return (target[property as keyof pino.Logger] as () => void).apply(target, args);
                };
            }

            return target[property as keyof pino.Logger];
        }
    };

    return new Proxy(baseLogger, handler);
};

export const logger = createLogger();
export * from './types';
