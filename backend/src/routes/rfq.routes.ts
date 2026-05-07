import { Router } from 'express';
import {
  createRfq,
  getRfqLeads,
  getBuyerRfqs,
  submitRfqResponse,
  selectRfqResponse,
} from '../controllers/rfq.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, createRfq);
router.get('/leads', authenticate, getRfqLeads);
router.get('/buyer', authenticate, getBuyerRfqs);
router.post('/respond', authenticate, submitRfqResponse);
router.post('/responses/:id/select', authenticate, selectRfqResponse);

export default router;
