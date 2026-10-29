import { Router } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth';
import { OrderStatus, PaymentStatus, PaymentProvider, LedgerType, NotificationType } from '@prisma/client';
import { config } from '../config';

const router = Router();

// POST /api/payments/initiate
// Initiates sandbox session
router.post('/initiate', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (config.nodeEnv === 'production' || config.paymentProvider !== 'DEMO') {
      return sendError(res, 'A verified payment provider is not configured for this environment.', 503);
    }

    const { orderId, method = 'RAZORPAY_SANDBOX' } = req.body;
    if (!orderId) return sendError(res, 'Order ID is required.', 400);

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user!.id, status: OrderStatus.PENDING },
    });

    if (!order) {
      return sendError(res, 'Pending order not found.', 404);
    }

    const providerOrderId = `demo_ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const payment = await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        providerOrderId,
        amount: order.totalAmount,
        currency: order.currency,
        status: PaymentStatus.PENDING,
        provider: PaymentProvider.DEMO,
      },
      create: {
        orderId: order.id,
        userId: req.user!.id,
        amount: order.totalAmount,
        currency: order.currency,
        provider: PaymentProvider.DEMO,
        providerOrderId,
        status: PaymentStatus.PENDING,
      },
    });

    return sendSuccess(res, {
      paymentId: payment.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      currency: order.currency,
      providerOrderId,
      mode: 'DEMO',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/verify
// Atomically verifies payment, grants library entitlements, updates ledger and author balances, clears cart
const VerifyPaymentSchema = z.object({
  orderId: z.string(),
  paymentId: z.string().optional(),
  providerPaymentId: z.string().optional(),
  signature: z.string().optional(),
  simulateSuccess: z.boolean().optional(),
});

router.post('/verify', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = VerifyPaymentSchema.parse(req.body);
    const userId = req.user!.id;

    const order = await prisma.order.findFirst({
      where: { id: data.orderId, userId },
      include: {
        items: { include: { book: true } },
        payment: true,
      },
    });

    if (!order) {
      return sendError(res, 'Order not found.', 404);
    }

    if (order.status === OrderStatus.COMPLETED) {
      return sendSuccess(res, { orderId: order.id, status: 'COMPLETED' }, 'Payment already verified.');
    }

    const payment = order.payment;
    if (!payment) {
      return sendError(res, 'A pending payment was not found for this order.', 409);
    }

    if (config.nodeEnv === 'production' || config.paymentProvider !== 'DEMO' || data.simulateSuccess !== true) {
      return sendError(res, 'Payment could not be verified by the configured provider.', 403);
    }

    if (
      payment.provider !== PaymentProvider.DEMO ||
      payment.status !== PaymentStatus.PENDING ||
      payment.amount !== order.totalAmount ||
      payment.currency !== order.currency
    ) {
      return sendError(res, 'A matching pending demo payment was not found for this order.', 409);
    }

    const actualPaymentId = `demo_pay_${payment.id}`;

    // Perform atomic transaction: Order -> Completed, Payment -> Success, Entitlements -> Created, Ledger -> Updated, Cart -> Cleared
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Order
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.COMPLETED },
      });

      // 2. Update Payment
      await tx.payment.update({
        where: { orderId: order.id },
        data: {
          status: PaymentStatus.SUCCESS,
          providerPaymentId: actualPaymentId,
          providerSignature: null,
          rawResponse: JSON.stringify({ simulated: true, mode: 'DEMO', timestamp: new Date() }),
        },
      });

      // 3. Create Entitlements and update book sales
      for (const item of order.items) {
        await tx.entitlement.upsert({
          where: { userId_bookId: { userId, bookId: item.bookId } },
          update: { isActive: true },
          create: {
            userId,
            bookId: item.bookId,
            orderId: order.id,
            isActive: true,
          },
        });

        if (payment.provider !== PaymentProvider.DEMO) {
          await tx.book.update({
            where: { id: item.bookId },
            data: { totalSales: { increment: 1 } },
          });

          const authorProfile = await tx.authorProfile.findUnique({
            where: { id: item.authorId },
          });

          if (authorProfile) {
            const newBalance = authorProfile.availableBalance + item.authorEarnings;
            const newTotalEarnings = authorProfile.totalEarnings + item.authorEarnings;

            await tx.authorProfile.update({
              where: { id: item.authorId },
              data: {
                availableBalance: newBalance,
                totalEarnings: newTotalEarnings,
              },
            });

            await tx.ledgerEntry.create({
              data: {
                authorId: item.authorId,
                orderId: order.id,
                type: LedgerType.SALE_CREDIT,
                amount: item.authorEarnings,
                balanceAfter: newBalance,
                description: `Earnings for ${item.book.title} (Order #${order.orderNumber})`,
              },
            });
          }
        }
      }

      // 5. Clear purchased items from Cart
      const purchasedBookIds = order.items.map((i) => i.bookId);
      await tx.cartItem.deleteMany({
        where: {
          userId,
          bookId: { in: purchasedBookIds },
        },
      });

      // 6. Send User In-App Notification
      await tx.notification.create({
        data: {
          userId,
          title: 'Demo checkout complete',
          message: `Demo order #${order.orderNumber} is complete. No payment was collected; demo books were added to your Library.`,
          type: NotificationType.PAYMENT,
          link: '/user/library',
        },
      });

      return updatedOrder;
    });

    return sendSuccess(res, {
      orderId: result.id,
      orderNumber: result.orderNumber,
      amount: result.totalAmount,
      status: 'COMPLETED',
      mode: 'DEMO',
    }, 'Demo payment recorded and library access granted.');
  } catch (err) {
    next(err);
  }
});

export default router;
