import { Router } from 'express';
import {
  getCurrentUser, login, logout, refreshAccessToken, register,
} from '../controllers/auth';
import auth from '../middlewares/auth';
import { validateAuthentication, validateUserBody } from '../middlewares/validation';

const authRouter = Router();

authRouter.post('/login', validateAuthentication, login);
authRouter.post('/register', validateUserBody, register);
authRouter.get('/token', refreshAccessToken);
authRouter.get('/logout', logout);
authRouter.get('/user', auth, getCurrentUser);

export default authRouter;
