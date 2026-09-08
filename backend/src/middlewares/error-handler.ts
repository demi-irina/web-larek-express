import { NextFunction, Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';

type AppError = Error & { statusCode?: number; code?: number };

const DUPLICATE_KEY_CODE = 11000;

export default function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof MongooseError.ValidationError) {
    const message = Object.values(err.errors)
      .map((error) => error.message)
      .join('; ');
    res.status(400).send({ message });
    return;
  }

  if (err.code === DUPLICATE_KEY_CODE) {
    res.status(409).send({ message: 'Товар с таким названием уже существует' });
    return;
  }

  const statusCode = err.statusCode ?? 500;
  const message = statusCode === 500 ? 'На сервере произошла ошибка' : err.message;

  res.status(statusCode).send({ message });
}
