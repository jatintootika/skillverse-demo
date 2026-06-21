import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

import fs from 'fs';
import path from 'path';

function loadDatabaseFallback() {
  const DB_FILE = path.join(process.cwd(), 'data-db.json');
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

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
    console.error("PRISMA GET ALL COURSES ERROR:", error);
    try {
      const db = loadDatabaseFallback();
      return res.json(db.courses);
    } catch (fallbackError) {
      res.status(500).json({ message: 'Internal server error' });
    }
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
    console.error("PRISMA GET COURSE ERROR:", error);
    try {
      const db = loadDatabaseFallback();
      const c = db.courses.find((x: any) => x.id === req.params.id);
      if (c) return res.json(c);
      res.status(404).json({ message: 'Course not found' });
    } catch (fallbackError) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const cId = req.params.id;
    const { title, category, description, examPrice, discountPrice, instructorName, thumbnailUrl, bannerUrl, lectures, notesUrl, practiceMcqsUrl, labManualUrl, active } = req.body;
    
    // Map examPrice to price if provided
    const updateData: any = {
      title,
      category,
      description,
      instructorName,
      thumbnailUrl,
      bannerUrl,
      notesUrl,
      practiceMcqsUrl,
      labManualUrl,
      active: active === true || active === 'true',
      lectures: lectures ? (lectures as any) : undefined,
    };
    if (examPrice !== undefined) updateData.price = Number(examPrice);
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

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
    const { title, category, description, examPrice, instructorName, thumbnailUrl, bannerUrl, lectures, notesUrl, labManualUrl, practiceMcqsUrl, active } = req.body;
    
    const newCourse = await prisma.course.create({
      data: {
        title: title || 'New Course',
        category: category || 'Tech',
        description: description || '',
        price: Number(examPrice) || 0,
        lectures: (lectures as any) || [],
        durationMins: 60,
        passPercentage: 70,
        instructorName,
        thumbnailUrl,
        bannerUrl,
        notesUrl,
        labManualUrl,
        practiceMcqsUrl,
        active: active === true || active === 'true'
      }
    });
    
    res.status(201).json({ message: 'Course created successfully', course: { ...newCourse, examPrice: newCourse.price } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating course' });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    await prisma.course.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error("PRISMA DELETE COURSE ERROR:", error);
    res.status(500).json({ success: false, message: 'Error deleting course' });
  }
};

export const toggleCourseStatus = async (req: Request, res: Response) => {
  try {
    const { active } = req.body;
    const updated = await prisma.course.update({
      where: { id: req.params.id },
      data: { active: active === true || active === 'true' }
    });
    res.json({ success: true, message: 'Course status updated', course: updated });
  } catch (error) {
    console.error("PRISMA TOGGLE COURSE STATUS ERROR:", error);
    res.status(500).json({ success: false, message: 'Error updating course status' });
  }
};
