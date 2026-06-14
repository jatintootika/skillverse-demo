import { Router } from 'express';
import { getProgress, markLectureWatched } from '../controllers/progress.controller.js';

const router = Router();

router.get('/progress/:userId/:courseId', getProgress);
router.post('/progress/:userId/:courseId/lecture', markLectureWatched);

export default router;
