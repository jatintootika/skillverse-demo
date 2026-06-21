import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

import fs from 'fs';
import path from 'path';

function loadDatabaseFallback() {
  const DB_FILE = path.join(process.cwd(), 'data-db.json');
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveDatabaseFallback(db: any) {
  const DB_FILE = path.join(process.cwd(), 'data-db.json');
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export const getCourseQuestions = async (req: Request, res: Response) => {
  try {
    const questions = await prisma.question.findMany({
      where: { courseId: req.params.id }
    });

    if (questions.length === 0) {
      try {
        const db = loadDatabaseFallback();
        const cQuestions = db.questions.filter((q: any) => q.courseId === req.params.id);
        if (cQuestions.length > 0) {
          return res.json(cQuestions);
        }
      } catch (e) {
        // ignore fallback read error if it happens here
      }
    }

    res.json(questions);
  } catch (error) {
    console.error("PRISMA GET QUESTIONS ERROR:", error);
    try {
      const db = loadDatabaseFallback();
      const cQuestions = db.questions.filter((q: any) => q.courseId === req.params.id);
      return res.json(cQuestions);
    } catch (fallbackError) {
      res.status(500).json({ message: 'Error fetching questions' });
    }
  }
};

export const createQuestion = async (req: Request, res: Response) => {
  const courseId = req.params.id;
  const { question, options, correctOptionIndex } = req.body;
  
  if (!question || !options || correctOptionIndex === undefined) {
    return res.status(400).json({ message: 'Incomplete question configurations.' });
  }

  try {
    const newQ = await prisma.question.create({
      data: {
        courseId,
        question,
        options,
        correctOptionIndex: Number(correctOptionIndex)
      }
    });

    res.status(201).json({ message: 'Question added successfully', question: newQ });
  } catch (error) {
    console.error("PRISMA CREATE QUESTION ERROR:", error);
    try {
      const db = loadDatabaseFallback();
      const newQ = {
        id: `q-${courseId}-${Date.now()}`,
        courseId,
        question,
        options,
        correctOptionIndex: Number(correctOptionIndex)
      };
      db.questions.push(newQ);
      saveDatabaseFallback(db);
      res.status(201).json({ message: 'Question added successfully', question: newQ });
    } catch (fallbackError: any) {
      console.error("FALLBACK CREATE QUESTION ERROR:", fallbackError);
      res.status(500).json({ message: 'Error adding question: ' + fallbackError.message });
    }
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  const qId = req.params.id;
  try {
    await prisma.question.delete({
      where: { id: qId }
    });
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error("PRISMA DELETE QUESTION ERROR:", error);
    try {
      const db = loadDatabaseFallback();
      db.questions = db.questions.filter((q: any) => q.id !== qId);
      saveDatabaseFallback(db);
      res.json({ message: 'Question deleted successfully' });
    } catch (fallbackError) {
      res.status(500).json({ message: 'Error deleting question' });
    }
  }
};

export const submitExam = async (req: Request, res: Response) => {
  try {
    const { userId, courseId, answers } = req.body;
    
    // Evaluate answers
    const questions = await prisma.question.findMany({ where: { courseId } });
    let correctCount = 0;
    
    for (const q of questions) {
      if (answers[q.id] === q.correctOptionIndex) {
        correctCount++;
      }
    }

    const score = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;
    const status = score >= 70 ? 'passed' : 'failed'; // Assuming 70 is passing

    const attempt = await prisma.attempt.create({
      data: {
        courseId,
        userId,
        score,
        status,
        answers: answers || {}
      }
    });

    let certificateData = null;
    if (score >= 70) {
      // Check if already exists
      let cert = await prisma.certificate.findFirst({ where: { userId, courseId }, include: { course: true } });
      
      if (!cert) {
        cert = await prisma.certificate.create({
          data: {
            userId,
            courseId,
            score,
            grade: score >= 90 ? 'Outstanding' : 'Distinction',
            isPaid: false,
            credentialId: `SV-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
          },
          include: { course: true }
        });
      }

      // Fetch user name
      const user = await prisma.user.findUnique({ where: { id: userId } });

      certificateData = {
        id: cert.id,
        certificateId: cert.credentialId,
        userName: user?.name || 'Student',
        courseName: cert.course.title,
        issuedAt: cert.issueDate.toISOString(),
        isPaid: cert.isPaid
      };
    }

    res.json({ 
      message: 'Exam submitted', 
      scorePct: score, 
      passed: score >= 70,
      certificate: certificateData 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting exam' });
  }
};
