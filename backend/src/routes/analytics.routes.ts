import { Router } from 'express';
import { getSellerAnalytics, getAdminAnalytics } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/seller', authenticate, authorize(['SELLER', 'ADMIN']), getSellerAnalytics);
router.get('/admin', authenticate, authorize(['ADMIN']), getAdminAnalytics);

export default router;
