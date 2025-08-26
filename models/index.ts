import { Sequelize } from 'sequelize';
import { sequelize as sequelizeInstance } from '@/db/sequelize';

import { Admin } from './admin';
import { Artist } from './artist';
import { Member } from './member';
import { Advertisement } from './advertisement';
import { Webtoon } from './webtoon';
import { Episode } from './episode';
import { Comment } from './comment';
import { Subscription } from './subscription';
import { AdViewLog } from './ad_view_log';
import { Interest } from './interest';
import { WebtoonViewStat } from './webtoonViewStat';

// 공용 인스턴스
export const sequelize: Sequelize = sequelizeInstance;

const db = {
  sequelize,
  Admin: Admin.initModel(sequelize),
  Artist: Artist.initModel(sequelize),
  Member: Member.initModel(sequelize),
  Advertisement: Advertisement.initModel(sequelize),
  Webtoon: Webtoon.initModel(sequelize),
  Episode: Episode.initModel(sequelize),
  Comment: Comment.initModel(sequelize),
  Subscription: Subscription.initModel(sequelize),
  AdViewLog: AdViewLog.initModel(sequelize),
  Interest: Interest.initModel(sequelize),
  WebtoonViewStat: WebtoonViewStat.initModel(sequelize),
} as const;

// 연관관계 설정 (associate가 있는 항목에만 호출)
Object.values(db).forEach((model: any) => {
  if (model && typeof model.associate === 'function') {
    model.associate(db);
  }
});

export default db;
