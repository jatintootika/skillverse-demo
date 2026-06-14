import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

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

    // In a real Razorpay integration, we'd call Razorpay API here to create an order
    // and return the order_id. For demo, we just return the local payment ID.
    res.json({ message: 'Order created successfully', orderId: payment.id, amount: payment.amount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating payment order' });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, certificateId } = req.body;
    
    // In a real integration, we'd verify Razorpay signature here.
    // For demo, we just mark it success.
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
    console.error(error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
};
