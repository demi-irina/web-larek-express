import { Router } from 'express';
import { createProduct, getProducts } from '../controllers/products';

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.post('/', createProduct);

export default productRouter;
