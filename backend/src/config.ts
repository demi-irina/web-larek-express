import 'dotenv/config';

export const { PORT = '3000' } = process.env;
export const { DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek' } = process.env;
