import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';
import { SeederOptions } from 'typeorm-extension';

dotenv.config();

export const dataSourceOptions: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/db/migrations/*{.ts,.js}'],
  seeds: ['dist/db/seeds/*{.ts,.js}'],
  logging: process.env.NODE_ENV === 'dev',
  ssl: { rejectUnauthorized: false },
  namingStrategy: new SnakeNamingStrategy(),
};

export default new DataSource(dataSourceOptions);
