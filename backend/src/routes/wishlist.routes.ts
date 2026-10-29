import { Router } from 'express';
import prisma from '../prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// GET /api/wishlist
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const wishlist = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        book: {
          include: {
            author: { select: { fullName: true } },
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = wishlist.map((w) => ({
      id: w.id,
      bookId: w.bookId,
      book: w.book,
      addedAt: w.createdAt,
    }));

    return sendSuccess(res, items);
  } catch (err) {
    next(err);
  }
});

// POST /api/wishlist/toggle
router.post('/toggle', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { bookId } = req.body;
    if (!bookId) return sendError(res, 'Book ID is required.', 400);

    const userId = req.user!.id;
    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return sendSuccess(res, { inWishlist: false }, 'Removed from wishlist.');
    } else {
      await prisma.wishlistItem.create({
        data: { userId, bookId },
      });
      return sendSuccess(res, { inWishlist: true }, 'Added to wishlist.');
    }
  } catch (err) {
    next(err);
  }
});

export default router;
