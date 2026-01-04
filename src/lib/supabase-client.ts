/**
 * Enhanced Supabase client with error monitoring and retry logic
 */
import { supabase } from './supabase';
import { errorMonitor } from './error-monitor';
import { performanceLogger } from './performance';

/**
 * Execute a Supabase query with error handling and retry logic
 */
export async function executeQuery<T>(
  operation: string,
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options?: { retries?: number; retryDelay?: number }
): Promise<T> {
  return errorMonitor.withRetry(
    operation,
    async () => {
      return performanceLogger.measure(operation, async () => {
        const { data, error } = await queryFn();

        if (error) {
          const dbError = new Error(
            `Database error in ${operation}: ${error.message}`
          );
          errorMonitor.reportError(dbError, {
            operation,
            metadata: { supabaseError: error },
          });
          throw dbError;
        }

        if (data === null) {
          throw new Error(`No data returned from ${operation}`);
        }

        return data;
      });
    },
    {
      maxRetries: options?.retries ?? 3,
      retryDelay: options?.retryDelay ?? 1000,
      exponentialBackoff: true,
    }
  );
}

/**
 * Execute a Supabase mutation with error handling and retry logic
 */
export async function executeMutation<T>(
  operation: string,
  mutationFn: () => Promise<{ data: T | null; error: any }>,
  options?: { retries?: number; retryDelay?: number }
): Promise<T> {
  return errorMonitor.withRetry(
    operation,
    async () => {
      return performanceLogger.measure(operation, async () => {
        const { data, error } = await mutationFn();

        if (error) {
          const dbError = new Error(
            `Database error in ${operation}: ${error.message}`
          );
          errorMonitor.reportError(dbError, {
            operation,
            metadata: { supabaseError: error },
          });
          throw dbError;
        }

        if (data === null) {
          throw new Error(`No data returned from ${operation}`);
        }

        return data;
      });
    },
    {
      maxRetries: options?.retries ?? 2, // Fewer retries for mutations
      retryDelay: options?.retryDelay ?? 1000,
      exponentialBackoff: true,
    }
  );
}

/**
 * Check Supabase connection health
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('skills').select('count').limit(1);
    return !error;
  } catch (error) {
    errorMonitor.reportError(error, { operation: 'checkConnection' });
    return false;
  }
}

