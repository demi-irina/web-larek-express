import { Router } from 'express';
import {
  createProduct, deleteProduct, getProducts, updateProduct,
} from '../controllers/products';
import auth from '../middlewares/auth';
import {
  validateProductBody, validateProductId, validateProductUpdateBody,
} from '../middlewares/validation';

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.post('/', auth, validateProductBody, createProduct);
productRouter.patch(
  '/:productId',
  auth,
  validateProductId,
  validateProductUpdateBody,
  updateProduct,
);
productRouter.delete('/:productId', auth, validateProductId, deleteProduct);

export default productRouter;
