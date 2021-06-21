import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SocialAccount, User } from '../entities';

const type: any = String(process.env.DB_TYPE);

export const typeormConfig: TypeOrmModuleOptions = {
  type: type,
  host: process.env.DB_HOST,
  port: Number(process.env.MARIADB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DEFAULT_DATABASE,
  synchronize: true,
  charset: process.env.DB_CHARSET,
  keepConnectionAlive: true,
  logging: true,
  entities: [User, SocialAccount],
};
