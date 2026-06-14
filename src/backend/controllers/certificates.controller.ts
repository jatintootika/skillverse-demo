import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

export const getUserCertificates = async (req: Request, res: Response) => {
  try {
    const certificates = await prisma.certificate.findMany({
      where: { userId: req.params.userId },
      include: { course: true }
    });
    
    // Format for frontend
    const formatted = certificates.map(cert => ({
      id: cert.id,
      certificateId: cert.credentialId,
      userId: cert.userId,
      courseId: cert.courseId,
      courseName: cert.course.title,
      score: cert.score,
      grade: cert.grade,
      isPaid: cert.isPaid,
      issuedAt: cert.issueDate.toISOString(),
      valid: true
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching certificates' });
  }
};

export const generateCertificate = async (req: Request, res: Response) => {
  try {
    const { userId, courseId, score, grade } = req.body;
    
    const existing = await prisma.certificate.findFirst({
      where: { userId, courseId }
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Certificate already exists for this course', certificate: { ...existing, isPaid: existing.isPaid } });
    }

    const cert = await prisma.certificate.create({
      data: {
        userId,
        courseId,
        score,
        grade: grade || 'Distinction',
        isPaid: false, // Starts locked/blurred
        credentialId: `SV-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      },
      include: { course: true }
    });

    const formatted = {
      id: cert.id,
      certificateId: cert.credentialId,
      userId: cert.userId,
      courseId: cert.courseId,
      courseName: cert.course.title,
      score: cert.score,
      grade: cert.grade,
      isPaid: cert.isPaid,
      issuedAt: cert.issueDate.toISOString(),
      valid: true
    };

    res.status(201).json({ message: 'Certificate generated successfully', certificate: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating certificate' });
  }
};
