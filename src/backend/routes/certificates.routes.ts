import { Router } from 'express';
import { getUserCertificates, generateCertificate } from '../controllers/certificates.controller.js';

const router = Router();

router.get('/users/:userId/certificates', getUserCertificates);
router.post('/certificates/generate', generateCertificate);

export default router;
