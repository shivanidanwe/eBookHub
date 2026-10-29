import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { authenticate, authorize, AuthenticatedRequest } from '../middlewares/auth';
import { upload } from '../middlewares/upload';
import { Role, BookStatus, AuthorStatus, PayoutStatus, LedgerType, NotificationType } from '@prisma/client';
import { createSamplePdf, createSvgCover } from '../utils/pdfGenerator';
import path from 'path';
import fs from 'fs';

const router = Router();

// Middleware: Authenticate & Authorize Author role or Admin
router.use(authenticate);
router.use(authorize([Role.AUTHOR, Role.ADMIN]));

// GET /api/author/dashboard (Metrics, monthly sales, recent orders)
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authorProfile = await prisma.authorProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!authorProfile) {
      return sendError(res, 'Author profile not found.', 404);
    }

    const authorId = authorProfile.id;

    // Books metrics
    const [totalBooks, publishedBooks, pendingBooks, rejectedBooks] = await Promise.all([
      prisma.book.count({ where: { authorId } }),
      prisma.book.count({ where: { authorId, status: BookStatus.APPROVED } }),
      prisma.book.count({ where: { authorId, status: BookStatus.PENDING_APPROVAL } }),
      prisma.book.count({ where: { authorId, status: BookStatus.REJECTED } }),
    ]);

    // Order items & sales
    const orderItems = await prisma.orderItem.findMany({
      where: { authorId },
      include: {
        order: { select: { id: true, orderNumber: true, createdAt: true, status: true, billingName: true } },
        book: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalUnitsSold = orderItems.length;
    const grossSales = orderItems.reduce((sum, item) => sum + item.price, 0);
    const platformCommission = orderItems.reduce((sum, item) => sum + item.platformCommission, 0);
    const netEarnings = orderItems.reduce((sum, item) => sum + item.authorEarnings, 0);

    // Sales Overview (last 6 months aggregate)
    const monthlySales: Record<string, number> = {};
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    months.forEach((m) => (monthlySales[m] = 0));

    orderItems.forEach((item) => {
      const monthName = item.createdAt.toLocaleString('en-US', { month: 'short' });
      if (monthlySales[monthName] !== undefined) {
        monthlySales[monthName] += item.authorEarnings / 100; // in INR
      } else {
        monthlySales[monthName] = item.authorEarnings / 100;
      }
    });

    const salesChartData = Object.entries(monthlySales).map(([month, earnings]) => ({
      month,
      earnings: Math.round(earnings),
    }));

    // Recent orders
    const recentOrders = orderItems.slice(0, 5).map((item) => ({
      orderId: item.order.orderNumber,
      bookTitle: item.book.title,
      date: item.createdAt,
      amount: item.price,
      status: item.order.status,
    }));

    return sendSuccess(res, {
      author: {
        fullName: authorProfile.fullName,
        status: authorProfile.status,
      },
      metrics: {
        totalBooks,
        publishedBooks,
        pendingApprovals: pendingBooks,
        rejectedBooks,
        totalSales: totalUnitsSold,
        grossSales,
        platformCommission,
        totalEarnings: authorProfile.totalEarnings,
        availableBalance: authorProfile.availableBalance,
        averageRating: 4.8,
      },
      salesOverview: salesChartData,
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/author/books (Author's books with status filtering)
router.get('/books', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authorProfile = await prisma.authorProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!authorProfile) return sendError(res, 'Author profile not found.', 404);

    const { status } = req.query as { status?: string };
    const where: any = { authorId: authorProfile.id };
    if (status && status !== 'ALL') {
      where.status = status as BookStatus;
    }

    const books = await prisma.book.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, books);
  } catch (err) {
    next(err);
  }
});

// GET /api/author/books/:bookId
router.get('/books/:bookId', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authorProfile = await prisma.authorProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!authorProfile) return sendError(res, 'Author profile not found.', 404);

    const { bookId } = req.params;
    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        authorId: authorProfile.id,
      },
      include: {
        category: true,
        files: true,
        previews: true,
        reviews: {
          include: {
            user: { select: { profile: { select: { fullName: true } } } },
          },
        },
        orderItems: {
          include: { order: true },
          take: 10,
        },
      },
    });

    if (!book) return sendError(res, 'Book not found.', 404);

    return sendSuccess(res, book);
  } catch (err) {
    next(err);
  }
});

