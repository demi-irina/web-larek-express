import { isCelebrateError } from 'celebrate';
import { NextFunction, Request, Response } from 'express';

type AppError = Error & { statusCode?: number };

const MULTER_ERROR = 'MulterError';

export default function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (isCelebrateError(err)) {
    const message = Array.from(err.details.values())
      .map((detail) => detail.message)
      .join('; ');
    res.status(400).send({ message });
    return;
  }

  if (err.name === MULTER_ERROR) {
    res.status(400).send({ message: `Ошибка загрузки файла: ${err.message}` });
    return;
  }

  const statusCode = err.statusCode ?? 500;
  const message = statusCode === 500 ? 'На сервере произошла ошибка' : err.message;

  res.status(statusCode).send({ message });
}
