import * as dotenv from 'dotenv';

import { IConfig } from './config.interface';

dotenv.config();

export default (): IConfig => ({
  port: parseInt(process.env.PORT ?? '3000', 10),

  jwt: {
    accessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME || '1h',
    accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || 'defaultAccessTokenSecret',
    refreshTokenExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME || '7d',
    refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || 'defaultRefreshTokenSecret',
  },

  newPasswordBytes: 4,
  codeBytes: 2,
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || '',
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || '',
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
});
