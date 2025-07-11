// Centralized configuration management with validation

interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  auth: {
    googleClientId: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
}

// Validate required environment variables
const validateConfig = (): AppConfig => {
  const requiredEnvVars = {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  };

  // Check for missing required variables
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      `Please check your .env file and ensure all required variables are set.`
    );
  }

  // Validate API URL format
  try {
    new URL(requiredEnvVars.VITE_API_BASE_URL);
  } catch {
    throw new Error(`Invalid API URL format: ${requiredEnvVars.VITE_API_BASE_URL}`);
  }

  return {
    api: {
      baseUrl: requiredEnvVars.VITE_API_BASE_URL.replace(/\/+$/, ''), // Remove trailing slashes
      timeout: 30000,
      retryAttempts: 3,
    },
    auth: {
      googleClientId: requiredEnvVars.VITE_GOOGLE_CLIENT_ID,
    },
    app: {
      name: import.meta.env.VITE_APP_NAME || "Will's Attic",
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: (import.meta.env.MODE as any) || 'development',
    },
  };
};

// Export validated configuration
export const config = validateConfig();

// Environment helpers
export const isDevelopment = config.app.environment === 'development';
export const isProduction = config.app.environment === 'production';
export const isStaging = config.app.environment === 'staging';

// Debug helper
if (isDevelopment) {
  console.log('🔧 App Configuration:', {
    ...config,
    auth: { ...config.auth, googleClientId: '[REDACTED]' } // Don't log sensitive data
  });
}