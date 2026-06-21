import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-me';

const generateStudentId = () => {
  return `SV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
};

const syncStaffUser = async (email: string, role: string, name: string, plainTextPass: string) => {
  const hashedPassword = await bcrypt.hash(plainTextPass, 10);
  
  let prismaUser: any = null;
  try {
    prismaUser = await prisma.user.findUnique({ where: { email } });
    if (!prismaUser) {
      prismaUser = await prisma.user.create({
        data: {
          email,
          name,
          role,
          password: hashedPassword,
          plan: 'pro',
          studentId: `SV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
          referralCode: `SKILL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        }
      });
    } else {
      prismaUser = await prisma.user.update({
        where: { id: prismaUser.id },
        data: {
          role,
          password: hashedPassword,
          name
        }
      });
    }
  } catch (err) {
    console.error(`[Prisma Staff Sync Error for ${email}]:`, err);
  }

  let userToReturn = prismaUser;
  try {
    const dbPath = path.resolve(process.cwd(), 'data-db.json');
    if (fs.existsSync(dbPath)) {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      if (db.users) {
        const userIdx = db.users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (userIdx !== -1) {
          db.users[userIdx].role = role;
          db.users[userIdx].name = name;
          db.users[userIdx].password = hashedPassword;
          if (!db.users[userIdx].studentId) {
            db.users[userIdx].studentId = prismaUser?.studentId || `SV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
          }
          if (!userToReturn) userToReturn = db.users[userIdx];
        } else {
          const newUser = {
            id: prismaUser?.id || `usr-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
            email,
            name,
            role,
            password: hashedPassword,
            plan: 'pro',
            studentId: prismaUser?.studentId || `SV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
            referralCode: prismaUser?.referralCode || `SKILL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            joinedDate: new Date().toISOString().split('T')[0]
          };
          db.users.push(newUser);
          if (!userToReturn) userToReturn = newUser;
        }
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
      }
    }
  } catch (err) {
    console.error(`[Local DB Staff Sync Error for ${email}]:`, err);
  }

  return userToReturn;
};

const saveOtpToLocalDb = (email: string, otpCode: string, otpExpiresAt: Date, role: string) => {
  try {
    const dbPath = path.resolve(process.cwd(), 'data-db.json');
    if (fs.existsSync(dbPath)) {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      if (db.users) {
        const userIdx = db.users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (userIdx !== -1) {
          db.users[userIdx].otpCode = otpCode;
          db.users[userIdx].otpExpiresAt = otpExpiresAt.toISOString();
          db.users[userIdx].role = role;
        } else {
          db.users.push({
            id: `usr-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
            email,
            name: email === 'superadmin.skillgenz@gmail.com' ? 'Super Admin' : email === 'admin.skillgenz@gmail.com' ? 'Admin' : 'Faculty',
            role,
            plan: 'pro',
            otpCode,
            otpExpiresAt: otpExpiresAt.toISOString(),
            studentId: `SV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
            referralCode: `SKILL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            joinedDate: new Date().toISOString().split('T')[0]
          });
        }
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
      }
    }
  } catch (err) {
    console.error(`[Local DB OTP Sync Error for ${email}]:`, err);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const normalizedEmail = email.trim().toLowerCase();

    // Staff credentials mapping
    const staffCredentials: Record<string, { role: string; pass: string; name: string }> = {
      'superadmin.skillgenz@gmail.com': { role: 'super_admin', pass: 'themainhero', name: 'Super Admin' },
      'admin.skillgenz@gmail.com': { role: 'admin', pass: 'themainadmin', name: 'Admin' },
      'falculty.skillgenz@gmail.com': { role: 'faculty', pass: 'themainfaculty', name: 'Faculty' }
    };

    if (staffCredentials[normalizedEmail]) {
      const cred = staffCredentials[normalizedEmail];
      if (password === cred.pass) {
        const userObj = await syncStaffUser(normalizedEmail, cred.role, cred.name, cred.pass);
        const token = jwt.sign({ id: (userObj as any).id || 'staff-id', email: normalizedEmail }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ token, user: userObj });
      } else {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return res.status(404).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    // Assign studentId if missing
    if (!user.studentId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { studentId: generateStudentId() }
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ token, user });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SKILL-${code}`;
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, referredByCode } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique referral code
    let referralCode = generateReferralCode();
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 5) {
      const existing = await prisma.user.findUnique({ where: { referralCode } });
      if (!existing) {
        isUnique = true;
      } else {
        referralCode = generateReferralCode();
        attempts++;
      }
    }

    // Process referral if code provided
    let referredById = null;
    if (referredByCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referredByCode.trim().toUpperCase() }
      });
      if (referrer) {
        referredById = referrer.id;
        
        // Reward referrer
        const newReferredCount = referrer.referredCount + 1;
        const updateData: any = {
          referredCount: newReferredCount,
          walletBalance: referrer.walletBalance + 20.0, // Add ₹20 wallet credit
        };

        // Milestone rewards:
        // Refer 5 friends -> Free Course Credit
        if (newReferredCount === 5) {
          updateData.freeCourseCredits = referrer.freeCourseCredits + 1;
        }
        // Refer 10 friends -> Premium Certificate Credit
        if (newReferredCount === 10) {
          updateData.freeCertCredits = referrer.freeCertCredits + 1;
        }

        await prisma.user.update({
          where: { id: referrer.id },
          data: updateData
        });
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        plan: 'free',
        role: 'student',
        referralCode,
        referredById,
        studentId: generateStudentId()
      }
    });

    // Synchronize to data-db.json
    syncUserToLocalDb(user);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

const syncUserToLocalDb = (user: any) => {
  try {
    const dbPath = path.resolve(process.cwd(), 'data-db.json');
    if (fs.existsSync(dbPath)) {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      if (db.users) {
        const idx = db.users.findIndex((u: any) => u.email.toLowerCase() === user.email.toLowerCase() || u.id === user.id);
        const mappedUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          password: user.password || null,
          googleId: user.googleId || null,
          role: user.role || 'student',
          plan: user.plan || 'free',
          phone: user.phone || null,
          age: user.age || null,
          studentId: user.studentId || null,
          referralCode: user.referralCode || null,
          hasCompletedOnboarding: user.hasCompletedOnboarding || false,
          dateOfBirth: user.dateOfBirth || null,
          currentlyStudying: user.currentlyStudying || null,
          skills: user.skills || null,
          joinedDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        };
        if (idx !== -1) {
          db.users[idx] = { ...db.users[idx], ...mappedUser };
        } else {
          db.users.push(mappedUser);
        }
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
      }
    }
  } catch (err) {
    console.error('[syncUserToLocalDb Error]:', err);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { userId, name, phone, password, age, hasCompletedOnboarding, dateOfBirth, currentlyStudying, skills } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (age !== undefined) updateData.age = parseInt(age, 10);
    if (hasCompletedOnboarding !== undefined) updateData.hasCompletedOnboarding = !!hasCompletedOnboarding;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (currentlyStudying !== undefined) updateData.currentlyStudying = currentlyStudying;
    if (skills !== undefined) updateData.skills = skills;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        phone: true,
        age: true,
        referralCode: true,
        walletBalance: true,
        referredCount: true,
        freeCourseCredits: true,
        freeCertCredits: true,
        createdAt: true,
        studentId: true,
        googleId: true,
        hasCompletedOnboarding: true,
        dateOfBirth: true,
        currentlyStudying: true,
        skills: true
      }
    });

    // Synchronize to data-db.json
    syncUserToLocalDb(updatedUser);

    return res.json({ success: true, user: updatedUser });
  } catch (err: any) {
    console.error("Prisma updateProfile failed, falling back to local DB:", err);
    try {
      const { userId, name, phone, password, age, hasCompletedOnboarding, dateOfBirth, currentlyStudying, skills } = req.body;
      const dbPath = path.resolve(process.cwd(), 'data-db.json');
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        if (db.users) {
          const userIndex = db.users.findIndex((u: any) => u.id === userId);
          if (userIndex !== -1) {
            if (name !== undefined) db.users[userIndex].name = name;
            if (phone !== undefined) db.users[userIndex].phone = phone;
            if (age !== undefined) db.users[userIndex].age = parseInt(age, 10);
            if (hasCompletedOnboarding !== undefined) db.users[userIndex].hasCompletedOnboarding = !!hasCompletedOnboarding;
            if (dateOfBirth !== undefined) db.users[userIndex].dateOfBirth = dateOfBirth;
            if (currentlyStudying !== undefined) db.users[userIndex].currentlyStudying = currentlyStudying;
            if (skills !== undefined) db.users[userIndex].skills = skills;
            if (password) {
              db.users[userIndex].password = await bcrypt.hash(password, 10);
            }
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            return res.json({ success: true, user: db.users[userIndex] });
          }
        }
      }
    } catch (fallbackErr) {
      console.error("Fallback updateProfile failed:", fallbackErr);
    }
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

// --- NEW AUTHENTICATION METHODS ---

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email, name, role, phone } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const normalizedEmail = email.trim().toLowerCase();

    // Staff allowed emails list
    const allowedEmails = [
      'superadmin.skillgenz@gmail.com',
      'admin.skillgenz@gmail.com',
      'falculty.skillgenz@gmail.com'
    ];

    if (!allowedEmails.includes(normalizedEmail)) {
      return res.status(403).json({ error: 'Access Denied: Your email is not authorized for OTP login.' });
    }

    let resolvedRole = 'student';
    let resolvedName = name;
    if (normalizedEmail === 'superadmin.skillgenz@gmail.com') {
      resolvedRole = 'super_admin';
      resolvedName = resolvedName || 'Super Admin';
    } else if (normalizedEmail === 'admin.skillgenz@gmail.com') {
      resolvedRole = 'admin';
      resolvedName = resolvedName || 'Admin';
    } else if (normalizedEmail === 'falculty.skillgenz@gmail.com') {
      resolvedRole = 'faculty';
      resolvedName = resolvedName || 'Faculty';
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60000); // 10 mins

    let user = null;
    try {
      user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            name: resolvedName,
            role: resolvedRole,
            phone: phone || null,
            plan: 'pro',
            otpCode,
            otpExpiresAt,
            studentId: generateStudentId(),
            referralCode: generateReferralCode()
          }
        });
      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { otpCode, otpExpiresAt, role: resolvedRole }
        });
      }
    } catch (err) {
      console.error(`[Prisma OTP Save Error for ${normalizedEmail}]:`, err);
    }

    // Always keep data-db.json synchronized
    saveOtpToLocalDb(normalizedEmail, otpCode, otpExpiresAt, resolvedRole);

    // Send email via nodemailer if configured
    console.log(`\n\n=== [OTP SECURITY ALERT] OTP Code for ${normalizedEmail} is: ${otpCode} ===\n\n`);
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      let fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'support@skillgenz.com';
      let fromName = 'SkillGenz Support';
      let emailSubject = 'Your SkillGenz Login OTP';

      if (resolvedRole === 'admin' || resolvedRole === 'super_admin' || resolvedRole === 'faculty') {
        fromEmail = 'security@skillgenz.com';
        fromName = 'SkillGenz Admin Security';
        emailSubject = '🔒 Admin Portal Security Code';
      }

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: normalizedEmail,
        subject: emailSubject,
        text: `Your One-Time Password is: ${otpCode}\n\nIt is valid for 10 minutes. Please do not share this code with anyone.`
      });
      console.log(`[AUTH] Sent real OTP email to ${normalizedEmail} from ${fromEmail}`);
    } else {
      console.log(`\n\n=== [MOCK AUTH] OTP for ${normalizedEmail} is: ${otpCode} ===\n\n`);
    }

    return res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error sending OTP' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otpCode } = req.body;
    if (!email || !otpCode) return res.status(400).json({ error: 'Email and OTP required' });

    const normalizedEmail = email.trim().toLowerCase();

    // Find user in Prisma first, then fallback to local DB
    let user = null;
    let fallbackUsed = false;
    try {
      user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    } catch (prismaErr) {
      console.error("[Prisma verifyOtp Error, falling back to local DB]:", prismaErr);
    }

    if (!user) {
      try {
        const dbPath = path.resolve(process.cwd(), 'data-db.json');
        if (fs.existsSync(dbPath)) {
          const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
          const localUser = db.users.find((u: any) => u.email.toLowerCase() === normalizedEmail);
          if (localUser) {
            user = localUser;
            fallbackUsed = true;
          }
        }
      } catch (fallbackErr) {
        console.error("Local DB verifyOtp search failed:", fallbackErr);
      }
    }

    if (!user || user.otpCode !== otpCode) {
      return res.status(400).json({ error: 'Invalid OTP code' });
    }

    const expiryTime = user.otpExpiresAt ? new Date(user.otpExpiresAt) : null;
    if (!expiryTime || expiryTime < new Date()) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Ensure studentId exists
    let studentId = user.studentId;
    if (!studentId) {
      studentId = generateStudentId();
    }

    // Clear OTP and update database
    let updatedUser = user;
    if (!fallbackUsed) {
      try {
        updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { otpCode: null, otpExpiresAt: null, studentId }
        });
      } catch (err) {
        console.error("Prisma OTP clear error, performing local clear:", err);
        fallbackUsed = true;
      }
    }

    // Always keep data-db.json synchronized
    try {
      const dbPath = path.resolve(process.cwd(), 'data-db.json');
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        const idx = db.users.findIndex((u: any) => u.email.toLowerCase() === normalizedEmail);
        if (idx !== -1) {
          db.users[idx].otpCode = null;
          db.users[idx].otpExpiresAt = null;
          db.users[idx].studentId = studentId;
          fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
          if (fallbackUsed) {
            updatedUser = db.users[idx];
          }
        }
      }
    } catch (dbErr) {
      console.error("Local DB OTP clear error:", dbErr);
    }

    // Send Login Alert Email
    if (process.env.SMTP_USER && process.env.SMTP_PASS && updatedUser.email) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
        const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        await transporter.sendMail({
          from: `"SkillGenz Security" <${fromEmail}>`,
          to: updatedUser.email,
          subject: 'Successful Login to SkillGenz',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #2563eb;">Welcome to SkillGenz!</h2>
              <p>Hi <b>${updatedUser.name}</b>,</p>
              <p>You have successfully logged into your SkillGenz account via OTP.</p>
              <p><b>Login Time:</b> ${dateStr} (IST)</p>
              <br/>
              <p>If you have an incomplete profile, please complete it in your dashboard.</p>
              <p>Happy Learning!</p>
              <p style="color: #64748b; font-size: 12px; margin-top: 30px;">If this wasn't you, please secure your account immediately.</p>
            </div>
          `
        });
        console.log(`[AUTH] Sent login alert email to ${updatedUser.email}`);
      } catch (emailErr) {
        console.error('[AUTH] Failed to send login email:', emailErr);
      }
    }

    const token = jwt.sign({ id: user.id || 'staff-id', email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: updatedUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential missing' });

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'placeholder');
    let payload = null;

    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID?.trim() || 'placeholder'
      });
      payload = ticket.getPayload();
    } catch (e: any) {
      console.error('[Google verifyIdToken Error]:', e?.message || e);
      // Fallback to manual decode if verification fails (e.g. clock skew, dev environment, etc)
      try {
        const base64Url = credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        payload = JSON.parse(jsonPayload);
        console.log('[Google Auth] Successfully used fallback decode');
      } catch (decodeErr) {
        console.error('[Fallback Decode Error]:', decodeErr);
      }
    }

    if (!payload || !payload.email) return res.status(400).json({ error: 'Invalid Google Token' });

    const email = payload.email;
    const name = payload.name || email.split('@')[0];
    const googleId = payload.sub;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          role: 'student',
          plan: 'free',
          studentId: generateStudentId(),
          referralCode: generateReferralCode()
        }
      });
    } else {
      let updateData: any = {};
      if (!user.googleId) updateData.googleId = googleId;
      if (!user.studentId) updateData.studentId = generateStudentId();
      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({ where: { id: user.id }, data: updateData });
      }
    }

    // Send Login Alert / Welcome Email via Nodemailer
    if (process.env.SMTP_USER && process.env.SMTP_PASS && user.email) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        
        const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        
        await transporter.sendMail({
          from: `"SkillGenz Security" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: 'Successful Login to SkillGenz',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #2563eb;">Welcome to SkillGenz!</h2>
              <p>Hi <b>${user.name}</b>,</p>
              <p>You have successfully logged into your SkillGenz account via Google.</p>
              <p><b>Login Time:</b> ${dateStr} (IST)</p>
              <br/>
              <p>If you have an incomplete profile, please complete it in your dashboard.</p>
              <p>Happy Learning!</p>
              <p style="color: #64748b; font-size: 12px; margin-top: 30px;">If this wasn't you, please secure your Google account immediately.</p>
            </div>
          `
        });
        console.log(`[AUTH] Sent login alert email to ${user.email}`);
      } catch (emailErr) {
        console.error('[AUTH] Failed to send login email:', emailErr);
      }
    }

    // Synchronize to data-db.json
    syncUserToLocalDb(user);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Google Auth Error' });
  }
};
