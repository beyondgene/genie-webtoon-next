// sequelize.config.js (ESM)
import fs from 'node:fs';
import { config as dotenvConfig } from 'dotenv';

const env = process.env.NODE_ENV || 'development';
// NODE_ENV=production이면 .env.production, 아니면 .env.local을 우선 사용
const envPath = env === 'production' ? '.env.production' : '.env.local';
if (fs.existsSync(envPath)) {
  dotenvConfig({ path: envPath }); // <- 여기서 .env.local / .env.production 읽음
} else {
  dotenvConfig(); // <- fallback: .env
}

const base = {
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT || 3306),
  dialect: 'mysql',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
};

const config = {
  development: { ...base },
  production: { ...base, logging: false },
  test: { ...base, database: process.env.MYSQL_TEST_DB || 'test' },
};

export default config;
