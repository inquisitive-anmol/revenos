import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '@/utils/asyncHandler';
import { validate } from '@/middleware/validate.middleware';
import {
  listLeadsHandler,
  getLeadHandler,
  takeoverLeadHandler,
  handbackLeadHandler,
} from '@/controllers/leads.controller';

const router = Router();

const ListLeadsQuerySchema = z.object({
  status: z.string().optional(),
  campaignId: z.string().optional(),
  score_gte: z.string().optional(), // querystring comes as string
  page: z.string().optional(),
  limit: z.string().optional(),
});

router.get(
  '/',
  validate({ query: ListLeadsQuerySchema }),
  asyncHandler(listLeadsHandler)
);

router.get(
  '/:id',
  validate({ params: z.object({ id: z.string() }) }),
  asyncHandler(getLeadHandler)
);

router.patch(
  '/:id/takeover',
  validate({ params: z.object({ id: z.string() }) }),
  asyncHandler(takeoverLeadHandler)
);

router.patch(
  '/:id/handback',
  validate({ params: z.object({ id: z.string() }) }),
  asyncHandler(handbackLeadHandler)
);

export default router;
