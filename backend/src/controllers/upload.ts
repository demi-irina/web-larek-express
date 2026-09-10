import { NextFunction, Request, Response } from 'express';
import BadRequestError from '../errors/bad-request-error';

const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new BadRequestError('Файл не загружен или имеет недопустимый формат'));
  }

  return res.send({
    fileName: `/images/${req.file.filename}`,
    originalName: req.file.originalname,
  });
};

export default uploadFile;
