import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import fs from 'fs';
import path from 'path';

export const createPaymentOrder = async (req: Request, res: Response) => {
  try {
    const { userId, amount, type, details } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ message: 'Missing userId or amount' });
    }

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: Number(amount),
        type: type || 'certificate_unlock',
        details: details || 'Unlock Certificate Payment',
        status: 'pending'
      }
    });

    res.json({ message: 'Order created successfully', orderId: payment.id, amount: payment.amount });
  } catch (error) {
    console.error("Prisma createPaymentOrder failed, falling back to local DB:", error);
    try {
      const { userId, amount, type, details } = req.body;
      const dbPath = path.resolve(process.cwd(), 'data-db.json');
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        if (!db.payments) db.payments = [];
        
        const newPayment = {
          id: `pay-${Date.now()}`,
          userId,
          amount: Number(amount),
          type: type || 'certificate_unlock',
          details: details || 'Unlock Certificate Payment',
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        db.payments.push(newPayment);
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
        return res.json({ message: 'Order created successfully', orderId: newPayment.id, amount: newPayment.amount });
      }
    } catch (fallbackErr) {
      console.error("Fallback createPaymentOrder failed:", fallbackErr);
    }
    res.status(500).json({ message: 'Error creating payment order' });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, certificateId } = req.body;
    
    const payment = await prisma.payment.update({
      where: { id: orderId },
      data: { status: 'success' }
    });

    if (certificateId) {
      await prisma.certificate.update({
        where: { id: certificateId },
        data: { isPaid: true }
      });
    }

    res.json({ message: 'Payment verified successfully', payment });
  } catch (error) {
    console.error("Prisma verifyPayment failed, falling back to local DB:", error);
    try {
      const { orderId, certificateId } = req.body;
      const dbPath = path.resolve(process.cwd(), 'data-db.json');
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        if (!db.payments) db.payments = [];
        if (!db.certificates) db.certificates = [];
        
        const pIdx = db.payments.findIndex((x: any) => x.id === orderId);
        if (pIdx !== -1) {
          db.payments[pIdx].status = 'success';
        }
        
        let updatedCert = null;
        if (certificateId) {
          const cIdx = db.certificates.findIndex((x: any) => x.id === certificateId || x.certificateId === certificateId);
          if (cIdx !== -1) {
            db.certificates[cIdx].isPaid = true;
            db.certificates[cIdx].valid = true;
            updatedCert = db.certificates[cIdx];
          }
        }
        
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
        return res.json({ 
          message: 'Payment verified successfully', 
          payment: pIdx !== -1 ? db.payments[pIdx] : { id: orderId, status: 'success' },
          certificate: updatedCert
        });
      }
    } catch (fallbackErr) {
      console.error("Fallback verifyPayment failed:", fallbackErr);
    }
    res.status(500).json({ message: 'Error verifying payment' });
  }
};
