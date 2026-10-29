import { Router } from 'express';
import prisma from '../prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth';
import path from 'path';
import fs from 'fs';
import { Role } from '@prisma/client';

const router = Router();

// GET /api/library (Purchased books)
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const entitlements = await prisma.entitlement.findMany({
      where: { userId, isActive: true },
      include: {
        book: {
          include: {
            author: { select: { fullName: true } },
            category: { select: { name: true } },
            readingProgress: {
              where: { userId },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const libraryItems = entitlements.map((ent) => {
      const progress = ent.book.readingProgress[0];
      return {
        id: ent.id,
        bookId: ent.bookId,
        title: ent.book.title,
        slug: ent.book.slug,
        coverImage: ent.book.coverImage,
        authorName: ent.book.author.fullName,
        categoryName: ent.book.category.name,
        totalPages: ent.book.totalPages,
        purchasedAt: ent.createdAt,
        downloadCount: ent.downloadCount,
        currentPage: progress?.currentPage || 1,
        progressPercent: progress?.progressPercent || 0,
        lastReadAt: progress?.lastReadAt || null,
      };
    });

    return sendSuccess(res, libraryItems);
  } catch (err) {
    next(err);
  }
});

// GET /api/library/:bookId (Reader meta & access check)
router.get('/:bookId', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user!.id;

    // Check entitlement (or admin)
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId,
        isActive: true,
        OR: [{ bookId }, { book: { slug: bookId } }],
      },
      include: {
        book: {
          include: {
            author: { select: { fullName: true } },
            readingProgress: { where: { userId } },
            bookmarks: { where: { userId }, orderBy: { pageNumber: 'asc' } },
          },
        },
      },
    });

    // Check if author viewing their own book
    let authorOwnsBook = false;
    if (!entitlement && req.user!.authorProfileId) {
      const book = await prisma.book.findFirst({
        where: {
          authorId: req.user!.authorProfileId,
          OR: [{ id: bookId }, { slug: bookId }],
        },
        include: {
          author: { select: { fullName: true } },
          readingProgress: { where: { userId } },
          bookmarks: { where: { userId } },
        },
      });
      if (book) authorOwnsBook = true;
    }

    if (!entitlement && !authorOwnsBook && req.user!.role !== Role.ADMIN) {
      return sendError(res, 'Access denied. You do not own an active license for this book.', 403);
    }

    const book = entitlement
      ? entitlement.book
      : await prisma.book.findFirst({
          where: { OR: [{ id: bookId }, { slug: bookId }] },
          include: {
            author: { select: { fullName: true } },
            readingProgress: { where: { userId } },
            bookmarks: { where: { userId } },
          },
        });

    if (!book) return sendError(res, 'Book not found.', 404);

    const progress = book.readingProgress[0];

    return sendSuccess(res, {
      bookId: book.id,
      title: book.title,
      slug: book.slug,
      coverImage: book.coverImage,
      authorName: book.author.fullName,
      totalPages: book.totalPages,
      currentPage: progress?.currentPage || 1,
      progressPercent: progress?.progressPercent || 0,
      bookmarks: book.bookmarks,
      tableOfContents: book.tableOfContents,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/library/:bookId/progress (Save reading progress)
router.post('/:bookId/progress', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { bookId } = req.params;
    const { currentPage, totalPages } = req.body;
    const userId = req.user!.id;

    const book = await prisma.book.findFirst({
      where: { OR: [{ id: bookId }, { slug: bookId }] },
    });

    if (!book) return sendError(res, 'Book not found.', 404);

    const pages = totalPages || book.totalPages || 1;
    const current = Math.min(pages, Math.max(1, parseInt(currentPage, 10) || 1));
    const percent = Math.min(100, Math.round((current / pages) * 100));

    const progress = await prisma.readingProgress.upsert({
      where: { userId_bookId: { userId, bookId: book.id } },
      update: {
        currentPage: current,
        totalPages: pages,
        progressPercent: percent,
        lastReadAt: new Date(),
      },
      create: {
        userId,
        bookId: book.id,
        currentPage: current,
        totalPages: pages,
        progressPercent: percent,
        lastReadAt: new Date(),
      },
    });

    return sendSuccess(res, progress);
  } catch (err) {
    next(err);
  }
});

// Bookmarks endpoints
router.post('/:bookId/bookmarks', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { bookId } = req.params;
    const { pageNumber, note } = req.body;
    const userId = req.user!.id;

    const book = await prisma.book.findFirst({
      where: { OR: [{ id: bookId }, { slug: bookId }] },
    });
    if (!book) return sendError(res, 'Book not found.', 404);

    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        bookId: book.id,
        pageNumber: parseInt(pageNumber, 10) || 1,
        note: note || `Bookmark at page ${pageNumber}`,
      },
    });

    return sendSuccess(res, bookmark, 'Bookmark added.');
  } catch (err) {
    next(err);
  }
});

