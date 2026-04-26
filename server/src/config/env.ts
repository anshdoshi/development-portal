import 'dotenv/config';

interface EnvConfig {
  PORT: number;
  CLIENT_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env: EnvConfig = {
  PORT: parseInt(getEnvVar('PORT', '5000'), 10),
  CLIENT_URL: getEnvVar('CLIENT_URL', 'http://localhost:5173'),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '24h'),
  SUPABASE_URL: getEnvVar('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
};

export default env;
