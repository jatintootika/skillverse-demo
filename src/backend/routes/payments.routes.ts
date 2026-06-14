import { Router } from 'express';
import { createPaymentOrder, verifyPayment } from '../controllers/payments.controller.js';

const router = Router();

router.post('/payments/order', createPaymentOrder);
router.post('/payments/verify', verifyPayment);

export default router;
