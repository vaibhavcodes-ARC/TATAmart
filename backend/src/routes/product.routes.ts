import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  createInquiry,
  getBuyerInquiries,
  getSellerInquiries,
  updateInquiryStatus
} from '../controllers/product.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

router.post('/', authenticate, authorize(['SELLER', 'ADMIN']), createProduct);
router.post('/inquire', authenticate, createInquiry);
router.get('/inquiries/buyer', authenticate, getBuyerInquiries);
router.get('/inquiries/seller', authenticate, getSellerInquiries);
router.put('/inquiries/:id', authenticate, updateInquiryStatus);
router.put('/:id', authenticate, authorize(['SELLER', 'ADMIN']), updateProduct);
router.delete('/:id', authenticate, authorize(['SELLER', 'ADMIN']), deleteProduct);

export default router;
