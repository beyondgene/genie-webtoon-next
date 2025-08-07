import { Sequelize } from 'sequelize-typescript';
import * as Models from '@/models';

let sequelize: Sequelize;

/**
 * Sequelize 인스턴스를 초기화하고 모델을 등록합니다.
 */
export function initDB() {
  if (!sequelize) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not defined');
    sequelize = new Sequelize(url, {
      dialect: 'mysql',
      logging: false,
    });
    Object.values(Models).forEach((model: any) => {
      if (typeof model === 'function') {
        sequelize.addModels([model]);
      }
    });
  }
  return sequelize;
}
