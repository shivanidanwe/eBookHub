import { Router } from 'express';
import prisma from '../prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { BookStatus } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const router = Router();

// GET /api/books (Browse with filters, search, sorting, pagination)
router.get('/', async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      language,
      minRating,
      sort = 'popular',
      page = '1',
      limit = '12',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      status: BookStatus.APPROVED, // Only approved books in public catalog!
    };

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { subtitle: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
        { tags: { has: search.trim() } },
        { author: { fullName: { contains: search.trim(), mode: 'insensitive' } } },
      ];
    }

    if (category && category !== 'all') {
      where.category = {
        slug: category,
      };
    }

    if (language) {
      where.language = { contains: language, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice, 10) * 100; // convert INR to paise
      if (maxPrice) where.price.lte = parseInt(maxPrice, 10) * 100;
    }

    if (minRating) {
      where.averageRating = { gte: parseFloat(minRating) };
    }

    let orderBy: any = { totalSales: 'desc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };
    if (sort === 'price-low') orderBy = { price: 'asc' };
    if (sort === 'price-high') orderBy = { price: 'desc' };
    if (sort === 'rating') orderBy = { averageRating: 'desc' };
    if (sort === 'title') orderBy = { title: 'asc' };

    const [total, books] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, fullName: true, avatar: true } },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
    ]);

    return sendSuccess(res, {
      books,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/books/featured (Homepage sections)
router.get('/featured', async (req, res, next) => {
  try {
    const [trending, bestSellers, newReleases, competitive] = await Promise.all([
      prisma.book.findMany({
        where: { status: BookStatus.APPROVED },
        include: {
          category: true,
          author: { select: { id: true, fullName: true, avatar: true } },
        },
        orderBy: { totalViews: 'desc' },
        take: 6,
      }),
      prisma.book.findMany({
        where: { status: BookStatus.APPROVED },
        include: {
          category: true,
          author: { select: { id: true, fullName: true, avatar: true } },
        },
        orderBy: { totalSales: 'desc' },
        take: 6,
      }),
      prisma.book.findMany({
        where: { status: BookStatus.APPROVED },
        include: {
          category: true,
          author: { select: { id: true, fullName: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      prisma.book.findMany({
        where: {
          status: BookStatus.APPROVED,
          OR: [
            { category: { slug: 'competitive-exams' } },
            { category: { slug: 'aptitude' } },
            { targetExam: { not: null } },
          ],
        },
        include: {
          category: true,
          author: { select: { id: true, fullName: true, avatar: true } },
        },
        orderBy: { averageRating: 'desc' },
        take: 6,
      }),
    ]);

    return sendSuccess(res, {
      trending,
      bestSellers,
      newReleases,
      competitive,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/books/:slug (Book Details page)
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const book = await prisma.book.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        status: BookStatus.APPROVED,
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            bio: true,
            expertise: true,
            _count: { select: { books: true } },
          },
        },
        previews: true,
        reviews: {
          where: { status: 'APPROVED' },
          include: {
            user: { select: { id: true, profile: { select: { fullName: true, avatar: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!book) {
      return sendError(res, 'Book not found or is currently not published.', 404);
    }

    // Increment views safely
    await prisma.book.update({
      where: { id: book.id },
      data: { totalViews: { increment: 1 } },
    });

    // Fetch related books in same category
    const relatedBooks = await prisma.book.findMany({
      where: {
        categoryId: book.categoryId,
        id: { not: book.id },
        status: BookStatus.APPROVED,
      },
      include: {
        category: true,
        author: { select: { id: true, fullName: true } },
      },
      take: 4,
    });

    return sendSuccess(res, {
      ...book,
      relatedBooks,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/books/:id/preview-file (Public sample preview PDF)
router.get('/:id/preview-file', async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await prisma.book.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { previews: true },
    });

    if (!book || !book.previews.length) {
      return sendError(res, 'Sample preview is not available for this book.', 404);
    }

    const previewRelativePath = book.previews[0].previewPath;
    const absolutePath = path.resolve(__dirname, '../../../', previewRelativePath.replace(/^\//, ''));

    if (!fs.existsSync(absolutePath)) {
      return sendError(res, 'Preview file not found on disk.', 404);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${book.slug}-preview.pdf"`);
    fs.createReadStream(absolutePath).pipe(res);
  } catch (err) {
    next(err);
  }
});

export default router;
