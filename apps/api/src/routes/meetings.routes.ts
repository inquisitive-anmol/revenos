import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '@/utils/asyncHandler';
import { validate } from '@/middleware/validate.middleware';
import {
  listMeetingsHandler,
  getMeetingHandler,
  createMeetingHandler,
  updateMeetingOutcomeHandler,
  cancelMeetingHandler,
} from '@/controllers/meeting.controller';

const router = Router();

// ── Shared param schema ────────────────────────────────────────────────────────
const MeetingIdParams = z.object({ id: z.string().min(1) });

const MeetingOutcomeValues = ['completed', 'no_show', 'rescheduled', 'cancelled'] as const;

// ── Query schemas ──────────────────────────────────────────────────────────────
const ListMeetingsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

// ── Body schemas ───────────────────────────────────────────────────────────────
const CreateMeetingBodySchema = z.object({
  leadId: z.string().min(1, 'leadId is required'),
  campaignId: z.string().min(1, 'campaignId is required'),
  scheduledAt: z.string().datetime({ message: 'scheduledAt must be a valid ISO 8601 date' }),
  calendarEventId: z.string().optional(),
});

const UpdateOutcomeBodySchema = z.object({
  outcome: z.enum(MeetingOutcomeValues, {
    errorMap: () => ({
      message: `outcome must be one of: ${MeetingOutcomeValues.join(', ')}`,
    }),
  }),
});

// ── Routes ─────────────────────────────────────────────────────────────────────

// GET /api/v1/meetings — list all meetings for workspace
router.get(
  '/',
  validate({ query: ListMeetingsQuerySchema }),
  asyncHandler(listMeetingsHandler),
);

// POST /api/v1/meetings — schedule a new meeting
router.post(
  '/',
  validate({ body: CreateMeetingBodySchema }),
  asyncHandler(createMeetingHandler),
);

// GET /api/v1/meetings/:id — get meeting by ID
router.get(
  '/:id',
  validate({ params: MeetingIdParams }),
  asyncHandler(getMeetingHandler),
);

// PATCH /api/v1/meetings/:id/outcome — update meeting outcome
router.patch(
  '/:id/outcome',
  validate({ params: MeetingIdParams, body: UpdateOutcomeBodySchema }),
  asyncHandler(updateMeetingOutcomeHandler),
);

// DELETE /api/v1/meetings/:id — cancel meeting (soft-delete via outcome)
router.delete(
  '/:id',
  validate({ params: MeetingIdParams }),
  asyncHandler(cancelMeetingHandler),
);

export default router;
