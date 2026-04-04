import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '@/utils/asyncHandler';
import { validate } from '@/middleware/validate.middleware';
import {
  listCampaignsHandler,
  createCampaignHandler,
  getCampaignHandler,
  updateCampaignHandler,
} from '@/controllers/campaigns.controller';

const router = Router();

const CreateCampaignSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  icpDescription: z.string().min(10, 'ICP description must be at least 10 characters'),
});

const UpdateCampaignSchema = z.object({
  status: z.enum(['draft', 'active', 'paused', 'completed']),
});

router.get('/', asyncHandler(listCampaignsHandler));

router.post(
  '/',
  validate({ body: CreateCampaignSchema }),
  asyncHandler(createCampaignHandler)
);

router.get(
  '/:id',
  validate({ params: z.object({ id: z.string() }) }),
  asyncHandler(getCampaignHandler)
);

router.patch(
  '/:id',
  validate({
    params: z.object({ id: z.string() }),
    body: UpdateCampaignSchema,
  }),
  asyncHandler(updateCampaignHandler)
);

export default router;
