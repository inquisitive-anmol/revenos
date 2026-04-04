import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

/**
 * Wraps an async route handler and forwards any rejections to next(err).
 *
 * NOTE: express-async-errors is imported in app.ts and patches Express globally,
 * so this wrapper is NOT required for normal use. It is provided as an explicit,
 * self-documenting alternative for complex controller flows or when you want
 * the safety net to be visible at the call site.
 *
 * Usage:
 *   router.get('/leads', asyncHandler(async (req, res) => {
 *     const leads = await leadsService.list();
 *     ok(res, leads);
 *   }));
 */
export function asyncHandler(fn: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
