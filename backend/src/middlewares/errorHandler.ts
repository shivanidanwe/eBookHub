import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error occurred:', err);

  if (err instanceof ZodError) {
    const errorMessages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return sendError(res, `Validation failed: ${errorMessages}`, 400, err.errors);
  }

  if (err.name === 'MulterError') {
    return sendError(res, `Upload error: ${err.message}`, 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal error occurred.';

  return sendError(res, message, statusCode);
}
