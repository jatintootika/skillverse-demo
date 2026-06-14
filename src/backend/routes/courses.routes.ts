import { Router } from 'express';
import { getAllCourses, getCourseById, updateCourse, createCourse } from '../controllers/courses.controller.js';

const router = Router();

router.get('/', getAllCourses);
router.post('/', createCourse);
router.get('/:id', getCourseById);
router.put('/:id', updateCourse);

export default router;