router.delete('/:bookId/bookmarks/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    await prisma.bookmark.deleteMany({
      where: { id, userId: req.user!.id },
    });
    return sendSuccess(res, null, 'Bookmark removed.');
  } catch (err) {
    next(err);
  }
});

// SECURE PROTECTED PDF STREAM
// Blocks unauthorized users from reading the full book
router.get('/:bookId/stream', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user!.id;

    // Verify entitlement or author ownership or admin
    const book = await prisma.book.findFirst({
      where: { OR: [{ id: bookId }, { slug: bookId }] },
      include: { files: true },
    });

    if (!book) return sendError(res, 'Book not found.', 404);

    let isAuthorized = req.user!.role === Role.ADMIN;

    if (!isAuthorized && req.user!.authorProfileId && book.authorId === req.user!.authorProfileId) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      const entitlement = await prisma.entitlement.findUnique({
        where: { userId_bookId: { userId, bookId: book.id } },
      });
      if (entitlement && entitlement.isActive) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return sendError(res, 'Access denied. You do not possess an active entitlement for this eBook.', 403);
    }

    if (!book.files.length) {
      return sendError(res, 'Digital file not found for this book.', 404);
    }

    const fileRelative = book.files[0].filePath;
    const absolutePath = path.resolve(__dirname, '../../../', fileRelative.replace(/^\//, ''));

    if (!fs.existsSync(absolutePath)) {
      return sendError(res, 'Book file missing from protected storage.', 404);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${book.slug}.pdf"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    fs.createReadStream(absolutePath).pipe(res);
  } catch (err) {
    next(err);
  }
});

// SECURE PROTECTED PDF DOWNLOAD
router.get('/:bookId/download', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user!.id;

    const book = await prisma.book.findFirst({
      where: { OR: [{ id: bookId }, { slug: bookId }] },
      include: { files: true },
    });

    if (!book) return sendError(res, 'Book not found.', 404);

    let isAuthorized = req.user!.role === Role.ADMIN;
    if (!isAuthorized && req.user!.authorProfileId && book.authorId === req.user!.authorProfileId) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      const entitlement = await prisma.entitlement.findUnique({
        where: { userId_bookId: { userId, bookId: book.id } },
      });
      if (entitlement && entitlement.isActive) {
        isAuthorized = true;
        // increment download count
        await prisma.entitlement.update({
          where: { id: entitlement.id },
          data: {
            downloadCount: { increment: 1 },
            lastDownloadedAt: new Date(),
          },
        });
      }
    }

    if (!isAuthorized) {
      return sendError(res, 'Access denied. You do not have download rights for this eBook.', 403);
    }

    if (!book.files.length) {
      return sendError(res, 'Book file not found.', 404);
    }

    const fileRelative = book.files[0].filePath;
    const absolutePath = path.resolve(__dirname, '../../../', fileRelative.replace(/^\//, ''));

    if (!fs.existsSync(absolutePath)) {
      return sendError(res, 'Protected PDF file missing.', 404);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${book.slug}-eBookHub.pdf"`);
    fs.createReadStream(absolutePath).pipe(res);
  } catch (err) {
    next(err);
  }
});

export default router;
