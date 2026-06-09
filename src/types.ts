/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'student' | 'admin' | 'super_admin' | 'faculty';
export type SubscriptionPlan = 'free' | 'starter' | 'popular' | 'pro';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  plan: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
  joinedDate: string;
  profilePhoto?: string;
  permissions?: string[];
  assignedCourses?: string[];
  suspended?: boolean;
  hasCompletedOnboarding?: boolean;
  profileData?: {
    goal?: string;
    skillLevel?: string;
    interest?: string;
  };
}

export interface ResourceItem {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'pdf' | 'notes';
}

export interface Course {
  id: string;
  title: string;
  category: 'Tech' | 'Business';
  description: string;
  examPrice: number; // in INR
  discountPrice?: number;
  instructorName?: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
  lectures: { title: string; videoId: string }[];
  notesUrl: string;
  questionsUrl: string;
  active: boolean;
  questionsCount: number;
  durationMins: number;
  passPercentage: number;
  assignments?: { id: string; title: string; fileUrl?: string }[];
  quizzes?: { id: string; question: string; options: string[]; answerIndex: number }[];
}

export interface ExamQuestion {
  id: string;
  courseId: string;
  question: string;
  options: string[];
  correctOptionIndex: number; // 0 to 3
}

export interface ExamAttempt {
  id: string;
  userId: string;
  courseId: string;
  score: number;
  totalQuestions: number;
  status: 'passed' | 'failed';
  startedAt: string;
  completedAt: string;
  answers: Record<string, number>; // questionId -> chosenIndex
}

export interface Certificate {
  id: string; // Internal sequential
  certificateId: string; // public formatted SV-2026-XX-XXXXX
  userId: string;
  userName: string;
  courseId: string;
  courseName: string;
  score: number;
  issuedAt: string;
  valid: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  type: 'subscription' | 'exam' | 'retake';
  details: string; // e.g. "Pro Bundle Subscription"
  amount: number; // in INR
  status: 'success' | 'failed';
  gatewayRef: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number; // e.g. 20 for 20%
  type: 'percentage' | 'flat';
  maxUses: number;
  usedCount: number;
  expiry: string;
  active: boolean;
}

export interface AdminActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  userName?: string;
  role?: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface PlatformSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  razorpayKeyId: string;
  stripePublicKey: string;
  sandboxMode: boolean;
  maintenanceMode: boolean;
  termsOfService?: string;
  privacyPolicy?: string;
  refundPolicy?: string;
  disclaimer?: string;
  verificationPolicy?: string;
}

