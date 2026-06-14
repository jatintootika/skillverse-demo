import { Router } from 'express';
import { getCourseQuestions, createQuestion, deleteQuestion, submitExam } from '../controllers/exams.controller.js';

const router = Router();

router.get('/courses/:id/questions', getCourseQuestions);
router.post('/courses/:id/questions', createQuestion);
router.delete('/questions/:id', deleteQuestion);
router.post('/exams/submit', submitExam);

export default router;
