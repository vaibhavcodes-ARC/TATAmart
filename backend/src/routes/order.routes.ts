import { Router } from 'express';
import { getOrders, createOrder } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getOrders);
router.post('/', authenticate, createOrder);

export default router;
