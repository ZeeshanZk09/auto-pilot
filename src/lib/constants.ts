export const ENV = {
  AUTH_SECRET: process.env.AUTH_SECRET || '',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;
