/**
 * Performance Metrics and Logging System
 * Tracks execution times, database query performance, and real-time operation metrics
 */

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceLogger {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics
  private readonly enableConsoleLog = (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) || process.env.NODE_ENV === 'development';

  /**
   * Measure execution time of an async operation
   */
  async measure<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(operation, duration, { ...metadata, success: true });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration, {
        ...metadata,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Measure execution time of a sync operation
   */
  measureSync<T>(
    operation: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.recordMetric(operation, duration, { ...metadata, success: true });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration, {
        ...metadata,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(
    operation: string,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log in development
    if (this.enableConsoleLog) {
      const status = metadata?.success ? '✓' : '✗';
      console.log(
        `[Performance] ${status} ${operation}: ${duration.toFixed(2)}ms`,
        metadata || ''
      );
    }

    // Log slow operations (>1s)
    if (duration > 1000) {
      console.warn(
        `[Performance Warning] Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`,
        metadata
      );
    }
  }

  /**
   * Get performance statistics for an operation
   */
  getStats(operation: string): {
    count: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    totalDuration: number;
    successRate: number;
  } | null {
    const operationMetrics = this.metrics.filter((m) => m.operation === operation);
    if (operationMetrics.length === 0) return null;

    const durations = operationMetrics.map((m) => m.duration);
    const successes = operationMetrics.filter((m) => m.metadata?.success !== false).length;

    return {
      count: operationMetrics.length,
      avgDuration:
        durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      totalDuration: durations.reduce((a, b) => a + b, 0),
      successRate: (successes / operationMetrics.length) * 100,
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Get summary of all operations
   */
  getSummary(): Record<string, ReturnType<typeof this.getStats>> {
    const operations = new Set(this.metrics.map((m) => m.operation));
    const summary: Record<string, ReturnType<typeof this.getStats>> = {};

    operations.forEach((op) => {
      const stats = this.getStats(op);
      if (stats) {
        summary[op] = stats;
      }
    });

    return summary;
  }
}

// Singleton instance
export const performanceLogger = new PerformanceLogger();

/**
 * Decorator/HOC for measuring React component render times
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function TrackedComponent(props: P) {
    const start = performance.now();

    React.useEffect(() => {
      const duration = performance.now() - start;
      performanceLogger.recordMetric(
        `render:${componentName}`,
        duration,
        { propsCount: Object.keys(props).length }
      );
    });

    return React.createElement(Component, props);
  };
}

// Export React for the HOC
import React from 'react';

