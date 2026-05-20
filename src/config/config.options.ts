import { validate } from '@/config/env.validation';
import { ConfigModuleOptions } from '@nestjs/config';

const loadEnv = () => ({
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  secret: process.env.SECRET,
  database: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    pass: process.env.DATABASE_PASS,
    name: process.env.DATABASE_NAME,
  },
});

const configOptions: ConfigModuleOptions = {
  envFilePath: '.env',
  load: [loadEnv],
  validate,
  isGlobal: true,
};

export default configOptions;
