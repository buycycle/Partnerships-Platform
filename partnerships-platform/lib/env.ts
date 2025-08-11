// Environment configuration helper
export const env = {
  // OAuth Configuration
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  APPLE_CLIENT_ID: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || '',
  
  // API Configuration  
  BUYCYCLE_API_URL: process.env.NEXT_PUBLIC_BUYCYCLE_API_URL || 'https://api.buycycle.com',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sponsorship.buycycle.com',
  BUYCYCLE_API_KEY: process.env.NEXT_PUBLIC_BUYCYCLE_API_KEY || '',
  DEFAULT_AUTH_TOKEN: process.env.NEXT_PUBLIC_DEFAULT_AUTH_TOKEN || '',
  
  // Domain Configuration
  PRODUCTION_DOMAIN: process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || 'sponsorship.buycycle.com',
  
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || '',
  MYSQL_HOST: process.env.MYSQL_HOST || '',
  MYSQL_USER: process.env.MYSQL_USER || '',
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || '',
  MYSQL_DATABASE: process.env.MYSQL_DATABASE || '',
  MYSQL_PORT: process.env.MYSQL_PORT || '3306',
  
  // AWS Configuration
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_REGION: process.env.AWS_REGION || 'eu-central-1',
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET || 'buycycle-videos',
  
  // Analytics Configuration
  MIXPANEL_TOKEN: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '',
  MIXPANEL_DEV: process.env.NEXT_PUBLIC_MIXPANEL_DEV === 'true',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Helper functions
  getBaseUrl: () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    
    // For server-side rendering
    if (env.NODE_ENV === 'production') {
      return `https://${env.PRODUCTION_DOMAIN}`;
    }
    
    return 'http://localhost:3000';
  },
  
  getReturnUrl: () => {
    // Since host and return are the same domain, just return the base URL
    return env.getBaseUrl();
  }
}; 