export default () => ({
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  secret: process.env.SECRET,
  client: {
    url: process.env.CLIENT_URL,
  },
  database: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    pass: process.env.DATABASE_PASS,
    name: process.env.DATABASE_NAME,
  },
  queue: {
    host: process.env.QUEUE_HOST,
    port: process.env.QUEUE_PORT,
    user: process.env.QUEUE_USER,
    pass: process.env.QUEUE_PASS,
  },
  mailer: {
    sender: process.env.MAIL_SENDER,
    client_id: process.env.MAIL_CLIENT_ID,
    client_secret: process.env.MAIL_CLIENT_SECRET,
    refresh_token: process.env.MAIL_REFRESH_TOKEN,
  },
  board: {
    user: process.env.BOARD_USER,
    pass: process.env.BOARD_PASS,
  },
});
