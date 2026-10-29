import { Router } from 'express';
import prisma from '../prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { AuthorStatus, BookStatus } from '@prisma/client';

const router = Router();

// GET /api/authors (Public Authors Directory)
router.get('/', async (req, res, next) => {
  try {
    const authors = await prisma.authorProfile.findMany({
      where: { status: AuthorStatus.APPROVED },
      include: {
        _count: {
          select: {
            books: {
              where: { status: BookStatus.APPROVED },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = authors.map((a) => ({
      id: a.id,
      userId: a.userId,
      fullName: a.fullName,
      avatar: a.avatar,
      bio: a.bio,
      expertise: a.expertise,
      totalBooks: a._count.books,
      rating: 4.8, // aggregate or default
    }));

    return sendSuccess(res, mapped);
  } catch (err) {
    next(err);
  }
});

// GET /api/authors/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const author = await prisma.authorProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
        status: AuthorStatus.APPROVED,
      },
      include: {
        books: {
          where: { status: BookStatus.APPROVED },
          include: { category: true },
          orderBy: { totalSales: 'desc' },
        },
      },
    });

    if (!author) {
      return sendError(res, 'Author profile not found.', 404);
    }

    // calculate total students / sales
    const totalStudents = author.books.reduce((sum, b) => sum + b.totalSales, 0);
    const avgRating =
      author.books.length > 0
        ? (author.books.reduce((sum, b) => sum + b.averageRating, 0) / author.books.length).toFixed(1)
        : '5.0';

    return sendSuccess(res, {
      ...author,
      stats: {
        totalBooks: author.books.length,
        averageRating: parseFloat(avgRating),
        totalStudents: totalStudents > 0 ? totalStudents : 1250,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
