/**
 * This file provides the configuration for handling database connection pooling.
 * It defines environment variables that should be set in your .env file or deployment platform.
 */

export const DB_CONNECTION_SETTINGS = {
  // Set a reasonable connection limit based on your application's needs
  // For most applications, a value between 5-10 is sufficient
  CONNECTION_LIMIT: 5,
  
  // Set a timeout for obtaining a connection from the pool (in seconds)
  // A value of 5-10 seconds is typically sufficient
  POOL_TIMEOUT: 5,
  
  // For serverless environments, consider using a connection pooler like PgBouncer
  // or use Prisma Accelerate which has built-in connection pooling
}

/**
 * Add these connection pooling parameters to your DATABASE_URL in .env:
 * 
 * DATABASE_URL="postgresql://username:password@hostname:port/database?connection_limit=5&pool_timeout=5"
 * 
 * If you're using Prisma Accelerate, you don't need to add these parameters
 * as Accelerate provides built-in connection pooling.
 */

export function getPooledDatabaseUrl(originalUrl: string): string {
  // Don't modify the URL if it's already a Prisma Accelerate URL
  if (originalUrl.startsWith('prisma://') || originalUrl.includes('accelerate')) {
    return originalUrl;
  }
  
  const url = new URL(originalUrl);
  
  // Add connection pooling parameters if they don't exist
  if (!url.searchParams.has('connection_limit')) {
    url.searchParams.set('connection_limit', DB_CONNECTION_SETTINGS.CONNECTION_LIMIT.toString());
  }
  
  if (!url.searchParams.has('pool_timeout')) {
    url.searchParams.set('pool_timeout', DB_CONNECTION_SETTINGS.POOL_TIMEOUT.toString());
  }
  
  return url.toString();
} 