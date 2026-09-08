import { faker } from '@faker-js/faker';
import { NextFunction, Request, Response } from 'express';
import BadRequestError from '../errors/bad-request-error';
import Product from '../models/product';

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  const { total, items } = req.body;

  try {
    const products = await Product.find({ _id: { $in: items } });

    if (products.length !== items.length) {
      return next(new BadRequestError('Один или несколько товаров не найдены в базе'));
    }
    if (products.some((product) => product.price === null)) {
      return next(new BadRequestError('В заказ попал товар, который не продаётся'));
    }

    const orderTotal = products.reduce((sum, product) => sum + (product.price ?? 0), 0);
    if (orderTotal !== total) {
      return next(new BadRequestError('Переданная сумма заказа не совпадает со стоимостью товаров'));
    }

    return res.send({ id: faker.string.uuid(), total: orderTotal });
  } catch (error) {
    return next(error);
  }
};

export default createOrder;
