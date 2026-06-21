/**
 * Rate Limiting Middleware
 * Applies different rate limits to different API route categories
 * to prevent abuse and protect sensitive endpoints.
 */

import rateLimit from 'express-rate-limit';

// ─── GLOBAL API RATE LIMITER ────────────────────────────────────────────
// General rate limiter applied to all /api/* routes as a safety net.
// 200 requests per 15 minutes per IP.
export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 200,
  standardHeaders: true,       // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,        // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests from this IP. Please try again after 15 minutes.',
    retryAfterMs: 15 * 60 * 1000,
  },
});

// ─── AUTH / OTP RATE LIMITER (STRICT) ───────────────────────────────────
// Very strict limiter for auth routes (login, register, OTP send/verify, Google auth).
// Prevents brute-force attacks and OTP spamming.
// 10 requests per 15 minutes per IP.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
    retryAfterMs: 15 * 60 * 1000,
  },
});

// ─── OTP SEND RATE LIMITER (VERY STRICT) ────────────────────────────────
// Extra strict for OTP send — prevents email/SMS abuse.
// 3 OTP requests per 10 minutes per IP.
export const otpSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,   // 10 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'OTP request limit reached. You can request a new OTP after 10 minutes.',
    retryAfterMs: 10 * 60 * 1000,
  },
});

// ─── AI CHAT RATE LIMITER ───────────────────────────────────────────────
// Limits AI chat requests (expensive Gemini API calls).
// 20 requests per 10 minutes per IP.
export const aiChatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,   // 10 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AI assistant usage limit reached. Please wait a few minutes before asking more questions.',
    retryAfterMs: 10 * 60 * 1000,
  },
});

// ─── EXAM SUBMIT RATE LIMITER ───────────────────────────────────────────
// Prevents rapid-fire exam submissions (potential cheating/abuse).
// 5 submissions per 30 minutes per IP.
export const examSubmitLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,   // 30 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many exam submissions. Please wait before re-attempting.',
    retryAfterMs: 30 * 60 * 1000,
  },
});

// ─── PAYMENT RATE LIMITER ───────────────────────────────────────────────
// Protects payment endpoints from abuse.
// 10 requests per 15 minutes per IP.
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many payment requests. Please wait before retrying.',
    retryAfterMs: 15 * 60 * 1000,
  },
});

// ─── CERTIFICATE VERIFY RATE LIMITER ────────────────────────────────────
// Public endpoint — moderate limit to prevent scraping.
// 30 requests per 15 minutes per IP.
export const certVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many certificate verification requests. Please try again later.',
    retryAfterMs: 15 * 60 * 1000,
  },
});

// ─── CERTIFICATE GENERATE RATE LIMITER ──────────────────────────────────
// Prevents mass certificate generation abuse.
// 5 requests per 15 minutes per IP.
export const certGenerateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Certificate generation limit reached. Please wait before generating more certificates.',
    retryAfterMs: 15 * 60 * 1000,
  },
});

// ─── PASSKEY RATE LIMITER ───────────────────────────────────────────────
// WebAuthn/passkey registration and authentication attempts.
// 10 requests per 15 minutes per IP.
export const passkeyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many passkey attempts. Please wait and try again.',
    retryAfterMs: 15 * 60 * 1000,
  },
});

// ─── ADMIN RATE LIMITER ────────────────────────────────────────────────
// Admin panel routes — somewhat lenient but still protected.
// 50 requests per 15 minutes per IP.
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Admin rate limit exceeded. Please slow down.',
    retryAfterMs: 15 * 60 * 1000,
  },
});
