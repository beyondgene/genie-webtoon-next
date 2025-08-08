import { Sequelize } from 'sequelize';
import { config as dotenvConfig } from 'dotenv';

import { Admin } from './admin';
import { Artist } from './artist';
import { Member } from './member';
import { Advertisement } from './advertisement';
import { Webtoon } from './webtoon';
import { Episode } from './episode';
import { Comment } from './comment';
import { Subscription } from './subscription';
import { AdViewLog } from './ad_view_log';

dotenvConfig();

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is not defined');
}

const sequelize = new Sequelize(url, {
  dialect: 'mysql',
  logging: false,
});

const db: any = {
  sequelize,
  Sequelize,
};

db.Admin = Admin.initModel(sequelize);
db.Artist = Artist.initModel(sequelize);
db.Member = Member.initModel(sequelize);
db.Advertisement = Advertisement.initModel(sequelize);
db.Webtoon = Webtoon.initModel(sequelize);
db.Episode = Episode.initModel(sequelize);
db.Comment = Comment.initModel(sequelize);
db.Subscription = Subscription.initModel(sequelize);
db.AdViewLog = AdViewLog.initModel(sequelize);

Object.values(db).forEach((model: any) => {
  if (model.associate) {
    model.associate(db);
  }
});

export default db;