// POST /api/author/books (Create new book & upload files)
router.post(
  '/books',
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
    { name: 'preview', maxCount: 1 },
  ]),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authorProfile = await prisma.authorProfile.findUnique({
        where: { userId: req.user!.id },
      });
      if (!authorProfile) return sendError(res, 'Author profile not found.', 404);

      if (authorProfile.status !== AuthorStatus.APPROVED && req.user!.role !== Role.ADMIN) {
        return sendError(res, 'Only approved authors can publish books. Your application is under review.', 403);
      }

      const {
        title,
        subtitle,
        description,
        categoryId,
        price,
        discountPrice,
        language = 'English',
        isbn,
        targetExam,
        educationalLevel,
        tags,
        tableOfContents,
        keyFeatures,
        submitForReview = 'true',
      } = req.body;

      if (!title || !description || !categoryId || !price) {
        return sendError(res, 'Title, description, category, and price are required.', 400);
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      // Generate slug
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

      // Handle cover image
      let coverUrl = `/uploads/covers/${uniqueSlug}-cover.svg`;
      if (files?.cover && files.cover[0]) {
        coverUrl = `/uploads/covers/${files.cover[0].filename}`;
      } else {
        const coverPath = path.resolve(__dirname, '../../../uploads/covers', `${uniqueSlug}-cover.svg`);
        createSvgCover(coverPath, title, authorProfile.fullName, 'Education');
      }

      // Handle PDF file
      let pdfFilePath = `/uploads/pdfs/${uniqueSlug}-full.pdf`;
      let pdfFileSize = 50000;
      if (files?.pdf && files.pdf[0]) {
        pdfFilePath = `/uploads/pdfs/${files.pdf[0].filename}`;
        pdfFileSize = files.pdf[0].size;
      } else {
        const pdfDiskPath = path.resolve(__dirname, '../../../uploads/pdfs', `${uniqueSlug}-full.pdf`);
        createSamplePdf(pdfDiskPath, title, authorProfile.fullName, 15);
        pdfFileSize = fs.statSync(pdfDiskPath).size;
      }

      // Handle Preview file
      let previewPath = `/uploads/previews/${uniqueSlug}-preview.pdf`;
      if (files?.preview && files.preview[0]) {
        previewPath = `/uploads/previews/${files.preview[0].filename}`;
      } else {
        const previewDiskPath = path.resolve(__dirname, '../../../uploads/previews', `${uniqueSlug}-preview.pdf`);
        createSamplePdf(previewDiskPath, `${title} [Preview]`, authorProfile.fullName, 3);
      }

      const priceInPaise = Math.round(parseFloat(price) * 100);
      const discountPriceInPaise = discountPrice ? Math.round(parseFloat(discountPrice) * 100) : null;
      const shouldSubmit = submitForReview === 'true' || submitForReview === true;

      const newBook = await prisma.book.create({
        data: {
          slug: uniqueSlug,
          title,
          subtitle: subtitle || null,
          description,
          categoryId,
          authorId: authorProfile.id,
          price: priceInPaise,
          discountPrice: discountPriceInPaise,
          coverImage: coverUrl,
          language,
          isbn: isbn || null,
          targetExam: targetExam || null,
          educationalLevel: educationalLevel || 'Intermediate',
          tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : [],
          tableOfContents: tableOfContents || null,
          keyFeatures: Array.isArray(keyFeatures) ? keyFeatures : [],
          status: shouldSubmit ? BookStatus.PENDING_APPROVAL : BookStatus.DRAFT,
          totalPages: 120,
          files: {
            create: {
              filePath: pdfFilePath,
              fileName: `${uniqueSlug}.pdf`,
              fileSize: pdfFileSize,
              mimeType: 'application/pdf',
            },
          },
          previews: {
            create: {
              previewPath,
              samplePagesCount: 3,
            },
          },
        },
        include: { category: true },
      });

      // Notify Admin if submitted for review
      if (shouldSubmit) {
        const adminUsers = await prisma.user.findMany({ where: { role: Role.ADMIN } });
        for (const admin of adminUsers) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              title: 'New Book Submitted for Approval',
              message: `"${title}" by ${authorProfile.fullName} is awaiting moderation.`,
              type: NotificationType.BOOK_STATUS,
              link: '/admin/book-approvals',
            },
          });
        }
      }

      return sendSuccess(res, newBook, shouldSubmit ? 'Book submitted for review successfully.' : 'Book saved as draft.', 201);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/author/books/:bookId (Edit book)
router.put('/books/:bookId', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authorProfile = await prisma.authorProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!authorProfile) return sendError(res, 'Author profile not found.', 404);

    const { bookId } = req.params;
    const { title, subtitle, description, categoryId, price, discountPrice, language, submitForReview } = req.body;

    const book = await prisma.book.findFirst({
      where: { id: bookId, authorId: authorProfile.id },
    });
    if (!book) return sendError(res, 'Book not found.', 404);

    const updated = await prisma.book.update({
      where: { id: bookId },
      data: {
        ...(title ? { title } : {}),
        ...(subtitle !== undefined ? { subtitle } : {}),
        ...(description ? { description } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(price ? { price: Math.round(parseFloat(price) * 100) } : {}),
        ...(discountPrice !== undefined ? { discountPrice: discountPrice ? Math.round(parseFloat(discountPrice) * 100) : null } : {}),
        ...(language ? { language } : {}),
        ...(submitForReview ? { status: BookStatus.PENDING_APPROVAL, rejectionReason: null } : {}),
      },
    });

    return sendSuccess(res, updated, 'Book updated successfully.');
  } catch (err) {
    next(err);
  }
});

