import bcrypt from 'bcryptjs';
import { model, Schema } from 'mongoose';
import isEmail from 'validator/lib/isEmail';

export interface IToken {
  token: string;
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  tokens: IToken[];
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      minlength: [2, 'Минимальная длина поля "name" — 2 символа'],
      maxlength: [30, 'Максимальная длина поля "name" — 30 символов'],
      default: 'Ё-мое',
    },
    email: {
      type: String,
      required: [true, 'Поле "email" обязательно для заполнения'],
      unique: true,
      validate: {
        validator: (value: string) => isEmail(value),
        message: 'Поле "email" должно быть валидным email-адресом',
      },
    },
    password: {
      type: String,
      required: [true, 'Поле "password" обязательно для заполнения'],
      minlength: [6, 'Минимальная длина поля "password" — 6 символов'],
      select: false,
    },
    tokens: {
      type: [{ token: { type: String, required: true } }],
      default: [],
      select: false,
    },
  },
  { versionKey: false },
);

userSchema.pre('save', async function hashPassword(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export default model<IUser>('user', userSchema);
