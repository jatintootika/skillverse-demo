import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

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
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
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
        createdAt: true
      }
    });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

export const updateAdminUser = async (req: Request, res: Response) => {
  try {
    const { plan } = req.body;
    // In a real app we'd handle 'suspended' too if added to schema
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { plan }
    });
    res.json({ message: 'User updated successfully', student: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user' });
  }
};
