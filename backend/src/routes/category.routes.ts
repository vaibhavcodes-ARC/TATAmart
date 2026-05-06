import { Router } from 'express';
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getCategories);

router.post('/', authenticate, authorize(['ADMIN']), createCategory);
router.put('/:id', authenticate, authorize(['ADMIN']), updateCategory);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteCategory);

export default router;
