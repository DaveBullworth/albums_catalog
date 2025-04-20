// Environment Configuration
module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,

  // Authentication Configuration
  TOKEN_EXPIRES_IN: '24h',

  // Cookie Configuration
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Environment Flags
  IS_PRODUCTION: process.env.NODE_ENV === 'production',

  // API Endpoints
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5000/api',

  // Frontend URL for CORS
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
};
