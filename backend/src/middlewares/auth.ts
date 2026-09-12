import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ACCESS_TOKEN } from '../config';
import UnauthorizedError from '../errors/unauthorized-error';

export default function auth(req: Request, _res: Response, next: NextFunction) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  const token = authorization.replace('Bearer ', '');

  try {
    req.user = jwt.verify(token, ACCESS_TOKEN.secret) as JwtPayload;
  } catch (error) {
    return next(new UnauthorizedError('Access-токен просрочен или невалиден'));
  }

  return next();
}
