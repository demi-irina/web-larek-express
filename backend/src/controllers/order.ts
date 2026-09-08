import { faker } from '@faker-js/faker';
import { NextFunction, Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import isEmail from 'validator/lib/isEmail';
import BadRequestError from '../errors/bad-request-error';
import Product from '../models/product';

const PAYMENT_TYPES = ['card', 'online'];

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      payment, email, phone, address, total, items,
    } = req.body;

    if (!PAYMENT_TYPES.includes(payment)) {
      throw new BadRequestError('Поле "payment" может быть только "card" или "online"');
    }
    if (typeof email !== 'string' || !isEmail(email)) {
      throw new BadRequestError('Поле "email" должно быть валидным email-адресом');
    }
    if (typeof phone !== 'string' || !phone) {
      throw new BadRequestError('Поле "phone" обязательно для заполнения');
    }
    if (typeof address !== 'string' || !address) {
      throw new BadRequestError('Поле "address" обязательно для заполнения');
    }
    if (typeof total !== 'number') {
      throw new BadRequestError('Поле "total" обязательно и должно быть числом');
    }
    if (!Array.isArray(items) || items.length === 0 || !items.every(isValidObjectId)) {
      throw new BadRequestError('Поле "items" должно быть непустым массивом идентификаторов товаров');
    }

    const products = await Product.find({ _id: { $in: items } });
    if (products.length !== items.length) {
      throw new BadRequestError('Один или несколько товаров не найдены в базе');
    }
    if (products.some((product) => product.price === null)) {
      throw new BadRequestError('В заказ попал товар, который не продаётся');
    }

    const orderTotal = products.reduce((sum, product) => sum + (product.price ?? 0), 0);
    if (orderTotal !== total) {
      throw new BadRequestError('Переданная сумма заказа не совпадает со стоимостью товаров');
    }

    res.send({ id: faker.string.uuid(), total: orderTotal });
  } catch (error) {
    next(error);
  }
};

export default createOrder;
