import { model, Schema } from 'mongoose';

export interface IFile {
  fileName: string;
  originalName: string;
}

export interface IProduct {
  title: string;
  image: IFile;
  category: string;
  description?: string;
  price: number | null;
}

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, 'Поле "title" обязательно для заполнения'],
      unique: true,
      minlength: [2, 'Минимальная длина поля "title" — 2 символа'],
      maxlength: [30, 'Максимальная длина поля "title" — 30 символов'],
    },
    image: {
      fileName: {
        type: String,
        required: [true, 'Поле "image.fileName" обязательно для заполнения'],
      },
      originalName: {
        type: String,
        required: [true, 'Поле "image.originalName" обязательно для заполнения'],
      },
    },
    category: {
      type: String,
      required: [true, 'Поле "category" обязательно для заполнения'],
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      default: null,
    },
  },
  { versionKey: false },
);

export default model<IProduct>('product', productSchema);
