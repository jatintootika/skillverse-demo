import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import fs from 'fs';
import path from 'path';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        phone: true,
        referralCode: true,
        walletBalance: true,
        referredCount: true,
        freeCourseCredits: true,
        freeCertCredits: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error("Prisma getAllUsers failed, falling back to local DB:", error);
    try {
      const dbPath = path.resolve(process.cwd(), 'data-db.json');
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        if (db.users) {
          const mappedUsers = db.users.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role || 'student',
            plan: u.plan || 'free',
            phone: u.phone || null,
            referralCode: u.referralCode || u.id,
            walletBalance: u.walletBalance || 0.0,
            referredCount: u.referredCount || 0,
            freeCourseCredits: u.freeCourseCredits || 0,
            freeCertCredits: u.freeCertCredits || 0,
            createdAt: u.createdAt || u.joinedDate || new Date().toISOString()
          }));
          return res.json(mappedUsers);
        }
      }
    } catch (fallbackErr) {
      console.error("Fallback getAllUsers failed:", fallbackErr);
    }
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        phone: true,
        referralCode: true,
        walletBalance: true,
        referredCount: true,
        freeCourseCredits: true,
        freeCertCredits: true,
        createdAt: true
      }
    });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error("Prisma getUserById failed, falling back to local DB:", error);
    try {
      const dbPath = path.resolve(process.cwd(), 'data-db.json');
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        if (db.users) {
          const u = db.users.find((x: any) => x.id === req.params.id);
          if (u) {
            return res.json({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role || 'student',
              plan: u.plan || 'free',
              phone: u.phone || null,
              referralCode: u.referralCode || u.id,
              walletBalance: u.walletBalance || 0.0,
              referredCount: u.referredCount || 0,
              freeCourseCredits: u.freeCourseCredits || 0,
              freeCertCredits: u.freeCertCredits || 0,
              createdAt: u.createdAt || u.joinedDate || new Date().toISOString()
            });
          }
        }
      }
    } catch (fallbackErr) {
      console.error("Fallback getUserById failed:", fallbackErr);
    }
    res.status(500).json({ message: 'Error fetching user' });
  }
};

export const updateAdminUser = async (req: Request, res: Response) => {
  try {
    const { plan } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { plan }
    });
    res.json({ message: 'User updated successfully', student: updatedUser });
  } catch (error) {
    console.error("Prisma updateAdminUser failed, falling back to local DB:", error);
    try {
      const { plan } = req.body;
      const dbPath = path.resolve(process.cwd(), 'data-db.json');
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        if (db.users) {
          const userIdx = db.users.findIndex((x: any) => x.id === req.params.id);
          if (userIdx !== -1) {
            db.users[userIdx].plan = plan;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
            return res.json({ message: 'User updated successfully', student: db.users[userIdx] });
          }
        }
      }
    } catch (fallbackErr) {
      console.error("Fallback updateAdminUser failed:", fallbackErr);
    }
    res.status(500).json({ message: 'Error updating user' });
  }
};
