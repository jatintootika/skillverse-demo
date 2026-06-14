import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

export const getProgress = async (req: Request, res: Response) => {
  try {
    const { userId, courseId } = req.params;
    
    let progress = await prisma.progress.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });

    if (!progress) {
      // Return 0 progress if not started
      return res.json({ completedLectures: [], progressPercent: 0 });
    }

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching progress' });
  }
};

export const markLectureWatched = async (req: Request, res: Response) => {
  try {
    const { userId, courseId } = req.params;
    const { lectureId, totalLecturesCount } = req.body;

    if (!lectureId || !totalLecturesCount) {
      return res.status(400).json({ message: 'Missing lectureId or totalLecturesCount' });
    }

    // Upsert progress
    let progress = await prisma.progress.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });

    let completed = progress ? [...progress.completedLectures] : [];
    
    if (!completed.includes(lectureId)) {
      completed.push(lectureId);
    }

    const progressPercent = Math.min(100, (completed.length / Number(totalLecturesCount)) * 100);

    const updatedProgress = await prisma.progress.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {
        completedLectures: completed,
        progressPercent
      },
      create: {
        userId,
        courseId,
        completedLectures: completed,
        progressPercent
      }
    });

    res.json({ message: 'Progress updated', progress: updatedProgress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating progress' });
  }
};
