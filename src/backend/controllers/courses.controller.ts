import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' }
    });
    // Transform 'price' to 'examPrice' for the frontend compatibility
    const formatted = courses.map(c => ({
      ...c,
      examPrice: c.price
    }));
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id }
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    res.json({
      ...course,
      examPrice: course.price
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const cId = req.params.id;
    const { title, category, description, examPrice, discountPrice, instructorName, thumbnailUrl, bannerUrl, lectures, active } = req.body;
    
    // Map examPrice to price if provided
    const updateData: any = {
      title,
      category,
      description,
      instructorName,
      thumbnailUrl,
      bannerUrl,
      lectures: lectures as any,
    };
    if (examPrice !== undefined) updateData.price = Number(examPrice);
    
    const updated = await prisma.course.update({
      where: { id: cId },
      data: updateData
    });
    
    res.json({ message: 'Course updated successfully', course: { ...updated, examPrice: updated.price } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating course' });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, category, description, examPrice, instructorName, thumbnailUrl, bannerUrl, lectures } = req.body;
    
    const newCourse = await prisma.course.create({
      data: {
        title: title || 'New Course',
        category: category || 'Tech',
        description: description || '',
        price: Number(examPrice) || 0,
        lectures: (lectures as any) || [],
        durationMins: 60,
        passPercentage: 70
      }
    });
    
    res.status(201).json({ message: 'Course created successfully', course: { ...newCourse, examPrice: newCourse.price } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating course' });
  }
};
