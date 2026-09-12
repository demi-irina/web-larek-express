import 'dotenv/config';
import { CookieOptions } from 'express';
import ms, { StringValue } from 'ms';
import path from 'path';

export const { PORT = '3000' } = process.env;
export const { DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek' } = process.env;
export const { ORIGIN_ALLOW = 'http://localhost:5173' } = process.env;

export const PUBLIC_DIR = path.join(__dirname, 'public');
export const UPLOAD_DIR = path.join(PUBLIC_DIR, process.env.UPLOAD_PATH || 'images');
export const UPLOAD_DIR_TEMP = path.join(PUBLIC_DIR, process.env.UPLOAD_PATH_TEMP || 'temp');

export const ACCESS_TOKEN = {
  secret: process.env.AUTH_ACCESS_TOKEN_SECRET || 'access-secret',
  expiry: process.env.AUTH_ACCESS_TOKEN_EXPIRY || '10m',
};

export const REFRESH_TOKEN = {
  secret: process.env.AUTH_REFRESH_TOKEN_SECRET || 'refresh-secret',
  expiry: process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d',
  cookie: {
    name: 'refreshToken',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: ms((process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d') as StringValue),
      path: '/',
    } as CookieOptions,
  },
};
