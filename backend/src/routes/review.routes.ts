import { Router } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// GET /api/reviews/book/:bookId
router.get('/book/:bookId', async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const reviews = await prisma.review.findMany({
      where: {
        OR: [{ bookId }, { book: { slug: bookId } }],
        status: 'APPROVED',
      },
      include: {
        user: { select: { id: true, profile: { select: { fullName: true, avatar: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, reviews);
  } catch (err) {
    next(err);
  }
});

// POST /api/reviews/book/:bookId
const CreateReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(2, 'Title is required'),
  comment: z.string().min(5, 'Review comment must be at least 5 characters'),
});

router.post('/book/:bookId', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { bookId } = req.params;
    const data = CreateReviewSchema.parse(req.body);
    const userId = req.user!.id;

    const book = await prisma.book.findFirst({
      where: { OR: [{ id: bookId }, { slug: bookId }] },
    });
    if (!book) return sendError(res, 'Book not found.', 404);

    // Check if user owns the book (verified purchase)
    const entitlement = await prisma.entitlement.findUnique({
      where: { userId_bookId: { userId, bookId: book.id } },
    });

    const isVerifiedPurchase = Boolean(entitlement && entitlement.isActive);

    const review = await prisma.review.upsert({
      where: { bookId_userId: { bookId: book.id, userId } },
      update: {
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        isVerifiedPurchase,
      },
      create: {
        bookId: book.id,
        userId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        isVerifiedPurchase,
      },
    });

    // Update book aggregate ratings
    const allReviews = await prisma.review.findMany({
      where: { bookId: book.id, status: 'APPROVED' },
    });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.book.update({
      where: { id: book.id },
      data: {
        averageRating: parseFloat(avg.toFixed(1)),
        totalRatings: allReviews.length,
      },
    });

    return sendSuccess(res, review, 'Review submitted successfully.');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/reviews/:reviewId
router.delete('/:reviewId', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { reviewId } = req.params;
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        ...(req.user!.role !== 'ADMIN' ? { userId: req.user!.id } : {}),
      },
    });

    if (!review) return sendError(res, 'Review not found or unauthorized.', 404);

    await prisma.review.delete({ where: { id: reviewId } });
    return sendSuccess(res, null, 'Review deleted.');
  } catch (err) {
    next(err);
  }
});

export default router;
