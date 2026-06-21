import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import fs from 'fs';
import path from 'path';

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
    console.error("Prisma getProgress failed, falling back to local DB:", error);
    try {
      const { userId, courseId } = req.params;
      const dbPath = path.resolve(process.cwd(), 'data-db.json');
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        if (!db.progress) db.progress = [];
        const p = db.progress.find((x: any) => x.userId === userId && x.courseId === courseId);
        if (p) {
          return res.json(p);
        } else {
          return res.json({ completedLectures: [], progressPercent: 0 });
        }
      }
    } catch (fallbackErr) {
      console.error("Fallback getProgress failed:", fallbackErr);
    }
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
    console.error("Prisma markLectureWatched failed, falling back to local DB:", error);
    try {
      const { userId, courseId } = req.params;
      const { lectureId, totalLecturesCount } = req.body;
      const dbPath = path.resolve(process.cwd(), 'data-db.json');
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        if (!db.progress) db.progress = [];
        let pIdx = db.progress.findIndex((x: any) => x.userId === userId && x.courseId === courseId);
        
        let completed = pIdx !== -1 ? [...db.progress[pIdx].completedLectures] : [];
        if (!completed.includes(lectureId)) {
          completed.push(lectureId);
        }
        const progressPercent = Math.min(100, (completed.length / Number(totalLecturesCount)) * 100);
        
        const updatedProgress = {
          id: pIdx !== -1 ? db.progress[pIdx].id : `prog-${Date.now()}`,
          userId,
          courseId,
          completedLectures: completed,
          progressPercent,
          updatedAt: new Date().toISOString()
        };
        
        if (pIdx !== -1) {
          db.progress[pIdx] = updatedProgress;
        } else {
          db.progress.push(updatedProgress);
        }
        
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
        return res.json({ message: 'Progress updated', progress: updatedProgress });
      }
    } catch (fallbackErr) {
      console.error("Fallback markLectureWatched failed:", fallbackErr);
    }
    res.status(500).json({ message: 'Error updating progress' });
  }
};
