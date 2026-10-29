import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../prisma/client';
import { generateToken } from '../utils/tokens';
import { sendSuccess, sendError } from '../utils/response';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth';
import { Role, UserStatus, AuthorStatus } from '@prisma/client';

const router = Router();

// Register Reader / Student
const RegisterUserSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  mobile: z.string().optional(),
});

router.post('/register/user', async (req, res, next) => {
  try {
    const data = RegisterUserSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      return sendError(res, 'An account with this email already exists.', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        role: Role.USER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        profile: {
          create: {
            fullName: data.fullName,
            mobile: data.mobile || null,
          },
        },
      },
      include: { profile: true },
    });

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.profile?.fullName,
      },
    }, 'Account created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// Register Author Application
const RegisterAuthorSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  mobile: z.string().optional(),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  expertise: z.array(z.string()).or(z.string()).optional(),
});

router.post('/register/author', async (req, res, next) => {
  try {
    const data = RegisterAuthorSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      return sendError(res, 'An account with this email already exists.', 400);
    }

    const expertiseList = Array.isArray(data.expertise)
      ? data.expertise
      : typeof data.expertise === 'string'
      ? data.expertise.split(',').map((s) => s.trim()).filter(Boolean)
      : ['General Education'];

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        role: Role.USER, // Author starts as USER until approved
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        profile: {
          create: {
            fullName: data.fullName,
            mobile: data.mobile || null,
            bio: data.bio,
            interests: expertiseList,
          },
        },
        authorProfile: {
          create: {
            fullName: data.fullName,
            mobile: data.mobile || null,
            bio: data.bio,
            expertise: expertiseList,
            status: AuthorStatus.PENDING,
          },
        },
        authorApplications: {
          create: {
            fullName: data.fullName,
            email: data.email.toLowerCase(),
            mobile: data.mobile || null,
            bio: data.bio,
            expertise: expertiseList,
            status: AuthorStatus.PENDING,
          },
        },
      },
      include: { profile: true, authorProfile: true },
    });

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.profile?.fullName,
        authorStatus: user.authorProfile?.status,
      },
    }, 'Author registration submitted successfully! Your application is pending review.', 201);
  } catch (err) {
    next(err);
  }
});

// Login
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

router.post('/login', async (req, res, next) => {
  try {
    const data = LoginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: { profile: true, authorProfile: true },
    });

    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (user.status === UserStatus.BLOCKED) {
      return sendError(res, 'This account has been blocked. Please contact platform support.', 403);
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.profile?.fullName || (user.role === Role.ADMIN ? 'Administrator' : 'User'),
        avatar: user.profile?.avatar,
        authorStatus: user.authorProfile?.status,
        authorId: user.authorProfile?.id,
      },
    }, 'Logged in successfully');
  } catch (err) {
    next(err);
  }
});

// Get current session
router.get('/me', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { profile: true, authorProfile: true },
    });

    if (!user) {
      return sendError(res, 'User session not found.', 404);
    }

    return sendSuccess(res, {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      profile: user.profile,
      authorProfile: user.authorProfile,
    });
  } catch (err) {
    next(err);
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return sendSuccess(res, null, 'Logged out successfully');
});

// Forgot password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 'Email is required', 400);

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (user) {
      const resetToken = `rst_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour
        },
      });
      // In development, we return token for easy demo testing
      return sendSuccess(res, { resetToken }, 'Password reset instructions have been sent to your email.');
    }
    return sendSuccess(res, null, 'If this email is registered, a password reset link has been dispatched.');
  } catch (err) {
    next(err);
  }
});

// Reset password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return sendError(res, 'Valid reset token and password (min 6 chars) required.', 400);
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return sendError(res, 'Reset token is invalid or has expired.', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return sendSuccess(res, null, 'Password has been successfully updated. You can now login.');
  } catch (err) {
    next(err);
  }
});

export default router;
