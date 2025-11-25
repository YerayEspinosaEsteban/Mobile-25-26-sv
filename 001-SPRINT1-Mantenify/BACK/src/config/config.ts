import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  postgres: {
    dbName: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  },
  api: {
    key: process.env.API_KEY,
    keyProd: process.env.API_KEY_PROD,
  },
  environment: process.env.NODE_ENV || 'dev',
  aws: {
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_S3_BUCKET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
}));
