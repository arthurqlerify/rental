import dotenv from 'dotenv';
dotenv.config();

export default {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  db: {
    type: process.env.DB_TYPE || 'memory',
    uri: process.env.DB_URI || ''
  },
  test: {
    framework: process.env.TEST_FRAMEWORK || 'jest'
  }
};
