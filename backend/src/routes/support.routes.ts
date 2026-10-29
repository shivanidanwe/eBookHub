import { Router } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

// GET /api/support/tickets
router.get('/tickets', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const isAdmin = req.user!.role === Role.ADMIN;
    const tickets = await prisma.supportTicket.findMany({
      where: isAdmin ? {} : { userId: req.user!.id },
      include: {
        user: { select: { email: true, profile: { select: { fullName: true } } } },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return sendSuccess(res, tickets);
  } catch (err) {
    next(err);
  }
});

// POST /api/support/tickets
const CreateTicketSchema = z.object({
  subject: z.string().min(5),
  category: z.string().default('GENERAL'),
  priority: z.string().default('MEDIUM'),
  message: z.string().min(10),
});

router.post('/tickets', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = CreateTicketSchema.parse(req.body);
    const userId = req.user!.id;
    const ticketNumber = `TKT${Math.floor(1000 + Math.random() * 9000)}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId,
        subject: data.subject,
        category: data.category,
        priority: data.priority,
        messages: {
          create: {
            senderId: userId,
            senderRole: req.user!.role,
            message: data.message,
          },
        },
      },
      include: { messages: true },
    });

    return sendSuccess(res, ticket, 'Support ticket created successfully.', 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/support/tickets/:id
router.get('/tickets/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user!.role === Role.ADMIN;

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        OR: [{ id }, { ticketNumber: id }],
        ...(isAdmin ? {} : { userId: req.user!.id }),
      },
      include: {
        messages: {
          include: {
            sender: { select: { email: true, profile: { select: { fullName: true } } } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) return sendError(res, 'Ticket not found.', 404);

    return sendSuccess(res, ticket);
  } catch (err) {
    next(err);
  }
});

// POST /api/support/tickets/:id/reply
router.post('/tickets/:id/reply', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    if (!message || !message.trim()) {
      return sendError(res, 'Message is required.', 400);
    }

    const isAdmin = req.user!.role === Role.ADMIN;
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        OR: [{ id }, { ticketNumber: id }],
        ...(isAdmin ? {} : { userId: req.user!.id }),
      },
    });

    if (!ticket) return sendError(res, 'Ticket not found.', 404);

    const newMsg = await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: req.user!.id,
        senderRole: req.user!.role,
        message: message.trim(),
      },
      include: {
        sender: { select: { email: true, profile: { select: { fullName: true } } } },
      },
    });

    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { updatedAt: new Date() },
    });

    return sendSuccess(res, newMsg, 'Reply posted.');
  } catch (err) {
    next(err);
  }
});

export default router;
