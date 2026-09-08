import cors from 'cors';
import express from 'express';
import { PORT } from './config';

const app = express();

app.use(cors());
app.use(express.json());

app.listen(Number(PORT), () => {
  // eslint-disable-next-line no-console
  console.log(`Сервер запущен на порту ${PORT}`);
});
