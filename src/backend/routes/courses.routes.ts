import { Router } from 'express';
import { getAllCourses, getCourseById, updateCourse, createCourse, deleteCourse, toggleCourseStatus } from '../controllers/courses.controller.js';

const router = Router();

router.get('/', getAllCourses);
router.post('/', createCourse);
router.get('/:id', getCourseById);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);
router.patch('/:id/status', toggleCourseStatus);

export default router;
