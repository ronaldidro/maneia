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
    QUEUE_HOST: string;
    QUEUE_PORT: string;
    QUEUE_USER: string;
    QUEUE_PASS: string;
    MAIL_SENDER: string;
    MAIL_CLIENT_ID: string;
    MAIL_CLIENT_SECRET: string;
    MAIL_REFRESH_TOKEN: string;
    BOARD_USER: string;
    BOARD_PASS: string;
    TZ: string;
  }
}
