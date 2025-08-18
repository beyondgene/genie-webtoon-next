// sequelize.config.js
const fs = require('fs');
const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';
// NODE_ENV=production이면 .env.production, 아니면 .env.local을 우선 사용
const path = env === 'production' ? '.env.production' : '.env.local';
if (fs.existsSync(path)) {
  dotenv.config({ path }); // <- 여기서 .env.local / .env.production 읽음
} else {
  dotenv.config(); // <- fallback: .env
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

module.exports = {
  development: { ...base },
  production: { ...base, logging: false },
  test: { ...base, database: process.env.MYSQL_TEST_DB || 'test' },
};