// GET /api/author/sales (Sales & orders)
router.get('/sales', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authorProfile = await prisma.authorProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!authorProfile) return sendError(res, 'Author profile not found.', 404);

    const items = await prisma.orderItem.findMany({
      where: { authorId: authorProfile.id },
      include: {
        order: { select: { orderNumber: true, status: true, createdAt: true, billingName: true } },
        book: { select: { title: true, coverImage: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, items);
  } catch (err) {
    next(err);
  }
});

// GET /api/author/ledger (Financial ledger)
router.get('/ledger', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authorProfile = await prisma.authorProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!authorProfile) return sendError(res, 'Author profile not found.', 404);

    const ledger = await prisma.ledgerEntry.findMany({
      where: { authorId: authorProfile.id },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, {
      availableBalance: authorProfile.availableBalance,
      totalEarnings: authorProfile.totalEarnings,
      entries: ledger,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/author/payouts (Payout requests history)
router.get('/payouts', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authorProfile = await prisma.authorProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!authorProfile) return sendError(res, 'Author profile not found.', 404);

    const payouts = await prisma.payoutRequest.findMany({
      where: { authorId: authorProfile.id },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, {
      availableBalance: authorProfile.availableBalance,
      minimumPayout: 100000, // ₹1,000.00
      bankDetails: {
        bankName: authorProfile.bankName,
        accountNumber: authorProfile.accountNumber,
        ifscCode: authorProfile.ifscCode,
        upiId: authorProfile.upiId,
      },
      payouts,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/author/payouts/request (Request new payout)
const RequestPayoutSchema = z.object({
  amount: z.number().min(1000, 'Minimum payout is ₹1,000'),
});

router.post('/payouts/request', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = RequestPayoutSchema.parse(req.body);
    const authorProfile = await prisma.authorProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!authorProfile) return sendError(res, 'Author profile not found.', 404);

    const amountInPaise = Math.round(data.amount * 100);

    if (authorProfile.availableBalance < amountInPaise) {
      return sendError(res, `Requested amount exceeds available balance of ₹${(authorProfile.availableBalance / 100).toFixed(0)}.`, 400);
    }

    const payoutNumber = `PAY${Math.floor(1000 + Math.random() * 9000)}`;

    const payout = await prisma.$transaction(async (tx) => {
      // Deduct from available balance
      const updatedProfile = await tx.authorProfile.update({
        where: { id: authorProfile.id },
        data: {
          availableBalance: authorProfile.availableBalance - amountInPaise,
        },
      });

      const newPayout = await tx.payoutRequest.create({
        data: {
          payoutNumber,
          authorId: authorProfile.id,
          amount: amountInPaise,
          availableBalanceSnapshot: updatedProfile.availableBalance,
          status: PayoutStatus.REQUESTED,
        },
      });

      await tx.ledgerEntry.create({
        data: {
          authorId: authorProfile.id,
          type: LedgerType.PAYOUT_DEBIT,
          amount: amountInPaise,
          balanceAfter: updatedProfile.availableBalance,
          description: `Payout request #${payoutNumber} submitted`,
        },
      });

      return newPayout;
    });

    return sendSuccess(res, payout, 'Payout request submitted successfully. It will be reviewed by administration.', 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/author/reviews (Ratings & reviews breakdown)
router.get('/reviews', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authorProfile = await prisma.authorProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!authorProfile) return sendError(res, 'Author profile not found.', 404);

    const books = await prisma.book.findMany({
      where: { authorId: authorProfile.id },
      select: { id: true },
    });
    const bookIds = books.map((b) => b.id);

    const reviews = await prisma.review.findMany({
      where: { bookId: { in: bookIds } },
      include: {
        book: { select: { title: true } },
        user: { select: { profile: { select: { fullName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (starCounts[r.rating as keyof typeof starCounts] !== undefined) {
        starCounts[r.rating as keyof typeof starCounts]++;
      }
    });

    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : '5.0';

    return sendSuccess(res, {
      averageRating: parseFloat(avg),
      totalReviews: total,
      starDistribution: starCounts,
      reviews,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/author/profile
router.get('/profile', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await prisma.authorProfile.findUnique({
      where: { userId: req.user!.id },
    });
    return sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
});

// PUT /api/author/profile (Update details, bank details, tax details)
router.put('/profile', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { fullName, mobile, bio, expertise, bankName, accountNumber, ifscCode, upiId, panNumber, gstNumber } = req.body;

    const updated = await prisma.authorProfile.update({
      where: { userId: req.user!.id },
      data: {
        ...(fullName ? { fullName } : {}),
        ...(mobile !== undefined ? { mobile } : {}),
        ...(bio ? { bio } : {}),
        ...(expertise ? { expertise: Array.isArray(expertise) ? expertise : [expertise] } : {}),
        ...(bankName !== undefined ? { bankName } : {}),
        ...(accountNumber !== undefined ? { accountNumber } : {}),
        ...(ifscCode !== undefined ? { ifscCode } : {}),
        ...(upiId !== undefined ? { upiId } : {}),
        ...(panNumber !== undefined ? { panNumber } : {}),
        ...(gstNumber !== undefined ? { gstNumber } : {}),
      },
    });

    return sendSuccess(res, updated, 'Author profile and payment details updated.');
  } catch (err) {
    next(err);
  }
});

export default router;
