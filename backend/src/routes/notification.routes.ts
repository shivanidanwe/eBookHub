import { Router } from 'express';
import prisma from '../prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// GET /api/notifications
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    return sendSuccess(res, notifications);
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    await prisma.notification.updateMany({
      where: { id, userId: req.user!.id },
      data: { isRead: true },
    });
    return sendSuccess(res, null, 'Notification marked as read.');
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true },
    });
    return sendSuccess(res, null, 'All notifications marked as read.');
  } catch (err) {
    next(err);
  }
});

export default router;
