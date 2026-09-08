import { Router } from 'express';
import { createProduct, getProducts } from '../controllers/products';
import { validateProductBody } from '../middlewares/validation';

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.post('/', validateProductBody, createProduct);

export default productRouter;
