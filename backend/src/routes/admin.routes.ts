import { Router } from 'express';
import { getUsers, getProducts, toggleUserVerification, getAdminStats } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/users', authenticate, getUsers);
router.get('/products', authenticate, getProducts);
router.put('/users/:id/verify', authenticate, toggleUserVerification);
router.get('/stats', authenticate, getAdminStats);

export default router;
