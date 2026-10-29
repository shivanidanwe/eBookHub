import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/tokens';
import { sendError } from '../utils/response';
import { Role } from '@prisma/client';
import prisma from '../prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    authorProfileId?: string;
  };
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(res, 'Authentication required. Please login.', 401);
    }

    const payload = verifyToken(token);
    if (!payload) {
      return sendError(res, 'Session invalid or expired. Please login again.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { authorProfile: true },
    });

    if (!user) {
      return sendError(res, 'User not found.', 401);
    }

    if (user.status === 'BLOCKED') {
      return sendError(res, 'Your account has been suspended by an administrator.', 403);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      authorProfileId: user.authorProfile?.id,
    };

    next();
  } catch (err: any) {
    return sendError(res, 'Authentication verification failed.', 401);
  }
}

export function authorize(roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, `Access denied. Requires one of roles: ${roles.join(', ')}`, 403);
    }

    next();
  };
}
