import { errors } from 'celebrate';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { DB_ADDRESS, PORT } from './config';
import NotFoundError from './errors/not-found-error';
import errorHandler from './middlewares/error-handler';
import orderRouter from './routes/order';
import productRouter from './routes/product';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use((_req, _res, next) => next(new NotFoundError('Маршрут не найден')));
app.use(errors());
app.use(errorHandler);

mongoose
  .connect(DB_ADDRESS)
  .then(() => app.listen(Number(PORT), () => {
    // eslint-disable-next-line no-console
    console.log(`Сервер запущен на порту ${PORT}`);
  }))
  // eslint-disable-next-line no-console
  .catch(console.error);
