import { Router } from 'express';
import prisma from '../prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth';
import { BookStatus, DiscountType } from '@prisma/client';

const router = Router();

// GET /api/cart
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const cartItems = await prisma.cartItem.findMany({
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

    let subtotal = 0;
    const items = cartItems.map((ci) => {
      const activePrice = ci.book.discountPrice || ci.book.price;
      subtotal += activePrice;
      return {
        id: ci.id,
        bookId: ci.bookId,
        title: ci.book.title,
        coverImage: ci.book.coverImage,
        authorName: ci.book.author.fullName,
        price: ci.book.price,
        discountPrice: ci.book.discountPrice,
        effectivePrice: activePrice,
      };
    });

    return sendSuccess(res, {
      items,
      count: items.length,
      subtotal,
      currency: 'INR',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/cart/add
router.post('/add', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { bookId } = req.body;
    if (!bookId) return sendError(res, 'Book ID is required.', 400);

    const userId = req.user!.id;

    // Check if user already owns this book
    const existingEntitlement = await prisma.entitlement.findUnique({
      where: {
        userId_bookId: { userId, bookId },
      },
    });

    if (existingEntitlement && existingEntitlement.isActive) {
      return sendError(res, 'You already own this book in your Library.', 400);
    }

    const book = await prisma.book.findFirst({
      where: { id: bookId, status: BookStatus.APPROVED },
    });

    if (!book) {
      return sendError(res, 'Book not found or is currently not available for purchase.', 404);
    }

    const price = book.discountPrice || book.price;

    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_bookId: { userId, bookId },
      },
      update: {
        priceSnapshot: price,
      },
      create: {
        userId,
        bookId,
        priceSnapshot: price,
      },
    });

    return sendSuccess(res, cartItem, 'Added to cart successfully.');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/item/:bookId
router.delete('/item/:bookId', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user!.id;

    await prisma.cartItem.deleteMany({
      where: { userId, bookId },
    });

    return sendSuccess(res, null, 'Item removed from cart.');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/clear
router.delete('/clear', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user!.id },
    });
    return sendSuccess(res, null, 'Cart cleared.');
  } catch (err) {
    next(err);
  }
});

// POST /api/cart/apply-coupon
router.post('/apply-coupon', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return sendError(res, 'Coupon code is required.', 400);

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return sendError(res, 'Invalid coupon code or coupon is inactive.', 400);
    }

    const now = new Date();
    if (coupon.validFrom > now || coupon.validUntil < now) {
      return sendError(res, 'This coupon has expired.', 400);
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return sendError(res, 'Coupon usage limit has been reached.', 400);
    }

    const orderSubtotal = parseInt(subtotal, 10) || 0;
    if (orderSubtotal < coupon.minOrderValue) {
      const minInRupees = (coupon.minOrderValue / 100).toFixed(0);
      return sendError(res, `Minimum order amount of ₹${minInRupees} required for this coupon.`, 400);
    }

    let discount = 0;
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discount = Math.round((orderSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return sendSuccess(res, {
      code: coupon.code,
      discount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      description: coupon.description,
    }, 'Coupon applied successfully!');
  } catch (err) {
    next(err);
  }
});

export default router;
