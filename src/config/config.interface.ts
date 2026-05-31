interface IJWT {
  accessTokenSecret: string;
  accessTokenExpiration: string;
  refreshTokenSecret: string;
  refreshTokenExpiration;
}


export interface IConfig {
  port: number;
  jwt: IJWT;
  newPasswordBytes: number;
  codeBytes: number;
  R2_ACCOUNT_ID: string;
  R2_BUCKET_NAME: string;
  R2_PUBLIC_URL: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
}
