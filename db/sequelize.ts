// db/sequelize.ts
import 'mysql2';
import { Sequelize } from 'sequelize';

//orm sequelize를 사용하기 위한 기본설정 ts파일
function createSequelize(): Sequelize {
  const url = process.env.DATABASE_URL;
  const logging = process.env.DB_LOGGING === 'true' ? console.log : false;
  const useSSL = String(process.env.MYSQL_SSL ?? 'false').toLowerCase() === 'true';

  const common = {
    logging,
    dialect: 'mysql' as const,
    pool: { max: 10, min: 0, idle: 10_000, acquire: 30_000 },
    dialectOptions: {} as any,
  };

  if (useSSL) {
    (common.dialectOptions as any).ssl = { require: true, rejectUnauthorized: true };
  }

  if (url) {
    // mysql://user:pass@host:3306/dbname?timezone=Z&ssl=false
    return new Sequelize(url, common);
  }

  // 개별 변수 방식 (.env에 MYSQL_* 로 넣은 경우)
  const host = process.env.MYSQL_HOST!;
  const port = Number(process.env.MYSQL_PORT ?? 3306);
  const database = process.env.MYSQL_DB!;
  const username = process.env.MYSQL_USER!;
  const password = process.env.MYSQL_PASSWORD!;

  return new Sequelize(database, username, password, { host, port, ...common });
}

declare global {
  // Next.js 핫리로드에서 싱글턴 유지
  // eslint-disable-next-line no-var
  var __SEQUELIZE__: Sequelize | undefined;
}

export const sequelize: Sequelize = global.__SEQUELIZE__ ?? createSequelize();
if (!global.__SEQUELIZE__) global.__SEQUELIZE__ = sequelize;
