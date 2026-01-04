/**
 * Error Monitoring and Reporting System
 * Centralized error tracking with retry logic and user-friendly error handling
 */

interface ErrorContext {
  userId?: string;
  operation?: string;
  component?: string;
  metadata?: Record<string, any>;
}

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
}

class ErrorMonitor {
  private errors: Array<{
    error: Error;
    context: ErrorContext;
    timestamp: number;
    resolved: boolean;
  }> = [];
  private readonly maxErrors = 500;

  /**
   * Report an error with context
   */
  reportError(error: Error | unknown, context: ErrorContext = {}): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    const errorReport = {
      error: errorObj,
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      },
      timestamp: Date.now(),
      resolved: false,
    };

    this.errors.push(errorReport);

    // Keep only last N errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if ((typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) || process.env.NODE_ENV === 'development') {
      console.error('[ErrorMonitor]', errorObj, context);
    }

    // In production, you could send to Sentry, LogRocket, etc.
    // Example: Sentry.captureException(errorObj, { extra: context });
  }

  /**
   * Retry an async operation with exponential backoff
   */
  async withRetry<T>(
    operation: string,
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      exponentialBackoff = true,
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries) {
          const delay = exponentialBackoff
            ? retryDelay * Math.pow(2, attempt)
            : retryDelay;

          console.warn(
            `[Retry] ${operation} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`
          );

          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          this.reportError(lastError, {
            operation,
            metadata: { attempts: attempt + 1, maxRetries },
          });
          throw lastError;
        }
      }
    }

    throw lastError || new Error('Unknown error in retry logic');
  }

  /**
   * Wrap a function with error handling
   */
  wrap<T extends (...args: any[]) => any>(
    fn: T,
    context: ErrorContext = {}
  ): T {
    return ((...args: Parameters<T>) => {
      try {
        const result = fn(...args);
        if (result instanceof Promise) {
          return result.catch((error) => {
            this.reportError(error, {
              ...context,
              metadata: { args: JSON.stringify(args) },
            });
            throw error;
          });
        }
        return result;
      } catch (error) {
        this.reportError(error, {
          ...context,
          metadata: { args: JSON.stringify(args) },
        });
        throw error;
      }
    }) as T;
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    unresolved: number;
    byOperation: Record<string, number>;
    recentErrors: Array<{ error: string; operation?: string; timestamp: number }>;
  } {
    const unresolved = this.errors.filter((e) => !e.resolved);
    const byOperation: Record<string, number> = {};

    this.errors.forEach((e) => {
      const op = e.context.operation || 'unknown';
      byOperation[op] = (byOperation[op] || 0) + 1;
    });

    const recentErrors = this.errors
      .slice(-10)
      .map((e) => ({
        error: e.error.message,
        operation: e.context.operation,
        timestamp: e.timestamp,
      }));

    return {
      total: this.errors.length,
      unresolved: unresolved.length,
      byOperation,
      recentErrors,
    };
  }

  /**
   * Clear all errors
   */
  clear(): void {
    this.errors = [];
  }
}

// Singleton instance
export const errorMonitor = new ErrorMonitor();

/**
 * React hook for error monitoring
 */
export function useErrorMonitor() {
  const reportError = React.useCallback(
    (error: Error | unknown, context?: ErrorContext) => {
      errorMonitor.reportError(error, context);
    },
    []
  );

  const withRetry = React.useCallback(
    <T,>(
      operation: string,
      fn: () => Promise<T>,
      options?: RetryOptions
    ): Promise<T> => {
      return errorMonitor.withRetry(operation, fn, options);
    },
    []
  );

  return { reportError, withRetry };
}

// Export React for the hook
import React from 'react';

