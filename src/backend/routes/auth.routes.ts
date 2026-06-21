import { Router } from 'express';
import { login, register, updateProfile, googleAuth, sendOtp, verifyOtp } from '../controllers/auth.controller.js';
import { otpSendLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/update-profile', updateProfile);

// New Auth Routes
router.post('/google', googleAuth);
router.post('/otp/send', otpSendLimiter, sendOtp);
router.post('/otp/verify', verifyOtp);

export default router;
