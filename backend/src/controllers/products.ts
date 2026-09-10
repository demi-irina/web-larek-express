import { NextFunction, Request, Response } from 'express';
import fs from 'fs/promises';
import { Error as MongooseError } from 'mongoose';
import path from 'path';
import { UPLOAD_DIR, UPLOAD_DIR_TEMP } from '../config';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import Product from '../models/product';

const moveImage = async (fileName: string) => {
  const name = path.basename(fileName);
  const tempPath = path.join(UPLOAD_DIR_TEMP, name);

  try {
    await fs.access(tempPath);
  } catch (error) {
    // файла может не быть в папке
    return;
  }

  await fs.rename(tempPath, path.join(UPLOAD_DIR, name));
};

export const getProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find({});
    return res.send({ items: products, total: products.length });
  } catch (error) {
    return next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await moveImage(req.body.image.fileName);
    const product = await Product.create(req.body);
    return res.status(201).send(product);
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(error.message));
    }
    if (error instanceof Error && error.message.includes('E11000')) {
      return next(new ConflictError('Товар с таким названием уже существует'));
    }
    return next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body.image) {
      await moveImage(req.body.image.fileName);
    }

    const product = await Product.findByIdAndUpdate(req.params.productId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return next(new NotFoundError('Товар не найден'));
    }

    return res.send(product);
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(error.message));
    }
    if (error instanceof Error && error.message.includes('E11000')) {
      return next(new ConflictError('Товар с таким названием уже существует'));
    }
    return next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);

    if (!product) {
      return next(new NotFoundError('Товар не найден'));
    }

    return res.send(product);
  } catch (error) {
    return next(error);
  }
};
