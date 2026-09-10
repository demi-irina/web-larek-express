import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import {
  DB_ADDRESS, ORIGIN_ALLOW, PORT, PUBLIC_DIR,
} from './config';
import NotFoundError from './errors/not-found-error';
import errorHandler from './middlewares/error-handler';
import { errorLogger, requestLogger } from './middlewares/logger';
import authRouter from './routes/auth';
import orderRouter from './routes/order';
import productRouter from './routes/product';
import uploadRouter from './routes/upload';

const app = express();

app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.use(express.static(PUBLIC_DIR));
app.use('/auth', authRouter);
app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use('/upload', uploadRouter);
app.use((_req, _res, next) => next(new NotFoundError('Маршрут не найден')));
app.use(errorLogger);
app.use(errorHandler);

mongoose
  .connect(DB_ADDRESS)
  .then(() => app.listen(Number(PORT), () => {
    // eslint-disable-next-line no-console
    console.log(`Сервер запущен на порту ${PORT}`);
  }))
  // eslint-disable-next-line no-console
  .catch(console.error);
