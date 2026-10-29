import { Router } from 'express';
import prisma from '../prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { BookStatus } from '@prisma/client';

const router = Router();

// GET /api/categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: {
            books: {
              where: { status: BookStatus.APPROVED },
            },
          },
        },
      },
    });

    const mapped = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      isFeatured: cat.isFeatured,
      bookCount: cat._count.books,
    }));

    return sendSuccess(res, mapped);
  } catch (err) {
    next(err);
  }
});

// GET /api/categories/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        books: {
          where: { status: BookStatus.APPROVED },
          include: {
            author: { select: { id: true, fullName: true, avatar: true } },
          },
          orderBy: { totalSales: 'desc' },
        },
      },
    });

    if (!category) {
      return sendError(res, 'Category not found.', 404);
    }

    return sendSuccess(res, category);
  } catch (err) {
    next(err);
  }
});

export default router;
