import { NextFunction, Request, Response } from 'express';
import Product from '../models/product';

export const getProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find({});
    res.send({ items: products, total: products.length });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).send(product);
  } catch (error) {
    next(error);
  }
};
