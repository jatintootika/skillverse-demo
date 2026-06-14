import { Router } from 'express';
import { askTutor } from '../controllers/ai.controller.js';

const router = Router();

router.post('/ask', askTutor);

export default router;
