import { Router } from 'express';
import { getCart, addToCart, updateCartItem, deleteCartItem } from '../controllers/cart.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getCart);
router.post('/', authenticate, addToCart);
router.put('/:id', authenticate, updateCartItem);
router.delete('/:id', authenticate, deleteCartItem);

export default router;
