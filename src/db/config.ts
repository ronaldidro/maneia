import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import type { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const getDbConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get<string>('database.host'),
  port: config.get<number>('database.port'),
  username: config.get<string>('database.user'),
  password: config.get<string>('database.pass'),
  database: config.get<string>('database.name'),
  entities: [__dirname + '/../**/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../db/migrations/*{.ts,.js}'],
  logging: process.env.NODE_ENV === 'dev',
  ssl: { rejectUnauthorized: false },
  namingStrategy: new SnakeNamingStrategy(),
});

export default getDbConfig;
