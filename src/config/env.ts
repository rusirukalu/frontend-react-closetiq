// src/config/env.ts - Centralized Environment Configuration
export const env = {
    AI_BACKEND_URL: import.meta.env.VITE_AI_BACKEND_URL || 'http://localhost:5002',
    NODE_BACKEND_URL: import.meta.env.VITE_NODE_BACKEND_URL || 'http://localhost:8000',
    WEATHER_API_KEY: import.meta.env.VITE_WEATHER_API_KEY || '',
    APP_NAME: import.meta.env.VITE_APP_NAME || 'ClosetIQ',
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    IS_PRODUCTION: import.meta.env.PROD,
    IS_DEVELOPMENT: import.meta.env.DEV,
  } as const;
  
  // Type-safe environment checker
  export const checkRequiredEnvVars = () => {
    const requiredVars = {
      AI_BACKEND_URL: env.AI_BACKEND_URL,
      NODE_BACKEND_URL: env.NODE_BACKEND_URL,
    };
  
    const missing = Object.entries(requiredVars)
      .filter(([_, value]) => !value)
      .map(([key]) => `VITE_${key}`);
  
    if (missing.length > 0) {
      console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    }
  
    return missing.length === 0;
  };
  
  // Debug helper (only in development)
  if (env.IS_DEVELOPMENT) {
    console.log('🔧 Environment Configuration:', {
      AI_BACKEND_URL: env.AI_BACKEND_URL,
      NODE_BACKEND_URL: env.NODE_BACKEND_URL,
      IS_PRODUCTION: env.IS_PRODUCTION,
    });
  }
  