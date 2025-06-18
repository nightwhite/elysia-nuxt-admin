export const config = {
  PORT: process.env.PORT || 3001,
  ENV: process.env.NODE_ENV || 'development',
  API_PREFIX: '/api',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '24h'
}; 