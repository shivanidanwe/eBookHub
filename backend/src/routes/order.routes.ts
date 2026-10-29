import { Router } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth';
import { OrderStatus, BookStatus } from '@prisma/client';

const router = Router();

// POST /api/orders/create
// Creates order from cart or directly via "Buy Now"
const CreateOrderSchema = z.object({
  billingName: z.string().min(2),
  billingEmail: z.string().email(),
  billingPhone: z.string().optional(),
  couponCode: z.string().optional(),
  directBookId: z.string().optional(), // If "Buy Now" without cart
});

router.post('/create', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = CreateOrderSchema.parse(req.body);
    const userId = req.user!.id;

    let bookIds: string[] = [];

    if (data.directBookId) {
      bookIds = [data.directBookId];
    } else {
      const cartItems = await prisma.cartItem.findMany({ where: { userId } });
      if (!cartItems.length) {
        return sendError(res, 'Your cart is empty.', 400);
      }
      bookIds = cartItems.map((ci) => ci.bookId);
    }

    // Verify books and prevent duplicate purchases
    const books = await prisma.book.findMany({
      where: {
        id: { in: bookIds },
        status: BookStatus.APPROVED,
      },
      include: { author: true },
    });

    if (books.length !== bookIds.length) {
      return sendError(res, 'One or more books in your order are unavailable.', 400);
    }

    // Check if user already owns any of these books
    const owned = await prisma.entitlement.findMany({
      where: {
        userId,
        bookId: { in: bookIds },
        isActive: true,
      },
    });

    if (owned.length > 0) {
      return sendError(res, 'You already own one or more books in this order.', 400);
    }

    // Calculate subtotal
    let subtotal = 0;
    const itemsData = books.map((book) => {
      const price = book.discountPrice || book.price;
      subtotal += price;
      const commissionPercent = 0.15; // 15% platform commission
      const commission = Math.round(price * commissionPercent);
      const authorEarnings = price - commission;

      return {
        bookId: book.id,
        authorId: book.authorId,
        price,
        discountPrice: book.discountPrice,
        platformCommission: commission,
        authorEarnings,
      };
    });

    // Handle coupon if provided
    let discount = 0;
    let validCouponId: string | null = null;
    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase() },
      });
      if (coupon && coupon.isActive && coupon.validUntil > new Date() && subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'PERCENTAGE') {
          discount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = coupon.discountValue;
        }
        validCouponId = coupon.id;
      }
    }

    const totalAmount = Math.max(0, subtotal - discount);
    const orderNumber = `ORD${Math.floor(10000 + Math.random() * 90000)}`;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          subtotal,
          discount,
          tax: 0,
          totalAmount,
          currency: 'INR',
          status: OrderStatus.PENDING,
          billingName: data.billingName,
          billingEmail: data.billingEmail,
          billingPhone: data.billingPhone || null,
          couponCode: data.couponCode || null,
          items: {
            create: itemsData,
          },
        },
        include: { items: true },
      });

      if (validCouponId) {
        await tx.couponRedemption.create({
          data: {
            couponId: validCouponId,
            userId,
            orderId: newOrder.id,
            discountApplied: discount,
          },
        });
        await tx.coupon.update({
          where: { id: validCouponId },
          data: { usageCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    return sendSuccess(res, order, 'Order created successfully. Ready for payment.', 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders (User order list)
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: {
            book: { select: { title: true, coverImage: true, slug: true } },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, orders);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:orderId (Single order invoice view)
router.get('/:orderId', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
        userId: req.user!.id,
      },
      include: {
        items: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                coverImage: true,
                slug: true,
                author: { select: { fullName: true } },
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!order) {
      return sendError(res, 'Order not found.', 404);
    }

    return sendSuccess(res, order);
  } catch (err) {
    next(err);
  }
});

export default router;
