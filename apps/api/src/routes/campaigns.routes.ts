import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '@/utils/asyncHandler';
import { validate } from '@/middleware/validate.middleware';
import {
  listCampaignsHandler,
  createCampaignHandler,
  getCampaignHandler,
  updateCampaignHandler,
  prospectCampaignHandler,
} from '@/controllers/campaigns.controller';

const router = Router();

const CreateCampaignSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  icpDescription: z.string().min(10, 'ICP description must be at least 10 characters'),
});

const UpdateCampaignSchema = z.object({
  status: z.enum(['draft', 'active', 'paused', 'completed']),
});

const ProspectCampaignSchema = z.object({
  leads: z.array(
    z.object({
      email: z.string().email(),
      firstName: z.string(),
      lastName: z.string(),
      company: z.string(),
      title: z.string(),
      linkedinUrl: z.string().url().optional(),
      companySize: z.number().optional(),
      industry: z.string().optional(),
    })
  ).min(1, 'leads array is required and must not be empty'),
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

router.post(
  '/:id/prospect',
  validate({
    params: z.object({ id: z.string() }),
    body: ProspectCampaignSchema,
  }),
  asyncHandler(prospectCampaignHandler)
);

export default router;
