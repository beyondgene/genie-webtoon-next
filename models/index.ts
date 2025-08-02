import { Sequelize } from 'sequelize';
import { config as dotenvConfig } from 'dotenv';
import dbConfig from '../config/config.json';

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

const env = process.env.NODE_ENV || 'development';
const config = (dbConfig as any)[env];

const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable] as string, config)
  : new Sequelize(config.database, config.username, config.password, config);

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
