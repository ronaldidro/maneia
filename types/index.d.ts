declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    PORT: string;
    SECRET: string;
    ADMIN_PASS: string;
    CLIENT_URL: string;
    DATABASE_HOST: string;
    DATABASE_PORT: string;
    DATABASE_USER: string;
    DATABASE_PASS: string;
    DATABASE_NAME: string;
    MAIL_SENDER: string;
    MAIL_CLIENT_ID: string;
    MAIL_CLIENT_SECRET: string;
    MAIL_REFRESH_TOKEN: string;
    TZ: string;
  }
}
