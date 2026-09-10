import { Router } from 'express';
import {
  createProduct, deleteProduct, getProducts, updateProduct,
} from '../controllers/products';
import {
  validateProductBody, validateProductId, validateProductUpdateBody,
} from '../middlewares/validation';

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.post('/', validateProductBody, createProduct);
productRouter.patch('/:productId', validateProductId, validateProductUpdateBody, updateProduct);
productRouter.delete('/:productId', validateProductId, deleteProduct);

export default productRouter;
