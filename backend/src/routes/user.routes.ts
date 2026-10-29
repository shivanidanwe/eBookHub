import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth';
import { BookStatus } from '@prisma/client';

const router = Router();

// GET /api/user/dashboard (Reader / Student Dashboard metrics & recently purchased)
router.get('/dashboard', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const [
      purchasedCount,
      wishlistCount,
      ordersCount,
      entitlements,
      progressList,
      userProfile,
    ] = await Promise.all([
      prisma.entitlement.count({ where: { userId, isActive: true } }),
      prisma.wishlistItem.count({ where: { userId } }),
      prisma.order.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.entitlement.findMany({
        where: { userId, isActive: true },
        include: {
          book: {
            include: {
              category: true,
              author: { select: { id: true, fullName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      prisma.readingProgress.findMany({
        where: { userId },
        include: {
          book: {
            include: {
              author: { select: { fullName: true } },
            },
          },
        },
        orderBy: { lastReadAt: 'desc' },
        take: 4,
      }),
      prisma.userProfile.findUnique({ where: { userId } }),
    ]);

    // Recommended books (matching user interests or popular)
    const recommendedBooks = await prisma.book.findMany({
      where: {
        status: BookStatus.APPROVED,
        entitlements: {
          none: { userId }, // Do not recommend already purchased books!
        },
      },
      include: {
        category: true,
        author: { select: { id: true, fullName: true } },
      },
      orderBy: { averageRating: 'desc' },
      take: 6,
    });

    return sendSuccess(res, {
      user: {
        fullName: userProfile?.fullName || 'Student',
        email: req.user!.email,
      },
      stats: {
        purchasedBooks: purchasedCount,
        wishlist: wishlistCount,
        orders: ordersCount,
      },
      recentlyPurchased: entitlements.map((e) => ({
        ...e.book,
        orderId: e.orderId,
        purchasedAt: e.createdAt,
      })),
      continueReading: progressList,
      recommended: recommendedBooks,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/user/profile
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: req.user!.id },
    });
    return sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
});

// PUT /api/user/profile
const ProfileUpdateSchema = z.object({
  fullName: z.string().min(2),
  mobile: z.string().optional().nullable(),
  preferredLanguage: z.string().optional(),
  interests: z.array(z.string()).optional(),
  bio: z.string().optional().nullable(),
});

router.put('/profile', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = ProfileUpdateSchema.parse(req.body);
    const updated = await prisma.userProfile.upsert({
      where: { userId: req.user!.id },
      update: {
        fullName: data.fullName,
        mobile: data.mobile || null,
        preferredLanguage: data.preferredLanguage || 'English',
        interests: data.interests || [],
        bio: data.bio || null,
      },
      create: {
        userId: req.user!.id,
        fullName: data.fullName,
        mobile: data.mobile || null,
        preferredLanguage: data.preferredLanguage || 'English',
        interests: data.interests || [],
        bio: data.bio || null,
      },
    });

    return sendSuccess(res, updated, 'Profile updated successfully.');
  } catch (err) {
    next(err);
  }
});

// PUT /api/user/security/password
router.put('/security/password', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return sendError(res, 'New password must be at least 6 characters.', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return sendError(res, 'User not found.', 404);

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      return sendError(res, 'Current password is incorrect.', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { passwordHash },
    });

    return sendSuccess(res, null, 'Password successfully changed.');
  } catch (err) {
    next(err);
  }
});

export default router;
