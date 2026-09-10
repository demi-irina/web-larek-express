import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { isValidObjectId } from 'mongoose';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../config';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';
import User, { IUser } from '../models/user';

type UserDocument = IUser & { _id: unknown };

const generateTokens = (userId: string) => ({
  accessToken: jwt.sign({ _id: userId }, ACCESS_TOKEN.secret, {
    expiresIn: ACCESS_TOKEN.expiry,
  } as jwt.SignOptions),
  refreshToken: jwt.sign({ _id: userId }, REFRESH_TOKEN.secret, {
    expiresIn: REFRESH_TOKEN.expiry,
  } as jwt.SignOptions),
});

const sendTokens = async (res: Response, user: UserDocument) => {
  const userId = String(user._id);
  const { accessToken, refreshToken } = generateTokens(userId);

  await User.findByIdAndUpdate(userId, { $push: { tokens: { token: refreshToken } } });

  res.cookie(REFRESH_TOKEN.cookie.name, refreshToken, REFRESH_TOKEN.cookie.options);

  return res.send({
    user: { email: user.email, name: user.name },
    success: true,
    accessToken,
  });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    return await sendTokens(res, user);
  } catch (error) {
    if (error instanceof Error && error.message.includes('E11000')) {
      return next(new ConflictError('Пользователь с таким email уже существует'));
    }
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new UnauthorizedError('Неправильные почта или пароль'));
    }

    return await sendTokens(res, user);
  } catch (error) {
    return next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }

    return res.send({ user: { email: user.email, name: user.name }, success: true });
  } catch (error) {
    return next(error);
  }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies[REFRESH_TOKEN.cookie.name];

    if (!refreshToken) {
      return next(new UnauthorizedError('Refresh-токен не передан'));
    }

    let payload: JwtPayload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_TOKEN.secret) as JwtPayload;
    } catch (error) {
      return next(new UnauthorizedError('Refresh-токен просрочен или невалиден'));
    }

    const user = await User.findById(payload._id).select('+tokens');

    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }

    if (!user.tokens.some((item) => item.token === refreshToken)) {
      return next(new UnauthorizedError('Refresh-токен просрочен или невалиден'));
    }

    await User.findByIdAndUpdate(user._id, { $pull: { tokens: { token: refreshToken } } });

    return await sendTokens(res, user);
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies[REFRESH_TOKEN.cookie.name];

    if (!refreshToken) {
      return next(new UnauthorizedError('Refresh-токен не передан'));
    }

    let payload: JwtPayload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_TOKEN.secret) as JwtPayload;
    } catch (error) {
      return next(new UnauthorizedError('Refresh-токен просрочен или невалиден'));
    }

    if (!isValidObjectId(payload._id)) {
      return next(new BadRequestError('Передан некорректный идентификатор пользователя'));
    }

    const user = await User.findById(payload._id);

    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }

    await User.findByIdAndUpdate(user._id, { $pull: { tokens: { token: refreshToken } } });

    const expiredCookie = { ...REFRESH_TOKEN.cookie.options, maxAge: 0 };
    res.cookie(REFRESH_TOKEN.cookie.name, '', expiredCookie);

    return res.send({ success: true });
  } catch (error) {
    return next(error);
  }
};
