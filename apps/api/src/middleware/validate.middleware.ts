import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@/errors/AppError';

interface ValidateTargets {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

/**
 * Zod-based request validation middleware factory.
 * Throws ValidationError (422) with field-level error details on failure.
 * On success, replaces req.body / req.params / req.query with the parsed (typed) values.
 *
 * Usage:
 *   import { z } from 'zod';
 *   const CreateLeadSchema = z.object({ email: z.string().email(), name: z.string() });
 *
 *   router.post('/leads', validate({ body: CreateLeadSchema }), leadsController.create);
 */
export function validate(targets: ValidateTargets) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (targets.body) {
        req.body = targets.body.parse(req.body);
      }
      if (targets.params) {
        req.params = targets.params.parse(req.params) as typeof req.params;
      }
      if (targets.query) {
        req.query = targets.query.parse(req.query) as typeof req.query;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
          code: i.code,
        }));
        throw new ValidationError('Request validation failed', details);
      }
      throw err;
    }
  };
}
